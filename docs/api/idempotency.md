# Idempotency

## Concept

Idempotency guarantees that an operation produces the same result no matter how many times it is executed. This is critical for:

- Safe retries after network errors
- Preventing duplicate charges
- Simplifying client integration

## Basic Usage

```http
POST /orders
Authorization: Bearer ohk_live_xxx
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "buyer_id": "usr_abc",
  "seller_id": "usr_xyz",
  "amount": "100.00",
  "currency": "USD"
}
```

### Key Format

- **Type**: UUID v4 recommended
- **Length**: 36 characters (with dashes)
- **Generation**: Client-generated, not server-generated

```typescript
// Example client-side
const idempotencyKey = crypto.randomUUID();
```

## Behavior

### First Request

```
POST /orders + Key: abc-123
-> Processed normally
-> Store (key, request_hash, response) in DB
-> Return 201 Created
```

### Repeated Request (same key, same body)

```
POST /orders + Key: abc-123 (same body)
-> Detect existing key
-> Verify request_hash matches
-> Return original response (201 or whatever it was)
```

### Request with Reused Key (different body)

```
POST /orders + Key: abc-123 (different body)
-> Detect existing key
-> Detect request_hash does NOT match
-> Return 409 Conflict
```

```json
{
  "error": {
    "code": "IDEMPOTENCY_KEY_REUSED",
    "message": "This idempotency key was used with a different request body"
  }
}
```

### Original Request Still Processing

```
POST /orders + Key: abc-123 (while another request is processing)
-> Detect key in "processing" state
-> Return 409 Conflict with a special code
```

```json
{
  "error": {
    "code": "IDEMPOTENCY_KEY_IN_PROGRESS",
    "message": "A request with this key is still being processed"
  }
}
```

## Idempotent Endpoints

### Require Idempotency-Key

| Endpoint | Key Association |
|----------|-----------------|
| `POST /topups` | `(marketplace, user_id, amount, currency)` |
| `POST /orders` | `(buyer_id, seller_id, amount, currency, client_order_ref?)` |
| `POST /orders/{id}/reserve` | `(order_id)` |
| `POST /orders/{id}/escrow` | `(order_id)` |
| `POST /orders/{id}/escrow/fund` | `(order_id)` |
| `POST /orders/{id}/release` | `(order_id)` |
| `POST /orders/{id}/refund` | `(order_id)` |
| `POST /orders/{id}/disputes` | `(order_id)` |
| `POST /disputes/{id}/resolve` | `(dispute_id)` |
| `POST /withdrawals` | `(user_id, amount, currency, destination.ref)` |
| `POST /withdrawals/{id}/commit` | `(withdrawal_id)` |

### Naturally Idempotent (no key required)

| Endpoint | Reason |
|----------|--------|
| `POST /topups/{id}/refresh` | Sync only, no mutation |
| `POST /withdrawals/{id}/refresh` | Sync only, no mutation |
| `GET *` | Reads are idempotent |

## Retention Windows

| Resource | Window | Justification |
|---------|---------|---------------|
| Top-ups | 24 hours | Short process |
| Withdrawals | 24 hours | Short process |
| Orders | 7 days | Long process, multiple steps |
| Escrow operations | 7 days | Part of the order flow |
| Disputes | Indefinite | Critical, never duplicate |

After the window, the key can be reused (as if it were new).

## Rules by Endpoint

### POST /topups

```typescript
// Key must be unique per:
key_scope = hash(marketplace_id, user_id, amount, currency)
```

**Behavior if top-up already exists:**
- Returns the same `topup_id` and `confirmation_uri`

### POST /orders

```typescript
// Key must be unique per:
key_scope = hash(buyer_id, seller_id, amount, currency, client_order_ref?)
```

**Tip**: Use `client_order_ref` as part of the natural key for dedupe.

### POST /orders/{id}/reserve

**Behavior if already reserved:**
- If already in `FUNDS_RESERVED`: returns 200 with current state
- Does not allow reserving twice

### POST /orders/{id}/escrow

**Behavior if escrow exists:**
- Returns the same `escrow_id`
- Does not create a second escrow

### POST /orders/{id}/escrow/fund

**Behavior if already funded:**
- If already `ESCROW_FUNDED`: returns 200 with current state
- Never funds twice

### POST /orders/{id}/release and /refund

**Behavior if already executed:**
- If already `RELEASED`/`REFUNDED`: returns final state
- Does not execute twice in Trustless Work

### POST /orders/{id}/disputes

**Behavior if dispute exists:**
- Returns existing `dispute_id`
- Does not open a second dispute

### POST /disputes/{id}/resolve

**Behavior if already resolved:**
- Returns existing resolution
- Does not resolve twice

### POST /withdrawals

```typescript
// Key must be unique per:
key_scope = hash(user_id, amount, currency, destination.ref)
```

**Behavior if it exists:**
- Returns the same `withdrawal_id`

## Webhooks (Deduplication)

Provider webhooks have their own deduplication:

```typescript
// Persist in DB
webhook_events (
  provider: 'airtm' | 'trustless_work',
  event_id: string,  // From provider
  processed_at: timestamp
)
```

### Behavior

1. Webhook arrives with `event_id`
2. Check if `(provider, event_id)` exists
3. If it exists: respond `200 OK` without processing
4. If it does not exist: process and store

```json
// Response for duplicate webhook
{
  "status": "ok",
  "duplicate": true
}
```

## Implementation (Server)

### DB Schema

```sql
CREATE TABLE idempotency_keys (
  id UUID PRIMARY KEY,
  key VARCHAR(255) NOT NULL,
  marketplace_id VARCHAR(50) NOT NULL,
  request_hash VARCHAR(64) NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'processing' | 'completed' | 'failed'
  response_status INT,
  response_body JSONB,
  created_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,

  UNIQUE(key, marketplace_id)
);

CREATE INDEX idx_idempotency_expires ON idempotency_keys(expires_at);
```

### Processing Flow

```typescript
async function withIdempotency(key: string, fn: () => Promise<Response>) {
  // 1. Look for existing key
  const existing = await db.idempotencyKeys.find(key);

  if (existing) {
    // 2a. If processing, error
    if (existing.status === 'processing') {
      throw new IdempotencyInProgressError();
    }

    // 2b. If completed, verify hash
    if (existing.requestHash !== currentHash) {
      throw new IdempotencyKeyReusedError();
    }

    // 2c. Return stored response
    return existing.response;
  }

  // 3. Create record in 'processing' state
  await db.idempotencyKeys.create({
    key,
    status: 'processing',
    requestHash: currentHash,
  });

  try {
    // 4. Execute operation
    const response = await fn();

    // 5. Store response
    await db.idempotencyKeys.update(key, {
      status: 'completed',
      response,
    });

    return response;
  } catch (error) {
    // 6. Mark failed (allows retry with same key)
    await db.idempotencyKeys.update(key, {
      status: 'failed',
    });
    throw error;
  }
}
```

## Best Practices (Client)

1. **Generate the key before the request**
   ```typescript
   const key = crypto.randomUUID();
   await fetch('/orders', {
     headers: { 'Idempotency-Key': key }
   });
   ```

2. **Reuse the key on retries**
   ```typescript
   async function createOrderWithRetry(data, maxRetries = 3) {
     const key = crypto.randomUUID(); // Generate ONCE

     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fetch('/orders', {
           headers: { 'Idempotency-Key': key }, // Same key
           body: JSON.stringify(data)
         });
       } catch (e) {
         if (i === maxRetries - 1) throw e;
         await sleep(Math.pow(2, i) * 1000); // Backoff
       }
     }
   }
   ```

3. **Do not reuse keys across different operations**
   ```typescript
   // BAD
   const key = 'my-static-key';
   await createOrder(key, order1);
   await createOrder(key, order2); // Error 409!

   // GOOD
   await createOrder(crypto.randomUUID(), order1);
   await createOrder(crypto.randomUUID(), order2);
   ```

4. **Use client_order_ref for natural dedupe**
   ```typescript
   // Does your system have its own ID? Use it
   await sdk.orders.create({
     client_order_ref: 'MY-SYSTEM-ORD-123', // Natural dedupe
     buyer_id: '...',
     amount: '100.00'
   });
   ```
