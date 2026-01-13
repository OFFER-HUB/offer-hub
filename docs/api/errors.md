# API Errors

## Error Format

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable description",
    "details": {}
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `code` | string | Unique code for programmatic handling |
| `message` | string | Human-readable description (do not use for logic) |
| `details` | object | Additional contextual information |

## HTTP Codes

| Status | Usage |
|--------|-----|
| `200` | Success |
| `201` | Resource created |
| `400` | Invalid input / validation |
| `401` | Unauthenticated / invalid token |
| `403` | Insufficient scope / no permission |
| `404` | Resource not found |
| `409` | Conflict / invalid state / idempotency |
| `422` | Business rules (e.g., insufficient funds) |
| `429` | Rate limit exceeded |
| `500` | Internal server error |
| `502` | Provider down (Airtm/Trustless Work) |
| `503` | Maintenance |
| `504` | Provider timeout |

## Error Code List

### Authentication (401, 403)

| Code | HTTP | Description |
|------|------|-------------|
| `UNAUTHORIZED` | 401 | No token provided |
| `INVALID_API_KEY` | 401 | API key invalid or expired |
| `INSUFFICIENT_SCOPE` | 403 | Scope does not allow this operation |

```json
{
  "error": {
    "code": "INSUFFICIENT_SCOPE",
    "message": "This operation requires 'support' scope",
    "details": {
      "required_scope": "support",
      "current_scopes": ["read", "write"]
    }
  }
}
```

### Validation (400)

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | General validation error |
| `INVALID_AMOUNT_FORMAT` | 400 | Amount is not a valid decimal string |
| `INVALID_CURRENCY` | 400 | Unsupported currency |
| `MISSING_REQUIRED_FIELD` | 400 | Required field missing |

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": {
      "fields": [
        { "field": "amount", "message": "Must be a string with 2 decimals" },
        { "field": "buyer_id", "message": "Required" }
      ]
    }
  }
}
```

### Users (404, 422)

| Code | HTTP | Description |
|------|------|-------------|
| `USER_NOT_FOUND` | 404 | User does not exist |
| `AIRTM_USER_NOT_LINKED` | 422 | User does not have Airtm linked |
| `AIRTM_USER_INVALID` | 422 | Invalid airtm_user_id |

```json
{
  "error": {
    "code": "AIRTM_USER_NOT_LINKED",
    "message": "User must link Airtm account before top-ups",
    "details": {
      "user_id": "usr_abc123"
    }
  }
}
```

### Balance / Funds (422)

| Code | HTTP | Description |
|------|------|-------------|
| `INSUFFICIENT_FUNDS` | 422 | Insufficient balance |
| `FUNDS_ALREADY_RESERVED` | 409 | Funds already reserved for this order |
| `RESERVE_NOT_FOUND` | 404 | No active reservation |
| `RESERVE_MISMATCH_AMOUNT` | 422 | Reservation amount does not match |

```json
{
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Available balance is less than requested amount",
    "details": {
      "available": "50.00",
      "requested": "100.00",
      "currency": "USD"
    }
  }
}
```

### Orders / State Machine (404, 409)

| Code | HTTP | Description |
|------|------|-------------|
| `ORDER_NOT_FOUND` | 404 | Order does not exist |
| `INVALID_STATE` | 409 | Invalid state transition |
| `ESCROW_ALREADY_EXISTS` | 409 | Escrow already exists for this order |
| `ESCROW_NOT_READY` | 409 | Escrow not in the correct state |
| `DISPUTE_ALREADY_OPEN` | 409 | A dispute is already open |

```json
{
  "error": {
    "code": "INVALID_STATE",
    "message": "Cannot reserve funds: order is not in ORDER_CREATED state",
    "details": {
      "order_id": "ord_xyz789",
      "current_state": "FUNDS_RESERVED",
      "allowed_states": ["ORDER_CREATED"]
    }
  }
}
```

### Providers (502, 504)

| Code | HTTP | Description |
|------|------|-------------|
| `PROVIDER_ERROR` | 502 | External provider error |
| `PROVIDER_TIMEOUT` | 504 | Timeout waiting for provider |
| `PROVIDER_RATE_LIMITED` | 502 | Provider rate limited |
| `WEBHOOK_SIGNATURE_INVALID` | 400 | Invalid webhook signature |
| `WEBHOOK_DUPLICATE_IGNORED` | 200 | Duplicate webhook (OK but ignored) |

```json
{
  "error": {
    "code": "PROVIDER_TIMEOUT",
    "message": "Trustless Work did not respond in time",
    "details": {
      "provider": "trustless_work",
      "timeout_ms": 60000,
      "retry_recommended": true
    }
  }
}
```

### Withdrawals (404, 409, 422)

| Code | HTTP | Description |
|------|------|-------------|
| `WITHDRAWAL_NOT_FOUND` | 404 | Withdrawal does not exist |
| `WITHDRAWAL_NOT_COMMITTABLE` | 409 | Cannot commit withdrawal |
| `WITHDRAWAL_DESTINATION_INVALID` | 422 | Invalid destination |

```json
{
  "error": {
    "code": "WITHDRAWAL_NOT_COMMITTABLE",
    "message": "Withdrawal is already committed",
    "details": {
      "withdrawal_id": "wd_abc123",
      "current_status": "WITHDRAWAL_PENDING"
    }
  }
}
```

### Idempotency (409)

| Code | HTTP | Description |
|------|------|-------------|
| `IDEMPOTENCY_KEY_REUSED` | 409 | Key reused with a different body |
| `IDEMPOTENCY_KEY_IN_PROGRESS` | 409 | Original request still processing |

```json
{
  "error": {
    "code": "IDEMPOTENCY_KEY_REUSED",
    "message": "This idempotency key was used with a different request body",
    "details": {
      "idempotency_key": "550e8400-e29b-41d4-a716-446655440000"
    }
  }
}
```

### Rate Limiting (429)

| Code | HTTP | Description |
|------|------|-------------|
| `RATE_LIMITED` | 429 | Too many requests |

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests, please retry after 60 seconds",
    "details": {
      "retry_after": 60,
      "limit": 100,
      "window": "1m"
    }
  }
}
```

## Error Handling (SDK)

```typescript
import { OfferHubError, InsufficientFundsError } from '@offerhub/sdk';

try {
  await sdk.orders.reserve(orderId, { amount: '100.00' });
} catch (error) {
  if (error instanceof InsufficientFundsError) {
    console.log(`Need ${error.details.requested}, have ${error.details.available}`);
  } else if (error instanceof OfferHubError) {
    console.log(`Error: ${error.code} - ${error.message}`);
  }
}
```

## Recommended Retries

| Error Code | Retry? | Strategy |
|------------|--------|----------|
| `PROVIDER_TIMEOUT` | Yes | Exponential backoff |
| `PROVIDER_ERROR` | Yes | Exponential backoff |
| `RATE_LIMITED` | Yes | Wait `retry_after` |
| `IDEMPOTENCY_KEY_IN_PROGRESS` | Yes | Poll status endpoint |
| `INSUFFICIENT_FUNDS` | No | Requires user action |
| `INVALID_STATE` | No | Check current state |
| `VALIDATION_ERROR` | No | Fix request |
