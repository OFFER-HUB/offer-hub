# Withdrawals Endpoints

## POST /withdrawals

Starts a seller withdrawal in Airtm.

### Request

```http
POST /api/v1/withdrawals
Authorization: Bearer ohk_live_xxx
Idempotency-Key: {uuid}
Content-Type: application/json
```

```json
{
  "user_id": "usr_seller",
  "amount": "80.00",
  "currency": "USD",
  "destination": { "type": "bank", "ref": "dest_123" }
}
```

### Response

```json
{ "id": "wd_...", "status": "WITHDRAWAL_CREATED", "amount": "80.00" }
```

---

## GET /withdrawals/{withdrawal_id}

Gets the withdrawal status.

### Request

```http
GET /api/v1/withdrawals/wd_abc123
Authorization: Bearer ohk_live_xxx
```

### Response

```json
{ "id": "wd_...", "status": "WITHDRAWAL_PENDING" }
```

---

## POST /withdrawals/{withdrawal_id}/commit

Commits a withdrawal if the flow requires it.

### Request

```http
POST /api/v1/withdrawals/wd_abc123/commit
Authorization: Bearer ohk_live_xxx
Idempotency-Key: {uuid}
Content-Type: application/json
```

```json
{ "confirm": true }
```

### Response

```json
{ "id": "wd_...", "status": "WITHDRAWAL_COMMITTED" }
```

---

## POST /withdrawals/{withdrawal_id}/refresh

Re-checks Airtm if a webhook is missing.

### Request

```http
POST /api/v1/withdrawals/wd_abc123/refresh
Authorization: Bearer ohk_live_xxx
```

### Response

```json
{ "id": "wd_...", "status": "WITHDRAWAL_PENDING" }
```

### Notes

- This endpoint is naturally idempotent.
- Use it only when a webhook did not arrive.
