# Escrow Endpoints

## POST /orders/{order_id}/escrow

Creates an escrow in Trustless Work and links it to the order.

### Request

```http
POST /api/v1/orders/ord_abc123/escrow
Authorization: Bearer ohk_live_xxx
Idempotency-Key: {uuid}
Content-Type: application/json
```

```json
{
  "terms": {
    "milestones_required": true,
    "allow_partial_release": true,
    "allow_partial_refund": true
  }
}
```

### Response

```json
{
  "order_id": "ord_...",
  "status": "ESCROW_CREATING",
  "escrow_id": "esc_..."
}
```

### Emitted Events

- `escrow.created` (when available)

---

## POST /orders/{order_id}/escrow/fund

Funds the escrow using reserved buyer balance.

### Request

```http
POST /api/v1/orders/ord_abc123/escrow/fund
Authorization: Bearer ohk_live_xxx
Idempotency-Key: {uuid}
Content-Type: application/json
```

```json
{ "source": "AIRTM_BALANCE", "amount": "120.00" }
```

### Response

```json
{
  "order_id": "ord_...",
  "status": "ESCROW_FUNDED",
  "escrow": { "trustless_contract_id": "C...", "status": "FUNDED" }
}
```

### Emitted Events

- `escrow.funding_started`
- `escrow.funded`
- `order.state_changed`

---

## GET /orders/{order_id}/escrow

Gets the escrow technical state.

### Request

```http
GET /api/v1/orders/ord_abc123/escrow
Authorization: Bearer ohk_live_xxx
```

### Response

```json
{
  "escrow_id": "esc_...",
  "trustless_contract_id": "C...",
  "status": "FUNDED",
  "milestones": [
    { "milestone_ref": "m1", "amount": "60.00", "status": "OPEN" }
  ]
}
```

---

## POST /orders/{order_id}/milestones/{milestone_ref}/complete

Marks a milestone as completed (optional flow).

### Request

```http
POST /api/v1/orders/ord_abc123/milestones/m1/complete
Authorization: Bearer ohk_live_xxx
Idempotency-Key: {uuid}
Content-Type: application/json
```

```json
{ "completed_by": "buyer", "note": "Looks good" }
```

### Response

```json
{ "order_id": "ord_...", "milestone_ref": "m1", "status": "COMPLETED" }
```
