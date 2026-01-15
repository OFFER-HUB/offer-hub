import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
    BadRequestException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import {
    ERROR_CODES,
    ERROR_MESSAGES,
    ErrorCode,
} from '@offerhub/shared';

interface StandardErrorResponse {
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const requestId = request.headers['x-request-id'] as string | undefined;
        const { status, errorResponse } = this.buildErrorResponse(exception, requestId);

        this.logError(exception, request, status, requestId);

        if (requestId) {
            response.setHeader('X-Request-ID', requestId);
        }

        response.status(status).json(errorResponse);
    }

    private buildErrorResponse(
        exception: unknown,
        requestId?: string,
    ): { status: number; errorResponse: StandardErrorResponse } {
        const isProduction = process.env.NODE_ENV === 'production';

        // Handle NestJS HttpException (includes BadRequestException, etc.)
        if (exception instanceof HttpException) {
            return this.handleHttpException(exception, isProduction, requestId);
        }

        // Handle unknown errors
        return this.handleUnknownError(exception, isProduction, requestId);
    }

    private handleHttpException(
        exception: HttpException,
        isProduction: boolean,
        requestId?: string,
    ): { status: number; errorResponse: StandardErrorResponse } {
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        // Check if it's already in our standard format
        if (this.isStandardErrorResponse(exceptionResponse)) {
            return { status, errorResponse: exceptionResponse };
        }

        // Handle class-validator errors (BadRequestException with validation errors)
        if (exception instanceof BadRequestException) {
            const validationErrors = this.extractValidationErrors(exceptionResponse);
            if (validationErrors) {
                return {
                    status: HttpStatus.BAD_REQUEST,
                    errorResponse: {
                        error: {
                            code: ERROR_CODES.VALIDATION_ERROR,
                            message: ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR],
                            details: {
                                validationErrors,
                                ...(requestId && { requestId }),
                            },
                        },
                    },
                };
            }
        }

        // Map HTTP status to error code
        const errorCode = this.mapStatusToErrorCode(status);
        const message = this.extractMessage(exceptionResponse) || ERROR_MESSAGES[errorCode];

        return {
            status,
            errorResponse: {
                error: {
                    code: errorCode,
                    message,
                    details: requestId ? { requestId } : undefined,
                },
            },
        };
    }

    private handleUnknownError(
        exception: unknown,
        isProduction: boolean,
        requestId?: string,
    ): { status: number; errorResponse: StandardErrorResponse } {
        const status = HttpStatus.INTERNAL_SERVER_ERROR;
        const details: Record<string, unknown> = {};

        if (requestId) {
            details.requestId = requestId;
        }

        // In development, include error details for debugging
        if (!isProduction && exception instanceof Error) {
            details.error = exception.message;
            details.stack = exception.stack?.split('\n').slice(0, 5);
        }

        return {
            status,
            errorResponse: {
                error: {
                    code: ERROR_CODES.INTERNAL_ERROR,
                    message: isProduction
                        ? ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR]
                        : (exception instanceof Error ? exception.message : 'Unknown error'),
                    details: Object.keys(details).length > 0 ? details : undefined,
                },
            },
        };
    }

    private isStandardErrorResponse(response: unknown): response is StandardErrorResponse {
        return (
            typeof response === 'object' &&
            response !== null &&
            'error' in response &&
            typeof (response as StandardErrorResponse).error === 'object' &&
            'code' in (response as StandardErrorResponse).error &&
            'message' in (response as StandardErrorResponse).error
        );
    }

    private extractValidationErrors(
        exceptionResponse: string | object,
    ): string[] | null {
        if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
            const response = exceptionResponse as Record<string, unknown>;
            if (Array.isArray(response.message)) {
                return response.message as string[];
            }
        }
        return null;
    }

    private extractMessage(exceptionResponse: string | object): string | null {
        if (typeof exceptionResponse === 'string') {
            return exceptionResponse;
        }
        if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
            const response = exceptionResponse as Record<string, unknown>;
            if (typeof response.message === 'string') {
                return response.message;
            }
        }
        return null;
    }

    private mapStatusToErrorCode(status: number): ErrorCode {
        const statusToCode: Record<number, ErrorCode> = {
            400: ERROR_CODES.VALIDATION_ERROR,
            401: ERROR_CODES.UNAUTHORIZED,
            403: ERROR_CODES.INSUFFICIENT_SCOPE,
            404: ERROR_CODES.ORDER_NOT_FOUND, // Generic 404
            409: ERROR_CODES.INVALID_STATE,
            422: ERROR_CODES.INSUFFICIENT_FUNDS,
            429: ERROR_CODES.RATE_LIMITED,
            500: ERROR_CODES.INTERNAL_ERROR,
            502: ERROR_CODES.PROVIDER_ERROR,
            504: ERROR_CODES.PROVIDER_TIMEOUT,
        };

        return statusToCode[status] || ERROR_CODES.INTERNAL_ERROR;
    }

    private logError(
        exception: unknown,
        request: Request,
        status: number,
        requestId?: string,
    ): void {
        const logContext = {
            method: request.method,
            url: request.url,
            status,
            requestId,
        };

        if (status >= 500) {
            this.logger.error(
                `Server Error: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
                exception instanceof Error ? exception.stack : undefined,
                logContext,
            );
        } else if (status >= 400) {
            this.logger.warn(
                `Client Error: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
                logContext,
            );
        }
    }
}
