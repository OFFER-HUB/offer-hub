# Release and Refund Endpoints

## POST /orders/{order_id}/release

Releases funds to the seller (full or partial).

### Request

```http
POST /api/v1/orders/ord_abc123/release
Authorization: Bearer ohk_live_xxx
Idempotency-Key: {uuid}
Content-Type: application/json
```

```json
{ "mode": "FULL", "amount": "60.00", "reason": "milestone_m1" }
```

### Response

```json
{ "order_id": "ord_...", "status": "RELEASED", "released_amount": "60.00" }
```

### Emitted Events

- `escrow.released`
- `order.state_changed`

---

## POST /orders/{order_id}/refund

Refunds funds to the buyer (full or partial).

### Request

```http
POST /api/v1/orders/ord_abc123/refund
Authorization: Bearer ohk_live_xxx
Idempotency-Key: {uuid}
Content-Type: application/json
```

```json
{ "mode": "FULL", "amount": "120.00", "reason": "not_delivered" }
```

### Response

```json
{ "order_id": "ord_...", "status": "REFUNDED", "refunded_amount": "120.00" }
```

### Emitted Events

- `escrow.refunded`
- `order.state_changed`
