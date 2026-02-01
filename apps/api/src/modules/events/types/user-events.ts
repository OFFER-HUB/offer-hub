/**
 * User Event Payloads
 * 
 * Type-safe payload definitions for all user related events
 */

export interface UserCreatedPayload {
    userId: string;
    externalUserId: string;
    email?: string;
    type: 'BUYER' | 'SELLER' | 'BOTH';
    status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
}

export interface UserAirtmLinkedPayload {
    userId: string;
    airtmUserId: string;
    linkedAt: string;
}

export interface UserStellarLinkedPayload {
    userId: string;
    stellarAddress: string;
    linkedAt: string;
}
