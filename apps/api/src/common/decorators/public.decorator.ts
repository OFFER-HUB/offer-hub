import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to mark an endpoint as public (no authentication required).
 * Use this to bypass ApiKeyGuard for specific endpoints.
 */
export const Public = () => SetMetadata('isPublic', true);
