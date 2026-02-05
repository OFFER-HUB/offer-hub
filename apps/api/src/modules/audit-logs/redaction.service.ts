import { Injectable } from '@nestjs/common';

/**
 * Options for redacting sensitive data before storing in audit logs.
 */
export interface RedactionOptions {
    /** Field names to fully redact (e.g. apiKey, password) */
    fields?: string[];
    /** Regex patterns to match field names (e.g. /email/i, /token/i) */
    patterns?: RegExp[];
    /** Mask for fully redacted values */
    maskWith?: string;
    /** If true, partially mask emails (e.g. j***@example.com) */
    emailPartial?: boolean;
    /** If true, show last 4 chars for bank/account-like fields */
    accountLastFour?: boolean;
}

const DEFAULT_OPTIONS: Required<Omit<RedactionOptions, 'patterns'>> & { patterns: RegExp[] } = {
    fields: ['apiKey', 'secret', 'password', 'airtmApiKey', 'hashedKey', 'salt', 'token'],
    patterns: [/email/i, /account/i, /token/i, /secret/i, /password/i, /key/i],
    maskWith: '***REDACTED***',
    emailPartial: true,
    accountLastFour: true,
};

/**
 * RedactionService – masks sensitive fields before storing in audit logs.
 * Preserves data structure (does not change types).
 */
@Injectable()
export class RedactionService {
    /**
     * Redact sensitive values in an object (or primitive).
     * Nested objects and arrays are traversed; matching keys are masked.
     */
    redact<T>(payload: T, options: RedactionOptions = {}): T {
        const opts = { ...DEFAULT_OPTIONS, ...options };
        if (payload === null || payload === undefined) {
            return payload;
        }
        return this.redactValue(payload, opts) as T;
    }

    private redactValue(value: unknown, opts: typeof DEFAULT_OPTIONS): unknown {
        if (value === null || value === undefined) {
            return value;
        }

        if (Array.isArray(value)) {
            return value.map((item) => this.redactValue(item, opts));
        }

        if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
            const out: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(value)) {
                const key = k as string;
                if (this.shouldRedact(key, opts)) {
                    out[key] = this.maskValue(key, v, opts);
                } else {
                    out[key] = this.redactValue(v, opts);
                }
            }
            return out;
        }

        return value;
    }

    private shouldRedact(key: string, opts: typeof DEFAULT_OPTIONS): boolean {
        if (opts.fields.some((f) => f.toLowerCase() === key.toLowerCase())) {
            return true;
        }
        if (opts.patterns.some((p) => p.test(key))) {
            return true;
        }
        return false;
    }

    private maskValue(key: string, value: unknown, opts: typeof DEFAULT_OPTIONS): string {
        const str = value === null || value === undefined ? '' : String(value);

        if (opts.emailPartial && /email/i.test(key) && str.includes('@')) {
            return this.maskEmail(str);
        }
        if (opts.accountLastFour && (/account|bank|number/i.test(key) || /account/i.test(key))) {
            return this.maskAccountLastFour(str);
        }

        return opts.maskWith;
    }

    private maskEmail(email: string): string {
        const at = email.indexOf('@');
        if (at <= 0) return DEFAULT_OPTIONS.maskWith;
        const local = email.slice(0, at);
        const domain = email.slice(at);
        const visible = local.length > 0 ? local[0] + '***' : '***';
        return `${visible}${domain}`;
    }

    private maskAccountLastFour(value: string): string {
        const digits = value.replace(/\D/g, '');
        if (digits.length < 4) return DEFAULT_OPTIONS.maskWith;
        return `****${digits.slice(-4)}`;
    }
}
