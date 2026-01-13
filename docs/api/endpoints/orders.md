# Orders Endpoints

## POST /orders

Creates an off-chain order.

### Request

```http
POST /api/v1/orders
Authorization: Bearer ohk_live_xxx
Idempotency-Key: {uuid}
Content-Type: application/json
```

```json
{
  "client_order_ref": "ORD-10001",
  "buyer_id": "usr_buyer",
  "seller_id": "usr_seller",
  "amount": "120.00",
  "currency": "USD",
  "title": "Logo design",
  "description": "Need a logo",
  "milestones": [
    { "milestone_ref": "m1", "title": "Draft", "amount": "60.00" },
    { "milestone_ref": "m2", "title": "Final", "amount": "60.00" }
  ],
  "metadata": { "category": "design" }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `buyer_id` | string | Yes | Buyer user ID |
| `seller_id` | string | Yes | Seller user ID |
| `amount` | string | Yes | Decimal string with 2 decimals |
| `currency` | string | Yes | `USD` |
| `client_order_ref` | string | No | Client dedupe reference |
| `milestones` | array | No | Optional milestones for escrow |
| `metadata` | object | No | Free-form metadata |

### Response

```json
{
  "id": "ord_...",
  "client_order_ref": "ORD-10001",
  "status": "ORDER_CREATED",
  "amount": "120.00",
  "currency": "USD",
  "created_at": "2026-01-12T10:00:00.000Z"
}
```

### Emitted Events

- `order.created`

---

## GET /orders/{order_id}

Reads the full order state.

### Request

```http
GET /api/v1/orders/ord_abc123
Authorization: Bearer ohk_live_xxx
```

### Response

```json
{
  "id": "ord_...",
  "status": "ESCROW_FUNDED",
  "buyer_id": "usr_...",
  "seller_id": "usr_...",
  "amount": "120.00",
  "currency": "USD",
  "escrow": {
    "escrow_id": "esc_...",
    "trustless_contract_id": "C...",
    "status": "FUNDED"
  },
  "dispute_id": null,
  "timestamps": { "created_at": "...", "updated_at": "..." }
}
```

---

## GET /orders

Lists orders with filters.

### Request

```http
GET /api/v1/orders?status=IN_PROGRESS&buyer_id=usr_abc&limit=20
Authorization: Bearer ohk_live_xxx
```

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by order status |
| `buyer_id` | string | Filter by buyer |
| `seller_id` | string | Filter by seller |
| `created_after` | string | ISO timestamp |
| `created_before` | string | ISO timestamp |
| `limit` | int | Items per page (max 100) |
| `cursor` | string | Pagination cursor |

### Response

```json
{
  "data": [
    {
      "id": "ord_...",
      "status": "IN_PROGRESS",
      "amount": "120.00",
      "currency": "USD",
      "created_at": "2026-01-12T10:00:00.000Z"
    }
  ],
  "pagination": {
    "has_more": true,
    "next_cursor": "ord_def456"
  }
}
```

---

## POST /orders/{order_id}/reserve

Reserves buyer balance (logical hold).

### Request

```http
POST /api/v1/orders/ord_abc123/reserve
Authorization: Bearer ohk_live_xxx
Idempotency-Key: {uuid}
Content-Type: application/json
```

```json
{ "amount": "120.00" }
```

### Response

```json
{
  "order_id": "ord_...",
  "status": "FUNDS_RESERVED",
  "reserved_amount": "120.00",
  "balance_snapshot": { "available": "80.00", "reserved": "120.00" }
}
```

### Emitted Events

- `order.reserved`
- `balance.updated`

---

## POST /orders/{order_id}/cancel

Cancels an order before escrow and releases funds.

### Request

```http
POST /api/v1/orders/ord_abc123/cancel
Authorization: Bearer ohk_live_xxx
Idempotency-Key: {uuid}
Content-Type: application/json
```

```json
{ "reason": "buyer_cancelled" }
```

### Response

```json
{ "order_id": "ord_...", "status": "CLOSED" }
```

### Errors

| Code | HTTP | Cause |
|------|------|-------|
| `INVALID_STATE` | 409 | Order cannot be canceled |
| `ORDER_NOT_FOUND` | 404 | Order not found |
