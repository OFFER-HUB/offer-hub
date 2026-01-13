# Auth Endpoints

## POST /auth/token

Issues a short-lived token for frontend use in tokenized mode.

### Authentication

Requires `OFFERHUB_MASTER_KEY` (configured in `.env`).

### Request

```http
POST /api/v1/auth/token
Authorization: Bearer {OFFERHUB_MASTER_KEY}
Content-Type: application/json
```

```json
{
  "marketplace_id": "mkt_abc123",
  "scopes": ["read"],
  "ttl_seconds": 900
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `marketplace_id` | string | Yes | Marketplace identifier |
| `scopes` | string[] | Yes | Token scopes |
| `ttl_seconds` | number | No | Token lifetime in seconds |

### Response

```json
{
  "token": "ohk_tok_...",
  "expires_at": "2026-01-12T10:15:00.000Z"
}
```

### Errors

| Code | HTTP | Cause |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Invalid master key |
| `VALIDATION_ERROR` | 400 | Invalid request |

---

## POST /auth/api-keys

Generates an API key to authenticate requests to the Orchestrator.

### Authentication

Requires `OFFERHUB_MASTER_KEY` (configured in `.env`).

### Request

```http
POST /api/v1/auth/api-keys
Authorization: Bearer {OFFERHUB_MASTER_KEY}
Content-Type: application/json
```

```json
{
  "name": "my-marketplace-backend",
  "scopes": ["read", "write"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Descriptive name for the key |
| `scopes` | string[] | Yes | Permissions: `read`, `write`, `support` |

### Response

```json
{
  "id": "key_abc123def456",
  "api_key": "ohk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "name": "my-marketplace-backend",
  "scopes": ["read", "write"],
  "created_at": "2026-01-12T10:00:00.000Z"
}
```

**Important**: `api_key` is shown only once. Store it securely.

### Errors

| Code | HTTP | Cause |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Invalid master key |
| `VALIDATION_ERROR` | 400 | Invalid scopes |

---

## GET /auth/api-keys

Lists all API keys (without showing the full key).

### Request

```http
GET /api/v1/auth/api-keys
Authorization: Bearer {OFFERHUB_MASTER_KEY}
```

### Response

```json
{
  "data": [
    {
      "id": "key_abc123",
      "name": "my-marketplace-backend",
      "scopes": ["read", "write"],
      "last_used_at": "2026-01-12T15:30:00.000Z",
      "created_at": "2026-01-12T10:00:00.000Z"
    }
  ]
}
```

---

## DELETE /auth/api-keys/{key_id}

Revokes an API key.

### Request

```http
DELETE /api/v1/auth/api-keys/key_abc123
Authorization: Bearer {OFFERHUB_MASTER_KEY}
```

### Response

```json
{
  "id": "key_abc123",
  "status": "revoked",
  "revoked_at": "2026-01-12T16:00:00.000Z"
}
```

---

## GET /me

Information about the instance and the current API key.

### Request

```http
GET /api/v1/me
Authorization: Bearer ohk_live_xxx
```

### Response

```json
{
  "marketplace_id": "mkt_abc123",
  "api_key": {
    "id": "key_abc123",
    "name": "my-marketplace-backend",
    "scopes": ["read", "write"]
  },
  "environment": "production",
  "version": "1.0.0"
}
```

---

## GET /config

Active instance configuration (no secrets).

### Request

```http
GET /api/v1/config
Authorization: Bearer ohk_live_xxx
```

### Response

```json
{
  "features": {
    "topups_enabled": true,
    "withdrawals_enabled": true,
    "disputes_enabled": true
  },
  "limits": {
    "max_order_amount": "10000.00",
    "min_topup_amount": "10.00",
    "min_withdrawal_amount": "10.00"
  },
  "providers": {
    "airtm": {
      "environment": "sandbox",
      "status": "connected"
    },
    "trustless_work": {
      "network": "testnet",
      "status": "connected"
    }
  },
  "currencies": ["USD"]
}
```

---

## GET /health

System healthcheck.

### Request

```http
GET /api/v1/health
```

**Note**: No authentication required.

### Response

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "airtm": "ok",
    "trustless_work": "ok"
  },
  "timestamp": "2026-01-12T10:00:00.000Z"
}
```
