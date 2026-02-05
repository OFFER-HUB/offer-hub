/**
 * OfferHub SDK
 * Official TypeScript SDK for the OfferHub Orchestrator API
 *
 * @packageDocumentation
 */

// Export main client
export { OfferHubSDK, type OfferHubSDKConfig } from './offerhub-sdk';

// Export types
export * from './types';

// Export errors
export * from './errors';

// Export HTTP client types
export type { HttpClientConfig } from './client/http-client';
