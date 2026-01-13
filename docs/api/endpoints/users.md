# Users Endpoints

## POST /users

Creates a user in OFFER-HUB (internal identity).

### Request

```http
POST /api/v1/users
Authorization: Bearer ohk_live_xxx
Idempotency-Key: {uuid}
Content-Type: application/json
```

```json
{
  "external_user_id": "user_123_from_marketplace",
  "email": "user@example.com",
  "type": "both",
  "metadata": {
    "name": "John Doe",
    "country": "US"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `external_user_id` | string | Yes | User ID in your system |
| `email` | string | No | User email |
| `type` | enum | Yes | `buyer`, `seller`, or `both` |
| `metadata` | object | No | Additional data (free-form) |

### Response

```json
{
  "id": "usr_abc123def456",
  "external_user_id": "user_123_from_marketplace",
  "email": "user@example.com",
  "type": "both",
  "status": "ACTIVE",
  "airtm_user_id": null,
  "metadata": {
    "name": "John Doe",
    "country": "US"
  },
  "created_at": "2026-01-12T10:00:00.000Z",
  "updated_at": "2026-01-12T10:00:00.000Z"
}
```

### Emitted Events

- `user.created`

### Errors

| Code | HTTP | Cause |
|------|------|-------|
| `VALIDATION_ERROR` | 400 | Invalid fields |
| `USER_ALREADY_EXISTS` | 409 | `external_user_id` already registered |

---

## GET /users/{user_id}

Gets user information.

### Request

```http
GET /api/v1/users/usr_abc123
Authorization: Bearer ohk_live_xxx
```

### Response

```json
{
  "id": "usr_abc123def456",
  "external_user_id": "user_123_from_marketplace",
  "email": "user@example.com",
  "type": "both",
  "status": "ACTIVE",
  "airtm_user_id": "airtm_xyz789",
  "metadata": {
    "name": "John Doe",
    "country": "US"
  },
  "created_at": "2026-01-12T10:00:00.000Z",
  "updated_at": "2026-01-12T10:00:00.000Z"
}
```

### Errors

| Code | HTTP | Cause |
|------|------|-------|
| `USER_NOT_FOUND` | 404 | User does not exist |

---

## GET /users

Lists users with filters.

### Request

```http
GET /api/v1/users?type=seller&limit=20&cursor=usr_xyz
Authorization: Bearer ohk_live_xxx
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | enum | - | Filter by type |
| `status` | enum | - | `ACTIVE`, `SUSPENDED` |
| `limit` | int | 20 | Items per page (max 100) |
| `cursor` | string | - | Pagination cursor |

### Response

```json
{
  "data": [
    {
      "id": "usr_abc123",
      "external_user_id": "user_123",
      "type": "seller",
      "status": "ACTIVE",
      "created_at": "2026-01-12T10:00:00.000Z"
    }
  ],
  "pagination": {
    "has_more": true,
    "next_cursor": "usr_def456"
  }
}
```

---

## POST /users/{user_id}/airtm/link

Links an OFFER-HUB user with their Airtm account.

### Request

```http
POST /api/v1/users/usr_abc123/airtm/link
Authorization: Bearer ohk_live_xxx
Content-Type: application/json
```

```json
{
  "airtm_user_id": "airtm_xyz789"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `airtm_user_id` | string | Yes | Airtm user ID |

### Response

```json
{
  "id": "usr_abc123def456",
  "airtm_user_id": "airtm_xyz789",
  "status": "ACTIVE",
  "linked_at": "2026-01-12T10:00:00.000Z"
}
```

### Emitted Events

- `user.airtm_linked`

### Errors

| Code | HTTP | Cause |
|------|------|-------|
| `USER_NOT_FOUND` | 404 | User does not exist |
| `AIRTM_USER_INVALID` | 422 | airtm_user_id is invalid |
| `AIRTM_USER_ALREADY_LINKED` | 409 | Already linked |

---

## GET /users/{user_id}/balance

Gets the user balance (Web2 view).

### Request

```http
GET /api/v1/users/usr_abc123/balance
Authorization: Bearer ohk_live_xxx
```

### Response

```json
{
  "user_id": "usr_abc123def456",
  "currency": "USD",
  "available": "150.00",
  "reserved": "50.00",
  "total": "200.00",
  "updated_at": "2026-01-12T10:00:00.000Z"
}
```

| Field | Description |
|-------|-------------|
| `available` | Balance available to use |
| `reserved` | Balance reserved in active orders |
| `total` | `available + reserved` |

### Errors

| Code | HTTP | Cause |
|------|------|-------|
| `USER_NOT_FOUND` | 404 | User does not exist |

---

## User Statuses

| Status | Description |
|--------|-------------|
| `ACTIVE` | Active user, can operate |
| `SUSPENDED` | Suspended user, cannot operate |
| `PENDING_VERIFICATION` | Verification required |
