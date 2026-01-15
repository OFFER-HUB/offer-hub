import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger, Inject } from '@nestjs/common';
import { Observable, tap, catchError, throwError, from, switchMap } from 'rxjs';
import { IdempotencyService } from '../../modules/idempotency/idempotency.service';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
    private readonly logger = new Logger(IdempotencyInterceptor.name);
    private idempotencyService: IdempotencyService;

    constructor(@Inject(IdempotencyService) idempotencyService: IdempotencyService) {
        this.idempotencyService = idempotencyService;
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const key = request['idempotencyKey'];
        const marketplaceId = request['marketplaceId'];

        if (!key) return next.handle();

        return next.handle().pipe(
            tap(async (body) => {
                const status = response.statusCode;
                if (!this.idempotencyService) return;

                if (status < 500 && status !== 401 && status !== 403) {
                    await this.idempotencyService.complete(key, marketplaceId, status, body);
                } else {
                    await this.idempotencyService.releaseLock(key, marketplaceId);
                }
            }),
            catchError((err) => {
                if (!this.idempotencyService) return throwError(() => err);
                return from(this.idempotencyService.releaseLock(key, marketplaceId)).pipe(
                    switchMap(() => throwError(() => err))
                );
            })
        );
    }
}
