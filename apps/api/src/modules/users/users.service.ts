import { Injectable, Inject, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AirtmUserClient } from '../../providers/airtm';
import { EventBusService, EVENT_CATALOG } from '../events';
import { UserCreatedPayload, UserAirtmLinkedPayload } from '../events/types';
import { ERROR_CODES, generateUserId } from '@offerhub/shared';
import { CreateUserDto, LinkAirtmDto } from './dto';
import type { UserType as PrismaUserType } from '@prisma/client';

/**
 * User response interface
 */
export interface UserResponse {
    id: string;
    externalUserId: string;
    email: string | null;
    type: string;
    status: string;
    balance: {
        available: string;
        reserved: string;
        currency: string;
    };
    airtmLinked: boolean;
    airtmUserId?: string | null;
    airtmLinkedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * Airtm link response interface
 */
export interface AirtmLinkResponse {
    userId: string;
    airtmUserId: string;
    airtmLinkedAt: string;
    eligible: boolean;
    email: string;
}

/**
 * Users Service
 *
 * Handles user registration and Airtm account linking.
 *
 * Features:
 * - Idempotent user creation (by externalUserId)
 * - Automatic balance record creation
 * - Airtm account verification and linking
 */
@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @Inject(PrismaService) private readonly prisma: PrismaService,
        @Inject(AirtmUserClient) private readonly airtmUser: AirtmUserClient,
        @Inject(EventBusService) private readonly eventBus: EventBusService,
    ) { }

    /**
     * Creates a new user with an associated balance record.
     * This operation is idempotent - if a user with the same externalUserId exists,
     * it returns the existing user instead of throwing an error.
     *
     * @param dto - User creation data
     * @returns User with balance information
     */
    async createUser(dto: CreateUserDto): Promise<UserResponse> {
        this.logger.log(`Creating user with externalUserId: ${dto.externalUserId}`);

        // Check if user already exists (idempotency)
        const existingUser = await this.prisma.user.findUnique({
            where: { externalUserId: dto.externalUserId },
            include: {
                balance: true,
            },
        });

        if (existingUser) {
            this.logger.debug(`User already exists with externalUserId: ${dto.externalUserId}, returning existing user`);
            return this.formatUserResponse(existingUser);
        }

        // Generate prefixed user ID
        const userId = generateUserId();

        // Create user and balance in a transaction
        const user = await this.prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    id: userId,
                    externalUserId: dto.externalUserId,
                    email: dto.email,
                    type: dto.type as PrismaUserType,
                    status: 'ACTIVE',
                },
            });

            // Create associated balance record with 0.00 available/reserved
            const balance = await tx.balance.create({
                data: {
                    userId: newUser.id,
                    available: '0.00',
                    reserved: '0.00',
                    currency: 'USD',
                },
            });

            return { ...newUser, balance };
        });

        this.logger.log(`User created successfully: ${userId}`);

        // Emit USER_CREATED event
        this.eventBus.emit<UserCreatedPayload>({
            eventType: EVENT_CATALOG.USER_CREATED,
            aggregateId: userId,
            aggregateType: 'User',
            payload: {
                userId,
                externalUserId: dto.externalUserId,
                email: dto.email,
                type: dto.type as any,
                status: 'ACTIVE',
            },
            metadata: EventBusService.createMetadata({ userId }),
        });

        return this.formatUserResponse(user);
    }

    /**
     * Links a user's Airtm account by verifying their email against Airtm.
     * If the user is already linked, returns the current link information.
     *
     * @param userId - Internal user ID
     * @param dto - Airtm linking data (email)
     * @returns Airtm link information
     * @throws NotFoundException if user does not exist
     * @throws BadRequestException if Airtm verification fails
     */
    async linkAirtm(userId: string, dto: LinkAirtmDto): Promise<AirtmLinkResponse> {
        this.logger.log(`Linking Airtm account for user ${userId} with email: ${dto.email}`);

        // Find user
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

        // If already linked, return current link info
        if (user.airtmUserId && user.airtmLinkedAt) {
            this.logger.debug(`User ${userId} already has Airtm linked, returning current link`);
            return {
                userId: user.id,
                airtmUserId: user.airtmUserId,
                airtmLinkedAt: user.airtmLinkedAt.toISOString(),
                eligible: true,
                email: dto.email,
            };
        }

        // Verify user eligibility with Airtm
        const verification = await this.airtmUser.verifyUserEligibility(dto.email);

        if (!verification.eligible) {
            const errorMessage = this.getVerificationErrorMessage(verification.failureReason);
            this.logger.warn(
                `Airtm verification failed for user ${userId}: ${verification.failureReason}`,
            );
            throw new BadRequestException({
                error: {
                    code: verification.failureReason || 'AIRTM_USER_INVALID',
                    message: errorMessage,
                },
            });
        }

        // Update user with Airtm information
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                airtmUserId: verification.airtmUserId,
                airtmLinkedAt: new Date(),
            },
        });

        this.logger.log(`Airtm account linked successfully for user ${userId}`);

        // Emit USER_AIRTM_LINKED event
        this.eventBus.emit<UserAirtmLinkedPayload>({
            eventType: EVENT_CATALOG.USER_AIRTM_LINKED,
            aggregateId: userId,
            aggregateType: 'User',
            payload: {
                userId,
                airtmUserId: verification.airtmUserId!,
                linkedAt: updatedUser.airtmLinkedAt!.toISOString(),
            },
            metadata: EventBusService.createMetadata({ userId }),
        });

        return {
            userId: updatedUser.id,
            airtmUserId: verification.airtmUserId!,
            airtmLinkedAt: updatedUser.airtmLinkedAt!.toISOString(),
            eligible: true,
            email: dto.email,
        };
    }

    /**
     * Finds a user by ID.
     *
     * @param userId - Internal user ID
     * @returns User with balance information
     * @throws NotFoundException if user does not exist
     */
    async findById(userId: string): Promise<UserResponse> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                balance: true,
            },
        });

        if (!user) {
            throw new NotFoundException({
                error: {
                    code: ERROR_CODES.USER_NOT_FOUND,
                    message: 'User not found',
                },
            });
        }

        return this.formatUserResponse(user);
    }

    /**
     * Formats user data for API response.
     */
    private formatUserResponse(user: any): UserResponse {
        return {
            id: user.id,
            externalUserId: user.externalUserId,
            email: user.email,
            type: user.type,
            status: user.status,
            balance: {
                available: user.balance?.available || '0.00',
                reserved: user.balance?.reserved || '0.00',
                currency: user.balance?.currency || 'USD',
            },
            airtmLinked: !!user.airtmUserId,
            airtmUserId: user.airtmUserId,
            airtmLinkedAt: user.airtmLinkedAt?.toISOString() || null,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        };
    }

    /**
     * Gets a human-readable error message for Airtm verification failures.
     */
    private getVerificationErrorMessage(reason?: string): string {
        switch (reason) {
            case 'USER_NOT_FOUND':
                return 'Email not registered in Airtm';
            case 'USER_INACTIVE':
                return 'Airtm user account is inactive';
            case 'USER_NOT_VERIFIED':
                return 'Airtm user has not completed KYC verification';
            default:
                return 'Airtm verification failed';
        }
    }
}
