/**
 * ID Prefixes for all resources
 * @see docs/standards/naming-conventions.md
 *
 * Format: {prefix}_{nanoid(21)}
 */
export const ID_PREFIXES = {
    USER: 'usr_',
    ORDER: 'ord_',
    TOPUP: 'topup_',
    ESCROW: 'esc_',
    DISPUTE: 'dsp_',
    WITHDRAWAL: 'wd_',
    EVENT: 'evt_',
    AUDIT_LOG: 'aud_',
    API_KEY: 'key_',
    MARKETPLACE: 'mkt_',
} as const;

export type IdPrefix = (typeof ID_PREFIXES)[keyof typeof ID_PREFIXES];
