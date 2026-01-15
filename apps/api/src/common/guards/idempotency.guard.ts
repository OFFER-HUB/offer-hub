import { Injectable, CanActivate, ExecutionContext, BadRequestException, Logger, Inject } from '@nestjs/common';
import { IdempotencyService } from '../../modules/idempotency/idempotency.service';
import { isValidUuidV4 } from '@offerhub/shared';
import { IdempotencyReplayException } from '../exceptions/idempotency-replay.exception';

@Injectable()
export class IdempotencyGuard implements CanActivate {
    private readonly logger = new Logger(IdempotencyGuard.name);
    private idempotencyService: IdempotencyService;

    constructor(@Inject(IdempotencyService) idempotencyService: IdempotencyService) {
        this.idempotencyService = idempotencyService;
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // Only intercept POST, PUT, PATCH
        if (!['POST', 'PUT', 'PATCH'].includes(request.method)) {
            return true;
        }

        const key = request.headers['idempotency-key'];

        // If no idempotency key, proceed without idempotency logic
        if (!key) {
            return true;
        }

        // Validate key is UUID v4
        if (!isValidUuidV4(key as string)) {
            throw new BadRequestException({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Idempotency-Key must be a valid UUID v4',
                    details: { header: 'Idempotency-Key' }
                }
            });
        }

        const apiKey = request['apiKey'];
        const marketplaceId = apiKey?.id || 'anonymous';

        const result = await this.idempotencyService.checkOrLock(key as string, marketplaceId, request.body);

        if (result.status === 'REPLAY') {
            this.logger.log(`Replay detected for key: ${key}`);
            throw new IdempotencyReplayException(result.response!);
        }

        // Add key to request for the interceptor and filter to use later
        request['idempotencyKey'] = key;
        request['marketplaceId'] = marketplaceId;

        return true;
    }
}
