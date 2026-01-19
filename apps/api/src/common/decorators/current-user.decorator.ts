import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Request user interface populated by auth guards.
 */
export interface RequestUser {
    userId: string;
    marketplaceId: string;
    scopes: string[];
}

/**
 * Decorator to extract user information from the authenticated request.
 *
 * Usage:
 * - @CurrentUser() user: RequestUser - Get the full user object
 * - @CurrentUser('userId') userId: string - Get a specific property
 *
 * The user object is populated by the ApiKeyGuard after successful authentication.
 */
export const CurrentUser = createParamDecorator(
    (data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user as RequestUser | undefined;

        if (!user) {
            return undefined;
        }

        return data ? user[data] : user;
    },
);
