import type { HttpClient } from '../client/http-client';

/**
 * Base class for all resource clients
 */
export abstract class BaseResource {
    constructor(protected readonly client: HttpClient) {}
}
