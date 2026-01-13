# Naming Conventions

## ID Prefixes

All system-generated IDs use prefixes to identify the resource type:

| Resource | Prefix | Example |
|---------|---------|---------|
| User | `usr_` | `usr_abc123def456` |
| Order | `ord_` | `ord_xyz789ghi012` |
| Top-up | `topup_` | `topup_jkl345mno678` |
| Escrow | `esc_` | `esc_pqr901stu234` |
| Dispute | `dsp_` | `dsp_vwx567yza890` |
| Withdrawal | `wd_` | `wd_bcd123efg456` |
| Event | `evt_` | `evt_hij789klm012` |
| Audit Log | `aud_` | `aud_nop345qrs678` |
| API Key | `key_` | `key_tuv901wxy234` |
| Marketplace | `mkt_` | `mkt_zab567cde890` |

### ID Format

```
{prefix}_{nanoid(21)}
```

- Use nanoid with URL-safe alphabet
- 21 characters of entropy (similar to UUID but shorter)

## Amount Format

- **Type**: String (never float)
- **Precision**: 2 decimals
- **Examples**: `"100.00"`, `"0.50"`, `"1234.56"`

```json
{
  "amount": "120.00",
  "currency": "USD"
}
```

## Date Format

- **Standard**: ISO 8601
- **Timezone**: UTC always
- **Format**: `YYYY-MM-DDTHH:mm:ss.sssZ`

```json
{
  "created_at": "2026-01-12T14:30:00.000Z",
  "updated_at": "2026-01-12T15:45:30.123Z"
}
```

## Endpoint Names

- **Style**: kebab-case for paths
- **Resources**: plural for collections
- **Actions**: verbs as sub-resources

```
GET    /users
POST   /users
GET    /users/{user_id}
POST   /users/{user_id}/airtm/link

POST   /orders
GET    /orders/{order_id}
POST   /orders/{order_id}/reserve
POST   /orders/{order_id}/cancel
POST   /orders/{order_id}/escrow
POST   /orders/{order_id}/escrow/fund
```

## Event Names

- **Format**: `{resource}.{action}`
- **Style**: snake_case for compound actions

| Event | Description |
|--------|-------------|
| `user.created` | User created |
| `user.airtm_linked` | Airtm linked |
| `order.created` | Order created |
| `order.reserved` | Funds reserved |
| `order.state_changed` | State change |
| `escrow.funded` | Escrow funded |
| `escrow.released` | Funds released |
| `topup.succeeded` | Top-up succeeded |
| `withdrawal.completed` | Withdrawal completed |

## States (State Machine)

- **Format**: UPPER_SNAKE_CASE
- **Prefix**: Resource name

```
TOPUP_CREATED
TOPUP_AWAITING_USER_CONFIRMATION
TOPUP_PROCESSING
TOPUP_SUCCEEDED
TOPUP_FAILED

ORDER_CREATED
FUNDS_RESERVED
ESCROW_FUNDED
IN_PROGRESS
RELEASED
REFUNDED
DISPUTED
CLOSED
```

## Error Codes

- **Format**: UPPER_SNAKE_CASE
- **Structure**: Semantic category

```
VALIDATION_ERROR
INVALID_AMOUNT_FORMAT
INSUFFICIENT_FUNDS
ORDER_NOT_FOUND
PROVIDER_TIMEOUT
```

## Environment Variable Names

- **Format**: UPPER_SNAKE_CASE
- **Prefixes by category**:

| Prefix | Category |
|---------|----------|
| `NODE_` | Node.js config |
| `DATABASE_` | Database |
| `REDIS_` | Redis |
| `AIRTM_` | Airtm provider |
| `TRUSTLESS_` | Trustless Work provider |
| `OFFERHUB_` | Product configuration |
| `PUBLIC_` | Public URLs |

## Code Names

### TypeScript/JavaScript

| Element | Style | Example |
|----------|--------|---------|
| Classes | PascalCase | `OrderService` |
| Interfaces | PascalCase with I (optional) | `Order`, `IOrderRepository` |
| Types | PascalCase | `OrderStatus` |
| Enums | PascalCase | `TopUpState` |
| Enum values | UPPER_SNAKE_CASE | `TOPUP_SUCCEEDED` |
| Functions | camelCase | `createOrder()` |
| Variables | camelCase | `orderId` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_ATTEMPTS` |
| Files (modules) | kebab-case | `order.service.ts` |
| Directories | kebab-case | `api-keys/` |

### Database

| Element | Style | Example |
|----------|--------|---------|
| Tables | snake_case, plural | `orders`, `audit_logs` |
| Columns | snake_case | `created_at`, `buyer_id` |
| Indexes | `idx_{table}_{columns}` | `idx_orders_status` |
| Foreign keys | `fk_{table}_{ref}` | `fk_orders_buyer` |

## HTTP Headers

| Header | Usage |
|--------|-----|
| `Authorization` | `Bearer {api_key}` |
| `Idempotency-Key` | UUID for mutable POSTs |
| `X-Request-ID` | Request correlation |
| `Content-Type` | `application/json` |
| `Accept` | `application/json` or `text/event-stream` |
