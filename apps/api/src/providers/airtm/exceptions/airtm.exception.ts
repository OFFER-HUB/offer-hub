import { HttpException, HttpStatus } from '@nestjs/common';
import { ERROR_CODES, ERROR_MESSAGES, ERROR_HTTP_STATUS, type ErrorCode } from '@offerhub/shared';

/**
 * Exception thrown when Airtm API returns an error or is unavailable.
 */
export class AirtmProviderException extends HttpException {
    readonly code: string;
    readonly provider = 'AIRTM';

    constructor(
        message: string,
        method: string,
        path: string,
        statusCode: number = HttpStatus.BAD_GATEWAY,
        _originalError?: unknown,
    ) {
        const errorCode = AirtmProviderException.mapStatusToErrorCode(statusCode);
        const errorMessage = message || ERROR_MESSAGES[errorCode as ErrorCode];

        super(
            {
                error: {
                    code: errorCode,
                    message: errorMessage,
                    details: {
                        provider: 'AIRTM',
                        method: method.toUpperCase(),
                        path: AirtmProviderException.maskPath(path),
                        originalStatus: statusCode,
                    },
                },
            },
            ERROR_HTTP_STATUS[errorCode as ErrorCode] || HttpStatus.BAD_GATEWAY,
        );

        this.code = errorCode;
    }

    /**
     * Maps HTTP status codes from Airtm to internal error codes.
     */
    private static mapStatusToErrorCode(statusCode: number): string {
        if (statusCode === 429) {
            return ERROR_CODES.PROVIDER_RATE_LIMITED;
        }
        if (statusCode === 408 || statusCode === 504) {
            return ERROR_CODES.PROVIDER_TIMEOUT;
        }
        return ERROR_CODES.PROVIDER_ERROR;
    }

    /**
     * Masks sensitive data in the request path for logging.
     */
    private static maskPath(path: string): string {
        // Mask any IDs or tokens that are 20+ characters
        return path.replace(/[a-zA-Z0-9_-]{20,}/g, '***');
    }
}

/**
 * Exception thrown when Airtm user verification fails.
 */
export class AirtmUserVerificationException extends HttpException {
    constructor(
        failureReason: 'USER_NOT_FOUND' | 'USER_INACTIVE' | 'USER_NOT_VERIFIED',
        email?: string,
    ) {
        const messages: Record<string, string> = {
            USER_NOT_FOUND: 'User not found in Airtm',
            USER_INACTIVE: 'Airtm user account is not active',
            USER_NOT_VERIFIED: 'Airtm user has not completed KYC verification',
        };

        super(
            {
                error: {
                    code: ERROR_CODES.AIRTM_USER_INVALID,
                    message: messages[failureReason],
                    details: {
                        failureReason,
                        email: email ? AirtmUserVerificationException.maskEmail(email) : undefined,
                    },
                },
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
        );
    }

    /**
     * Masks email for safe logging.
     */
    private static maskEmail(email: string): string {
        const [local, domain] = email.split('@');
        if (!domain) return '***@***';
        const maskedLocal = local.length > 2 ? `${local.slice(0, 2)}***` : '***';
        return `${maskedLocal}@${domain}`;
    }
}

/**
 * Exception thrown when webhook signature verification fails.
 */
export class AirtmWebhookSignatureException extends HttpException {
    constructor(svixId?: string) {
        super(
            {
                error: {
                    code: ERROR_CODES.WEBHOOK_SIGNATURE_INVALID,
                    message: 'Invalid webhook signature',
                    details: {
                        provider: 'AIRTM',
                        svixId,
                    },
                },
            },
            HttpStatus.UNAUTHORIZED,
        );
    }
}
