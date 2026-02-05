import { BaseResource } from './base';
import type { CreateUserRequest, User, LinkAirtmRequest, LinkAirtmResponse } from '../types';

/**
 * Users resource client
 * Handles user management operations
 */
export class UsersResource extends BaseResource {
    /**
     * Create a new user with balance
     * This endpoint is idempotent - if a user with the same externalUserId exists,
     * it returns the existing user instead of creating a new one
     *
     * @param data - User creation data
     * @returns Promise resolving to the created/existing user
     *
     * @example
     * ```typescript
     * const user = await sdk.users.create({
     *   externalUserId: 'user_123',
     *   email: 'user@example.com',
     *   type: 'BUYER'
     * });
     * ```
     */
    async create(data: CreateUserRequest): Promise<User> {
        const response = await this.client.post<{ data: User }>('users', data);
        return response.data;
    }

    /**
     * Link a user's Airtm account
     * Verifies the user's email against Airtm and stores the linkage
     * If already linked, returns current link information
     *
     * @param userId - User ID
     * @param data - Airtm linking data
     * @returns Promise resolving to link information
     *
     * @example
     * ```typescript
     * const linkInfo = await sdk.users.linkAirtm('usr_123', {
     *   email: 'user@example.com'
     * });
     * ```
     */
    async linkAirtm(userId: string, data: LinkAirtmRequest): Promise<LinkAirtmResponse> {
        const response = await this.client.post<{ data: LinkAirtmResponse }>(
            `users/${userId}/airtm/link`,
            data,
        );
        return response.data;
    }
}
