# Disputes Endpoints

## POST /orders/{order_id}/disputes

Opens a dispute and freezes automated flows.

### Request

```http
POST /api/v1/orders/ord_abc123/disputes
Authorization: Bearer ohk_live_xxx
Idempotency-Key: {uuid}
Content-Type: application/json
```

```json
{
  "opened_by": "buyer",
  "reason": "quality_issue",
  "evidence": ["https://.../img1.png"],
  "message": "Not matching spec"
}
```

### Response

```json
{ "dispute_id": "dsp_...", "order_id": "ord_...", "status": "DISPUTED" }
```

### Emitted Events

- `dispute.opened`

---

## GET /disputes/{dispute_id}

Gets dispute details.

### Request

```http
GET /api/v1/disputes/dsp_abc123
Authorization: Bearer ohk_live_xxx
```

### Response

```json
{
  "id": "dsp_...",
  "order_id": "ord_...",
  "status": "UNDER_REVIEW",
  "opened_by": "buyer",
  "reason": "quality_issue",
  "created_at": "2026-01-12T10:00:00.000Z"
}
```

---

## GET /disputes

Lists disputes.

### Request

```http
GET /api/v1/disputes?status=OPEN&limit=20
Authorization: Bearer ohk_live_xxx
```

### Response

```json
{
  "data": [
    { "id": "dsp_...", "order_id": "ord_...", "status": "OPEN" }
  ],
  "pagination": { "has_more": true, "next_cursor": "dsp_def456" }
}
```

---

## POST /disputes/{dispute_id}/resolve

Resolves a dispute (release/refund/split).

### Request

```http
POST /api/v1/disputes/dsp_abc123/resolve
Authorization: Bearer ohk_live_xxx
Idempotency-Key: {uuid}
Content-Type: application/json
```

```json
{
  "decision": "SPLIT",
  "amount_to_seller": "80.00",
  "amount_to_buyer": "40.00",
  "note": "Partial delivery accepted"
}
```

### Response

```json
{ "dispute_id": "dsp_...", "status": "RESOLVED", "result": "SPLIT" }
```

### Emitted Events

- `dispute.resolved`

---

## POST /disputes/{dispute_id}/comment

Adds an internal support comment.

### Request

```http
POST /api/v1/disputes/dsp_abc123/comment
Authorization: Bearer ohk_live_xxx
Content-Type: application/json
```

```json
{ "message": "Reviewed evidence" }
```

### Response

```json
{ "dispute_id": "dsp_...", "comment_id": "cmt_..." }
```
