# Validation Rules

## Money Rules

### Amounts

| Rule | Description |
|-------|-------------|
| Format | Decimal string with exactly 2 decimals |
| Minimum value | Greater than `"0.00"` |
| Regex pattern | `^\d+\.\d{2}$` |
| Precision | Do not use floats, always strings |

```typescript
// Valid
"100.00"
"0.01"
"9999999.99"

// Invalid
"100"      // Missing decimals
"100.0"    // Only 1 decimal
"100.000"  // 3 decimals
100.00     // Number, not string
"-50.00"   // Negative
```

### Currency

| Rule | Description |
|-------|-------------|
| Allowed values (v1) | Only `"USD"` |
| Format | ISO 4217 (3 uppercase letters) |

### Balance Checks

| Operation | Validation |
|-----------|------------|
| Reserve | `available >= amount` |
| Fund escrow | State must be `FUNDS_RESERVED` |
| Release/Refund | State must be `ESCROW_FUNDED`, `IN_PROGRESS`, or `DISPUTED` |

## State Guardrails

### Order Constraints

| Constraint | Rule |
|------------|-------|
| One escrow per order | Cannot create a second escrow |
| One active dispute | Cannot open a dispute if one is already open |
| Release/Refund exclusive | Terminal states, mutually exclusive |
| Cancel only pre-escrow | Only if state is `ORDER_CREATED` or `FUNDS_RESERVED` |

### Valid Transitions

```
ORDER_CREATED -> FUNDS_RESERVED -> ESCROW_CREATING -> ESCROW_FUNDING -> ESCROW_FUNDED
ESCROW_FUNDED -> IN_PROGRESS
IN_PROGRESS -> RELEASE_REQUESTED | REFUND_REQUESTED | DISPUTED
RELEASE_REQUESTED -> RELEASED -> CLOSED
REFUND_REQUESTED -> REFUNDED -> CLOSED
DISPUTED -> RELEASED | REFUNDED | CLOSED (via resolution)
```

### Top-up Constraints

| Constraint | Rule |
|------------|-------|
| Immutable post-creation | Only Airtm can change state via webhook |
| Terminal states | `SUCCEEDED`, `FAILED`, `CANCELED` do not change |

### Withdrawal Constraints

| Constraint | Rule |
|------------|-------|
| Requires balance | `available >= amount` at creation time |
| Commit required | Some flows require `POST /commit` before processing |
| Terminal states | `COMPLETED`, `FAILED`, `CANCELED` do not change |

## Security

### API Keys

| Rule | Description |
|-------|-------------|
| Format | `ohk_{env}_{random}` (e.g., `ohk_live_abc123...`) |
| Length | 32+ random characters |
| Storage | Hash only in DB, full key only at creation |
| Scopes | `read`, `write`, `support` |

### Scopes by Endpoint

| Scope | Allowed endpoints |
|-------|------------------|
| `read` | All GET |
| `write` | POST /users, /topups, /orders, /withdrawals, etc. |
| `support` | POST /disputes/{id}/resolve, /disputes/{id}/comment |

### Webhooks

| Validation | Description |
|------------|-------------|
| Signature | Verify HMAC with provider secret |
| Deduplication | Store `event_id` and reject duplicates |
| Idempotency | Respond 200 OK without reprocessing if already handled |

### Secrets

| Rule | Description |
|-------|-------------|
| Server-side only | Airtm/Trustless keys only in `.env` |
| Never in logs | Do not log tokens, API keys, or secrets |
| Never in responses | Do not include in JSON responses |
| Audit redacted | In audit logs, store only prefixes or hashes |

## Input Validation

### User

| Field | Rule |
|-------|-------|
| `external_user_id` | Required, string, max 255 chars |
| `email` | Optional, valid email format |
| `type` | Enum: `buyer`, `seller`, `both` |

### Order

| Field | Rule |
|-------|-------|
| `buyer_id` | Required, existing user |
| `seller_id` | Required, existing user, different from buyer |
| `amount` | Required, valid format, > 0 |
| `currency` | Required, `"USD"` |
| `client_order_ref` | Optional, string, max 100 chars, unique |

### Top-up

| Field | Rule |
|-------|-------|
| `user_id` | Required, existing user with Airtm linked |
| `amount` | Required, valid format, > 0 |
| `return_url` | Required, valid HTTPS URL |
| `cancel_url` | Required, valid HTTPS URL |

### Withdrawal

| Field | Rule |
|-------|-------|
| `user_id` | Required, existing user |
| `amount` | Required, valid format, <= available balance |
| `destination.type` | Enum: `bank`, `crypto` |
| `destination.ref` | Required, destination reference |

## Rate Limiting

| Endpoint | Limit |
|----------|--------|
| General | 100 req/min per API key |
| POST /topups | 10 req/min per user |
| POST /withdrawals | 5 req/min per user |
| GET /events (SSE) | 1 connection per user |

## Timeouts

| Operation | Timeout |
|-----------|---------|
| Airtm request | 30s |
| Trustless Work request | 60s |
| Webhook processing | 10s |
| SSE heartbeat | 30s |
