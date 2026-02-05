/**
 * Base error class for all OfferHub SDK errors
 */
export class OfferHubError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly statusCode: number,
        public readonly details?: any,
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Authentication errors (401)
 */
export class AuthenticationError extends OfferHubError {
    constructor(message: string, details?: any) {
        super(message, 'AUTHENTICATION_FAILED', 401, details);
    }
}

/**
 * Authorization errors (403)
 */
export class AuthorizationError extends OfferHubError {
    constructor(message: string, details?: any) {
        super(message, 'AUTHORIZATION_FAILED', 403, details);
    }
}

/**
 * Resource not found errors (404)
 */
export class NotFoundError extends OfferHubError {
    constructor(resource: string, id: string, details?: any) {
        super(`${resource} with id ${id} not found`, 'RESOURCE_NOT_FOUND', 404, details);
    }
}

/**
 * Validation errors (400)
 */
export class ValidationError extends OfferHubError {
    constructor(message: string, public readonly fields?: Record<string, string[]>, details?: any) {
        super(message, 'VALIDATION_ERROR', 400, details);
    }
}

/**
 * Insufficient funds error (402)
 */
export class InsufficientFundsError extends OfferHubError {
    constructor(
        public readonly userId: string,
        public readonly required: string,
        public readonly available: string,
        details?: any,
    ) {
        super(
            `Insufficient funds. Required: ${required}, Available: ${available}`,
            'INSUFFICIENT_FUNDS',
            402,
            details,
        );
    }
}

/**
 * Invalid state transition error (409)
 */
export class InvalidTransitionError extends OfferHubError {
    constructor(
        public readonly resource: string,
        public readonly currentState: string,
        public readonly targetState: string,
        details?: any,
    ) {
        super(
            `Invalid transition for ${resource}: ${currentState} -> ${targetState}`,
            'INVALID_TRANSITION',
            409,
            details,
        );
    }
}

/**
 * Idempotency key conflict (409)
 */
export class IdempotencyError extends OfferHubError {
    constructor(message: string, details?: any) {
        super(message, 'IDEMPOTENCY_ERROR', 409, details);
    }
}

/**
 * Provider errors (502/503)
 */
export class ProviderError extends OfferHubError {
    constructor(message: string, public readonly provider: string, details?: any) {
        super(message, 'PROVIDER_ERROR', 502, details);
    }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends OfferHubError {
    constructor(public readonly retryAfter?: number, details?: any) {
        super(
            `Rate limit exceeded${retryAfter ? `. Retry after ${retryAfter}s` : ''}`,
            'RATE_LIMIT_EXCEEDED',
            429,
            details,
        );
    }
}

/**
 * Network/connection errors
 */
export class NetworkError extends OfferHubError {
    constructor(message: string, public readonly originalError?: Error) {
        super(message, 'NETWORK_ERROR', 0, { originalError: originalError?.message });
    }
}

/**
 * Parse API error response and return appropriate error instance
 */
export function parseError(response: { status: number; data?: any }): OfferHubError {
    const { status, data } = response;
    const message = data?.message || data?.error || 'An unknown error occurred';
    const code = data?.code || 'UNKNOWN_ERROR';
    const details = data?.details;

    // Map by status code
    switch (status) {
        case 401:
            return new AuthenticationError(message, details);
        case 403:
            return new AuthorizationError(message, details);
        case 404:
            return new NotFoundError(
                data?.resource || 'Resource',
                data?.id || 'unknown',
                details,
            );
        case 400:
            return new ValidationError(message, data?.fields, details);
        case 429:
            return new RateLimitError(data?.retryAfter, details);
    }

    // Map by error code
    switch (code) {
        case 'INSUFFICIENT_FUNDS':
            return new InsufficientFundsError(
                data?.userId,
                data?.required,
                data?.available,
                details,
            );
        case 'INVALID_TRANSITION':
            return new InvalidTransitionError(
                data?.resource,
                data?.currentState,
                data?.targetState,
                details,
            );
        case 'IDEMPOTENCY_ERROR':
            return new IdempotencyError(message, details);
        case 'PROVIDER_ERROR':
        case 'PROVIDER_TIMEOUT':
        case 'PROVIDER_UNAVAILABLE':
            return new ProviderError(message, data?.provider || 'Unknown', details);
    }

    // Generic error
    return new OfferHubError(message, code, status, details);
}
