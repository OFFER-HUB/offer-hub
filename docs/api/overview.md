# API Overview

## Base URL

```
https://{your-orchestrator-domain}/api/v1
```

For local development:
```
http://localhost:4000/api/v1
```

## Authentication

All requests require authentication via a Bearer token.

### Header

```http
Authorization: Bearer ohk_live_xxxxxxxxxxxxxxxxxxxxxxxx
```

### Get an API Key

```bash
# Via CLI (post-install)
pnpm run cli api-keys:create --name "my-app" --scopes read,write

# Via API (requires master key)
POST /auth/api-keys
Authorization: Bearer {OFFERHUB_MASTER_KEY}
```

### Scopes

| Scope | Permissions |
|-------|-------------|
| `read` | All GET endpoints |
| `write` | POST to create/modify resources |
| `support` | Resolve disputes, add comments |

## Common Headers

### Request Headers

| Header | Required | Description |
|--------|-----------|-------------|
| `Authorization` | Yes | `Bearer {api_key}` |
| `Content-Type` | Yes (POST/PUT) | `application/json` |
| `Idempotency-Key` | Conditional | UUID for mutable POSTs |
| `X-Request-ID` | No | UUID for correlation/debugging |
| `Accept` | No | `application/json` (default) or `text/event-stream` |

### Response Headers

| Header | Description |
|--------|-------------|
| `X-Request-ID` | Echo of request or generated |
| `X-Idempotency-Key` | Echo of key if applied |
| `X-RateLimit-Limit` | Request limit |
| `X-RateLimit-Remaining` | Remaining requests |
| `X-RateLimit-Reset` | Reset timestamp |

## Response Format

### Success

```json
{
  "id": "ord_abc123",
  "status": "ORDER_CREATED",
  "amount": "100.00",
  "currency": "USD",
  "created_at": "2026-01-12T10:00:00.000Z",
  "updated_at": "2026-01-12T10:00:00.000Z"
}
```

### Error

```json
{
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Available balance is less than requested amount",
    "details": {
      "available": "50.00",
      "requested": "100.00"
    }
  }
}
```

See [errors.md](./errors.md) for the full list of codes.

## Pagination

List endpoints support pagination:

### Request

```
GET /orders?limit=20&cursor=ord_xyz789
```

| Param | Default | Max | Description |
|-------|---------|-----|-------------|
| `limit` | 20 | 100 | Items per page |
| `cursor` | - | - | ID of the last item from the previous page |

### Response

```json
{
  "data": [...],
  "pagination": {
    "has_more": true,
    "next_cursor": "ord_abc123"
  }
}
```

## Filters

List endpoints accept filters via query params:

```
GET /orders?status=IN_PROGRESS&buyer_id=usr_abc&created_after=2026-01-01
```

| Filter | Type | Example |
|--------|------|---------|
| `status` | string | `IN_PROGRESS` |
| `buyer_id` | string | `usr_abc123` |
| `seller_id` | string | `usr_xyz789` |
| `created_after` | ISO date | `2026-01-01T00:00:00Z` |
| `created_before` | ISO date | `2026-01-31T23:59:59Z` |

## Idempotency

All POSTs that mutate state accept `Idempotency-Key`:

```http
POST /orders
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{...}
```

### Behavior

1. First request: processed normally
2. Repeated request (same key): returns original response
3. Request with different body + same key: `409 Conflict` error

### Idempotency Windows

| Resource | Window |
|----------|--------|
| Top-ups | 24 hours |
| Withdrawals | 24 hours |
| Orders | 7 days |
| Escrow ops | 7 days |
| Disputes | Forever |

See [idempotency.md](./idempotency.md) for details.

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| General | 100 req/min per API key |
| POST /topups | 10 req/min per user |
| POST /withdrawals | 5 req/min per user |
| GET /events | 1 SSE connection per user |

### Response when exceeded

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60

{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests",
    "details": {
      "retry_after": 60
    }
  }
}
```

## Versioning

The API uses path versioning:

```
/api/v1/orders
/api/v2/orders  (future)
```

- `v1` is the current stable version
- Deprecated versions will have 6 months notice

## Timeouts

| Operation | Timeout |
|-----------|---------|
| Standard requests | 30s |
| Airtm operations | 30s |
| Trustless Work operations | 60s |

## Endpoints by Domain

| Domain | Description | Docs |
|---------|-------------|------|
| Auth | API keys, config | [auth.md](./endpoints/auth.md) |
| Users | Users, balance | [users.md](./endpoints/users.md) |
| Top-ups | Top-ups | [topups.md](./endpoints/topups.md) |
| Orders | Orders | [orders.md](./endpoints/orders.md) |
| Escrow | TW escrow | [escrow.md](./endpoints/escrow.md) |
| Release/Refund | Release/refund | [release-refund.md](./endpoints/release-refund.md) |
| Disputes | Disputes | [disputes.md](./endpoints/disputes.md) |
| Withdrawals | Withdrawals | [withdrawals.md](./endpoints/withdrawals.md) |
| Events | Real-time SSE | [events.md](./endpoints/events.md) |
| Webhooks | Provider ingress | [webhooks.md](./endpoints/webhooks.md) |
