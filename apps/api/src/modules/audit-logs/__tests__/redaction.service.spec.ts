import { Test, TestingModule } from '@nestjs/testing';
import { RedactionService } from '../redaction.service';

describe('RedactionService', () => {
    let service: RedactionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [RedactionService],
        }).compile();
        service = module.get(RedactionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('redact', () => {
        it('returns null/undefined unchanged', () => {
            expect(service.redact(null)).toBe(null);
            expect(service.redact(undefined)).toBe(undefined);
        });

        it('redacts known sensitive field names', () => {
            const payload = { apiKey: 'sk_live_xxx', name: 'Acme' };
            const out = service.redact(payload);
            expect(out).toEqual({ apiKey: '***REDACTED***', name: 'Acme' });
        });

        it('redacts password and secret', () => {
            const payload = { password: 'secret123', user: 'jane' };
            const out = service.redact(payload);
            expect(out).toEqual({ password: '***REDACTED***', user: 'jane' });
        });

        it('partially masks email when emailPartial is true', () => {
            const payload = { email: 'john@example.com' };
            const out = service.redact(payload);
            expect(out).toEqual({ email: 'j***@example.com' });
        });

        it('redacts nested objects', () => {
            const payload = { user: { apiKey: 'key', name: 'Bob' } };
            const out = service.redact(payload);
            expect(out).toEqual({ user: { apiKey: '***REDACTED***', name: 'Bob' } });
        });

        it('redacts array elements', () => {
            const payload = [{ secret: 'x' }, { name: 'y' }];
            const out = service.redact(payload);
            expect(out).toEqual([{ secret: '***REDACTED***' }, { name: 'y' }]);
        });

        it('accepts custom options', () => {
            const payload = { customSecret: 'hide' };
            const out = service.redact(payload, {
                fields: ['customSecret'],
                maskWith: '[REDACTED]',
            });
            expect(out).toEqual({ customSecret: '[REDACTED]' });
        });

        it('preserves data structure (does not change types)', () => {
            const payload = { count: 42, active: true };
            const out = service.redact(payload);
            expect(out).toEqual(payload);
        });
    });
});
