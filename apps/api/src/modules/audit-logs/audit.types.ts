/**
 * Audit entry structure for compliance and traceability.
 * @see https://github.com/OFFER-HUB/OFFER-HUB/issues/47
 */
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';
export type ActorType = 'USER' | 'SYSTEM' | 'WEBHOOK';
export type AuditResult = 'SUCCESS' | 'FAILURE';

export interface AuditEntryInput {
    marketplaceId: string;
    userId?: string;
    action: AuditAction;
    resourceType: string;
    resourceId: string;
    payloadBefore?: object | null;
    payloadAfter?: object | null;
    actorType: ActorType;
    actorId?: string;
    result: AuditResult;
    error?: object;
    idempotencyKey?: string;
    correlationId?: string;
    ip?: string;
    userAgent?: string;
}
