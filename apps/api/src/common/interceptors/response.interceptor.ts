import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface StandardSuccessResponse<T> {
    data: T;
    meta?: {
        requestId?: string;
        timestamp?: string;
        pagination?: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, StandardSuccessResponse<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<StandardSuccessResponse<T>> {
        const request = context.switchToHttp().getRequest<Request>();
        const requestId = request.headers['x-request-id'] as string;

        return next.handle().pipe(
            map((data) => {
                if (this.isAlreadyWrapped(data)) {
                    return data;
                }

                if (this.isErrorResponse(data)) {
                    return data;
                }

                const result: StandardSuccessResponse<T> = {
                    data,
                    meta: {
                        requestId,
                        timestamp: new Date().toISOString(),
                    },
                };

                if (this.hasPagination(data)) {
                    result.meta!.pagination = data.pagination;
                    result.data = data.items;
                }

                return result;
            }),
        );
    }

    private isAlreadyWrapped(data: any): boolean {
        return (
            data !== null &&
            typeof data === 'object' &&
            'data' in data &&
            ('meta' in data || Object.keys(data).length === 1)
        );
    }

    private isErrorResponse(data: any): boolean {
        return (
            data !== null &&
            typeof data === 'object' &&
            'error' in data
        );
    }

    private hasPagination(data: any): boolean {
        return (
            data !== null &&
            typeof data === 'object' &&
            'items' in data &&
            'pagination' in data &&
            typeof data.pagination === 'object' &&
            'page' in data.pagination &&
            'limit' in data.pagination &&
            'total' in data.pagination
        );
    }
}
