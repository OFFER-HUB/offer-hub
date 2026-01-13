/**
 * Pagination types for list endpoints
 * @see docs/api/overview.md
 */

export interface PaginationParams {
    limit?: number;
    cursor?: string;
}

export interface PaginationMeta {
    has_more: boolean;
    next_cursor?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}

/**
 * Default and max pagination limits
 */
export const PAGINATION_DEFAULTS = {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
} as const;
