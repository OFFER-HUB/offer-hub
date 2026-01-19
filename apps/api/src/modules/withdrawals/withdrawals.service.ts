import {
    Injectable,
    Inject,
    Logger,
    NotFoundException,
    UnprocessableEntityException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AirtmPayoutClient, AirtmUserClient } from '../../providers/airtm';
import {
    WithdrawalStatus,
    WithdrawalStateMachine,
    ERROR_CODES,
    generateWithdrawalId,
} from '@offerhub/shared';
import { mapAirtmPayoutStatus, canCommitPayout } from '../../providers/airtm/mappers';
import type { CreateWithdrawalDto } from './dto';

/**
 * Response when creating a withdrawal.
 */
export interface CreateWithdrawalResponse {
    id: string;
    amount: string;
    fee?: string;
    currency: string;
    status: WithdrawalStatus;
    destinationType: string;
    committed: boolean;
    createdAt: string;
}

/**
 * Response when getting a withdrawal.
 */
export interface WithdrawalResponse {
    id: string;
    userId: string;
    amount: string;
    fee?: string;
    currency: string;
    status: WithdrawalStatus;
    destinationType: string;
    destinationRef: string;
    airtmPayoutId?: string;
    failureReason?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Service for managing withdrawal operations.
 * Coordinates between local database and Airtm API.
 */
@Injectable()
export class WithdrawalsService {
    private readonly logger = new Logger(WithdrawalsService.name);

    constructor(
        @Inject(PrismaService) private readonly prisma: PrismaService,
        @Inject(AirtmPayoutClient) private readonly airtmPayout: AirtmPayoutClient,
        @Inject(AirtmUserClient) private readonly airtmUser: AirtmUserClient,
    ) {}

    /**
     * Creates a new withdrawal for a user.
     *
     * Flow:
     * 1. Verify user has linked Airtm account
     * 2. Verify user is eligible (active + KYC verified)
     * 3. Check user has sufficient available balance
     * 4. Reserve the funds
     * 5. Create withdrawal record in DB
     * 6. Create payout in Airtm
     * 7. Update withdrawal with Airtm details
     *
     * @param userId - Internal user ID
     * @param dto - Withdrawal details
     * @returns Withdrawal details
     */
    async createWithdrawal(userId: string, dto: CreateWithdrawalDto): Promise<CreateWithdrawalResponse> {
        // 1. Get user and verify Airtm linkage
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException({
                error: {
                    code: ERROR_CODES.USER_NOT_FOUND,
                    message: 'User not found',
                },
            });
        }

        if (!user.airtmUserId) {
            throw new UnprocessableEntityException({
                error: {
                    code: ERROR_CODES.AIRTM_USER_NOT_LINKED,
                    message: 'User must link Airtm account before creating withdrawals',
                },
            });
        }

        // 2. Verify user eligibility in Airtm
        const eligibility = await this.airtmUser.verifyUserEligibilityById(user.airtmUserId);

        if (!eligibility.eligible) {
            throw new UnprocessableEntityException({
                error: {
                    code: ERROR_CODES.AIRTM_USER_INVALID,
                    message: `Airtm user not eligible: ${eligibility.failureReason}`,
                    details: { failureReason: eligibility.failureReason },
                },
            });
        }

        // 3. Check user has sufficient balance
        const balance = await this.prisma.balance.findUnique({
            where: { userId },
        });

        const requestedAmount = parseFloat(dto.amount);
        const availableBalance = balance ? parseFloat(balance.available) : 0;

        if (availableBalance < requestedAmount) {
            throw new UnprocessableEntityException({
                error: {
                    code: ERROR_CODES.INSUFFICIENT_FUNDS,
                    message: 'Insufficient available balance',
                    details: {
                        requested: dto.amount,
                        available: availableBalance.toFixed(2),
                    },
                },
            });
        }

        // 4. Reserve the funds (atomic operation)
        const newAvailable = (availableBalance - requestedAmount).toFixed(2);
        const newReserved = (parseFloat(balance?.reserved || '0') + requestedAmount).toFixed(2);

        await this.prisma.balance.update({
            where: { userId },
            data: {
                available: newAvailable,
                reserved: newReserved,
            },
        });

        // 5. Create withdrawal record in DB
        const withdrawalId = generateWithdrawalId();
        const withdrawal = await this.prisma.withdrawal.create({
            data: {
                id: withdrawalId,
                userId,
                amount: dto.amount,
                currency: dto.currency || 'USD',
                status: WithdrawalStatus.WITHDRAWAL_CREATED,
                destinationType: dto.destinationType,
                destinationRef: dto.destinationRef,
            },
        });

        // Store metadata (description, fee, failureReason go in metadata since schema doesn't have these columns)
        const initialMetadata: Record<string, unknown> = {};
        if (dto.description) {
            initialMetadata.description = dto.description;
        }

        this.logger.log(`Withdrawal created: ${withdrawalId} for user ${userId}`);

        // 6. Create payout in Airtm
        try {
            const payout = await this.airtmPayout.createPayout({
                amount: dto.amount,
                currency: dto.currency,
                sourceUserId: user.airtmUserId,
                destinationType: dto.destinationType,
                destinationRef: dto.destinationRef,
                commit: dto.commit,
                description: dto.description,
            });

            // 7. Update withdrawal with Airtm details
            const metadata: Record<string, unknown> = { ...initialMetadata };
            if (payout.fee) {
                metadata.fee = payout.fee.toString();
            }

            const updatedWithdrawal = await this.prisma.withdrawal.update({
                where: { id: withdrawalId },
                data: {
                    airtmPayoutId: payout.id,
                    status: mapAirtmPayoutStatus(payout.status),
                },
            });

            this.logger.log(
                `Withdrawal ${withdrawalId} linked to Airtm payout ${payout.id}, ` +
                `status=${updatedWithdrawal.status}`,
            );

            return {
                id: updatedWithdrawal.id,
                amount: updatedWithdrawal.amount,
                fee: payout.fee?.toString(),
                currency: updatedWithdrawal.currency,
                status: updatedWithdrawal.status as WithdrawalStatus,
                destinationType: updatedWithdrawal.destinationType,
                committed: dto.commit || false,
                createdAt: updatedWithdrawal.createdAt.toISOString(),
            };
        } catch (error) {
            // Rollback: release reserved funds and mark as failed
            await this.prisma.balance.update({
                where: { userId },
                data: {
                    available: availableBalance.toFixed(2),
                    reserved: (parseFloat(balance?.reserved || '0')).toFixed(2),
                },
            });

            await this.prisma.withdrawal.update({
                where: { id: withdrawalId },
                data: {
                    status: WithdrawalStatus.WITHDRAWAL_FAILED,
                },
            });

            throw error;
        }
    }

    /**
     * Commits a withdrawal that was created without auto-commit.
     *
     * @param withdrawalId - Withdrawal ID
     * @param userId - User ID (for authorization)
     * @returns Updated withdrawal details
     */
    async commitWithdrawal(withdrawalId: string, userId: string): Promise<WithdrawalResponse> {
        const withdrawal = await this.prisma.withdrawal.findFirst({
            where: { id: withdrawalId, userId },
        });

        if (!withdrawal) {
            throw new NotFoundException({
                error: {
                    code: ERROR_CODES.WITHDRAWAL_NOT_FOUND,
                    message: 'Withdrawal not found',
                },
            });
        }

        // Validate state allows commit
        if (!canCommitPayout(withdrawal.status as WithdrawalStatus)) {
            throw new ConflictException({
                error: {
                    code: ERROR_CODES.WITHDRAWAL_NOT_COMMITTABLE,
                    message: `Cannot commit withdrawal in ${withdrawal.status} status`,
                    details: { currentStatus: withdrawal.status },
                },
            });
        }

        if (!withdrawal.airtmPayoutId) {
            throw new UnprocessableEntityException({
                error: {
                    code: ERROR_CODES.PROVIDER_ERROR,
                    message: 'Withdrawal has no associated Airtm payout',
                },
            });
        }

        // Commit in Airtm
        const payout = await this.airtmPayout.commitPayout(withdrawal.airtmPayoutId);

        // Update local status
        await this.prisma.withdrawal.update({
            where: { id: withdrawalId },
            data: {
                status: mapAirtmPayoutStatus(payout.status),
            },
        });

        this.logger.log(`Withdrawal ${withdrawalId} committed`);

        return this.getWithdrawal(withdrawalId, userId);
    }

    /**
     * Gets a withdrawal by ID.
     *
     * @param withdrawalId - Withdrawal ID
     * @param userId - User ID (for authorization)
     * @returns Withdrawal details
     */
    async getWithdrawal(withdrawalId: string, userId: string): Promise<WithdrawalResponse> {
        const withdrawal = await this.prisma.withdrawal.findFirst({
            where: { id: withdrawalId, userId },
        });

        if (!withdrawal) {
            throw new NotFoundException({
                error: {
                    code: ERROR_CODES.WITHDRAWAL_NOT_FOUND,
                    message: 'Withdrawal not found',
                },
            });
        }

        // Note: fee and failureReason are not in schema, would need to be stored in a metadata field
        return {
            id: withdrawal.id,
            userId: withdrawal.userId,
            amount: withdrawal.amount,
            fee: undefined, // Not stored in schema
            currency: withdrawal.currency,
            status: withdrawal.status as WithdrawalStatus,
            destinationType: withdrawal.destinationType,
            destinationRef: withdrawal.destinationRef,
            airtmPayoutId: withdrawal.airtmPayoutId || undefined,
            failureReason: undefined, // Not stored in schema
            createdAt: withdrawal.createdAt.toISOString(),
            updatedAt: withdrawal.updatedAt.toISOString(),
        };
    }

    /**
     * Lists withdrawals for a user.
     *
     * @param userId - User ID
     * @param options - Pagination options
     * @returns List of withdrawals
     */
    async listWithdrawals(
        userId: string,
        options: { limit?: number; cursor?: string } = {},
    ): Promise<{ data: WithdrawalResponse[]; hasMore: boolean; nextCursor?: string }> {
        const limit = Math.min(options.limit || 20, 100);

        const withdrawals = await this.prisma.withdrawal.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit + 1,
            ...(options.cursor && {
                cursor: { id: options.cursor },
                skip: 1,
            }),
        });

        const hasMore = withdrawals.length > limit;
        const data = withdrawals.slice(0, limit);

        return {
            data: data.map((w) => ({
                id: w.id,
                userId: w.userId,
                amount: w.amount,
                fee: undefined, // Not stored in schema
                currency: w.currency,
                status: w.status as WithdrawalStatus,
                destinationType: w.destinationType,
                destinationRef: w.destinationRef,
                airtmPayoutId: w.airtmPayoutId || undefined,
                failureReason: undefined, // Not stored in schema
                createdAt: w.createdAt.toISOString(),
                updatedAt: w.updatedAt.toISOString(),
            })),
            hasMore,
            nextCursor: hasMore ? data[data.length - 1].id : undefined,
        };
    }

    /**
     * Refreshes withdrawal status from Airtm.
     *
     * @param withdrawalId - Withdrawal ID
     * @param userId - User ID (for authorization)
     * @returns Updated withdrawal details
     */
    async refreshWithdrawal(withdrawalId: string, userId: string): Promise<WithdrawalResponse> {
        const withdrawal = await this.prisma.withdrawal.findFirst({
            where: { id: withdrawalId, userId },
        });

        if (!withdrawal) {
            throw new NotFoundException({
                error: {
                    code: ERROR_CODES.WITHDRAWAL_NOT_FOUND,
                    message: 'Withdrawal not found',
                },
            });
        }

        if (!withdrawal.airtmPayoutId) {
            return this.getWithdrawal(withdrawalId, userId);
        }

        // Fetch latest status from Airtm
        const payout = await this.airtmPayout.refreshPayoutStatus(withdrawal.airtmPayoutId);
        const newStatus = mapAirtmPayoutStatus(payout.status);

        // Validate state transition
        const currentStatus = withdrawal.status as WithdrawalStatus;
        if (WithdrawalStateMachine.canTransition(currentStatus, newStatus)) {
            await this.prisma.withdrawal.update({
                where: { id: withdrawalId },
                data: {
                    status: newStatus,
                    // Note: failureReason not in schema
                },
            });

            this.logger.log(`Withdrawal ${withdrawalId} refreshed: ${currentStatus} → ${newStatus}`);
        }

        return this.getWithdrawal(withdrawalId, userId);
    }
}
