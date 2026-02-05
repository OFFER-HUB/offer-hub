/**
 * Queue name constants for BullMQ.
 *
 * Each queue handles a specific type of background job.
 */
export const QUEUE_NAMES = {
    /**
     * Webhook processing queue.
     * Handles incoming webhooks from Airtm and Trustless Work.
     */
    WEBHOOKS: 'webhooks',

    /**
     * Reconciliation queue.
     * Handles periodic sync jobs with external providers.
     */
    RECONCILIATION: 'reconciliation',

    /**
     * Notifications queue.
     * Handles sending notifications (email, push, etc.).
     */
    NOTIFICATIONS: 'notifications',

    /**
     * Dead Letter Queue.
     * Stores jobs that have exhausted all retry attempts.
     */
    DLQ: 'dead-letter-queue',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

/**
 * Job type constants for each queue.
 */
export const JOB_TYPES = {
    // Webhook jobs
    AIRTM_PAYIN: 'airtm:payin',
    AIRTM_PAYOUT: 'airtm:payout',
    TRUSTLESS_ESCROW: 'trustless:escrow',

    // Reconciliation jobs
    SYNC_TOPUPS: 'reconciliation:sync-topups',
    SYNC_WITHDRAWALS: 'reconciliation:sync-withdrawals',
    SYNC_ESCROWS: 'reconciliation:sync-escrows',

    // Notification jobs
    SEND_EMAIL: 'notification:email',
    SEND_WEBHOOK: 'notification:webhook',
} as const;

export type JobType = (typeof JOB_TYPES)[keyof typeof JOB_TYPES];
