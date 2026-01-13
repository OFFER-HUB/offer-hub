# Audit Log

## Schema

```json
{
  "id": "aud_...",
  "occurred_at": "2026-01-12T12:00:00Z",
  "marketplace_id": "mkt_...",
  "action": "TOPUP_CREATE|ORDER_CREATE|ORDER_RESERVE|ESCROW_CREATE|ESCROW_FUND|RELEASE|REFUND|DISPUTE_OPEN|DISPUTE_RESOLVE|WITHDRAWAL_CREATE|WITHDRAWAL_COMMIT|WEBHOOK_RECEIVED|STATE_TRANSITION",
  "actor": {
    "type": "user|system|support|webhook|marketplace_api",
    "id": "usr_...|sup_...|airtm|trustless|mkt_..."
  },
  "resource": { "type": "user|topup|order|escrow|dispute|withdrawal", "id": "..." },
  "result": "SUCCESS|FAILURE",
  "error": { "code": "string", "message": "string" },
  "idempotency_key": "string?",
  "correlation": {
    "request_id": "uuid?",
    "external_ref": "string?",
    "airtm_id": "string?",
    "trustless_id": "string?"
  },
  "before": {},
  "after": {},
  "ip": "string?",
  "user_agent": "string?"
}
```

## Rules

- Always store `actor`, `action`, `resource`, `result`, `occurred_at`.
- For state changes, include `before.status` and `after.status`.
- For webhooks, set `action = WEBHOOK_RECEIVED` and store a summary or hash.
- Never store secrets or full tokens.
