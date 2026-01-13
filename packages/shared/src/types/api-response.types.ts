/**
 * API Response types
 * @see docs/api/errors.md
 */

/**
 * Standard error response format
 */
export interface ApiErrorResponse {
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
}

/**
 * Validation error field detail
 */
export interface ValidationFieldError {
    field: string;
    message: string;
}

/**
 * Validation error details
 */
export interface ValidationErrorDetails {
    fields: ValidationFieldError[];
}

/**
 * Timestamps included in most responses
 */
export interface Timestamps {
    created_at: string;
    updated_at: string;
}
