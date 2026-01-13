# Response Format

This document defines the standard format for all API responses.

> [!IMPORTANT]
> All responses must follow these formats for consistency across the API.

## Success Responses

### Single Resource (GET /resource/{id})

HTTP Status: `200 OK`

```json
{
  "id": "usr_abc123def456",
  "field1": "value1",
  "field2": "value2",
  "created_at": "2026-01-12T10:00:00.000Z",
  "updated_at": "2026-01-12T10:00:00.000Z"
}
```

**Rules:**
- Return the resource directly (no wrapper)
- Always include `id`, `created_at`, `updated_at`
- Timestamps are ISO 8601 UTC

---

### Resource Created (POST /resource)

HTTP Status: `201 Created`

```json
{
  "id": "ord_xyz789ghi012",
  "status": "ORDER_CREATED",
  "amount": "100.00",
  "currency": "USD",
  "created_at": "2026-01-12T10:00:00.000Z",
  "updated_at": "2026-01-12T10:00:00.000Z"
}
```

**Rules:**
- Return the created resource
- Include the generated `id`
- Include initial `status` if applicable
- Return `201` not `200`

---

### Resource List (GET /resources)

HTTP Status: `200 OK`

```json
{
  "data": [
    {
      "id": "ord_abc123",
      "status": "IN_PROGRESS",
      "amount": "120.00",
      "currency": "USD",
      "created_at": "2026-01-12T10:00:00.000Z"
    },
    {
      "id": "ord_def456",
      "status": "CLOSED",
      "amount": "50.00",
      "currency": "USD",
      "created_at": "2026-01-11T15:30:00.000Z"
    }
  ],
  "pagination": {
    "has_more": true,
    "next_cursor": "ord_ghi789"
  }
}
```

**Rules:**
- Wrap array in `data` field
- Include `pagination` object with:
  - `has_more`: boolean indicating more results exist
  - `next_cursor`: ID to use for next page (only if `has_more` is true)
- Default limit: 20, max limit: 100

---

### Action on Resource (POST /resource/{id}/action)

HTTP Status: `200 OK`

```json
{
  "order_id": "ord_abc123",
  "status": "FUNDS_RESERVED",
  "reserved_amount": "120.00",
  "balance_snapshot": {
    "available": "80.00",
    "reserved": "120.00"
  }
}
```

**Rules:**
- Return relevant state after action
- Include resource ID
- Include new status
- Include any side-effect data (e.g., balance changes)

---

### Empty Success (DELETE, some POSTs)

HTTP Status: `204 No Content`

No body.

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable description",
    "details": {}
  }
}
```

See [errors.md](../api/errors.md) for the complete list of error codes.

### Validation Error Example

HTTP Status: `400 Bad Request`

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

### Business Rule Error Example

HTTP Status: `422 Unprocessable Entity`

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

### State Error Example

HTTP Status: `409 Conflict`

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

---

## Headers

### Response Headers (always included)

| Header | Description | Example |
|--------|-------------|---------|
| `X-Request-ID` | Correlation ID (echoed or generated) | `550e8400-e29b-41d4-a716-446655440000` |
| `Content-Type` | Response content type | `application/json` |

### Response Headers (conditional)

| Header | When | Description |
|--------|------|-------------|
| `X-Idempotency-Key` | POST with idempotency | Echo of the provided key |
| `X-RateLimit-Limit` | Always | Request limit per window |
| `X-RateLimit-Remaining` | Always | Remaining requests |
| `X-RateLimit-Reset` | Always | Unix timestamp when limit resets |
| `Retry-After` | 429 responses | Seconds to wait |

---

## Data Types

### Amounts

- **Type**: String
- **Format**: Decimal with exactly 2 decimal places
- **Examples**: `"100.00"`, `"0.50"`, `"1234.56"`

```json
{
  "amount": "100.00",
  "currency": "USD"
}
```

### Dates

- **Type**: String
- **Format**: ISO 8601 UTC
- **Pattern**: `YYYY-MM-DDTHH:mm:ss.sssZ`

```json
{
  "created_at": "2026-01-12T14:30:00.000Z",
  "updated_at": "2026-01-12T15:45:30.123Z"
}
```

### IDs

- **Type**: String
- **Format**: `{prefix}_{nanoid(21)}`
- **Examples**: `"usr_abc123def456"`, `"ord_xyz789ghi012"`

See [naming-conventions.md](./naming-conventions.md) for all prefixes.

---

## Nullable Fields

Fields that can be null should be explicitly documented:

```json
{
  "id": "usr_abc123",
  "email": "user@example.com",
  "airtm_user_id": null,
  "dispute_id": null
}
```

**Rules:**
- Include null fields in responses (don't omit them)
- Document which fields are nullable in endpoint docs
