import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to specify required scopes for an endpoint.
 * @param scopes List of required scopes (e.g., 'read', 'write', 'support')
 */
export const Scopes = (...scopes: string[]) => SetMetadata('scopes', scopes);
