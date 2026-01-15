import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger, Inject } from '@nestjs/common';
import { Response } from 'express';
import { IdempotencyReplayException } from '../exceptions/idempotency-replay.exception';
import { IdempotencyService } from '../../modules/idempotency/idempotency.service';

@Catch()
export class IdempotencyFilter implements ExceptionFilter {
    private readonly logger = new Logger(IdempotencyFilter.name);
    private idempotencyService: IdempotencyService;

    constructor(@Inject(IdempotencyService) idempotencyService: IdempotencyService) {
        this.idempotencyService = idempotencyService;
    }

    async catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();

        if (exception instanceof IdempotencyReplayException) {
            this.logger.log('Serving replayed response');
            response.setHeader('Idempotency-Replay', 'true');
            return response.status(exception.responseData.status).json(exception.responseData.body);
        }

        const key = request['idempotencyKey'];
        const marketplaceId = request['marketplaceId'];

        if (key && marketplaceId && this.idempotencyService) {
            const status = exception instanceof HttpException ? exception.getStatus() : 500;
            try {
                if (status >= 500 || status === 401 || status === 403) {
                    await this.idempotencyService.releaseLock(key, marketplaceId);
                } else {
                    const body = exception.getResponse ? exception.getResponse() : exception;
                    await this.idempotencyService.complete(key, marketplaceId, status, body);
                }
            } catch (e) {
                this.logger.error(`Error during idempotency cleanup: ${e.message}`);
            }
        }

        const status = exception instanceof HttpException ? exception.getStatus() : 500;
        const body = exception.getResponse ? exception.getResponse() : { message: exception.message || 'Internal error' };

        if (!response.headersSent) {
            response.status(status).json(body);
        }
    }
}
