# State Machines

## TopUp States

States for balance top-ups via Airtm.

```mermaid
stateDiagram-v2
    [*] --> TOPUP_CREATED: POST /topups

    TOPUP_CREATED --> TOPUP_AWAITING_USER_CONFIRMATION: Airtm returns URI

    TOPUP_AWAITING_USER_CONFIRMATION --> TOPUP_PROCESSING: User confirms in Airtm
    TOPUP_AWAITING_USER_CONFIRMATION --> TOPUP_CANCELED: User cancels / timeout

    TOPUP_PROCESSING --> TOPUP_SUCCEEDED: Airtm confirms payment
    TOPUP_PROCESSING --> TOPUP_FAILED: Airtm rejects payment

    TOPUP_SUCCEEDED --> [*]
    TOPUP_FAILED --> [*]
    TOPUP_CANCELED --> [*]
```

| State | Description |
|--------|-------------|
| `TOPUP_CREATED` | Top-up started, waiting to generate confirmation URI |
| `TOPUP_AWAITING_USER_CONFIRMATION` | URI generated, waiting for user confirmation in Airtm |
| `TOPUP_PROCESSING` | User confirmed, Airtm processing payment |
| `TOPUP_SUCCEEDED` | Payment succeeded, balance updated |
| `TOPUP_FAILED` | Payment failed (rejected, error, etc.) |
| `TOPUP_CANCELED` | Canceled by user or timeout |

### Terminal States

- `TOPUP_SUCCEEDED`
- `TOPUP_FAILED`
- `TOPUP_CANCELED`

---

## Order States

States for buy/sell orders.

```mermaid
stateDiagram-v2
    [*] --> ORDER_CREATED: POST /orders

    ORDER_CREATED --> FUNDS_RESERVED: POST /orders/{id}/reserve
    ORDER_CREATED --> CLOSED: POST /orders/{id}/cancel

    FUNDS_RESERVED --> ESCROW_CREATING: POST /orders/{id}/escrow
    FUNDS_RESERVED --> CLOSED: POST /orders/{id}/cancel

    ESCROW_CREATING --> ESCROW_FUNDING: Escrow created in TW
    ESCROW_FUNDING --> ESCROW_FUNDED: POST /orders/{id}/escrow/fund

    ESCROW_FUNDED --> IN_PROGRESS: Work starts

    IN_PROGRESS --> RELEASE_REQUESTED: POST /orders/{id}/release
    IN_PROGRESS --> REFUND_REQUESTED: POST /orders/{id}/refund
    IN_PROGRESS --> DISPUTED: POST /orders/{id}/disputes

    RELEASE_REQUESTED --> RELEASED: TW confirms release
    REFUND_REQUESTED --> REFUNDED: TW confirms refund

    DISPUTED --> RELEASED: Resolution: release
    DISPUTED --> REFUNDED: Resolution: refund

    RELEASED --> CLOSED: Cleanup
    REFUNDED --> CLOSED: Cleanup

    CLOSED --> [*]
```

| State | Description |
|--------|-------------|
| `ORDER_CREATED` | Order created off-chain, no funds reserved |
| `FUNDS_RESERVED` | Buyer balance reserved (logical hold) |
| `ESCROW_CREATING` | Creating escrow contract in Trustless Work |
| `ESCROW_FUNDING` | Funding escrow with reserved balance |
| `ESCROW_FUNDED` | Escrow funded, funds locked on-chain |
| `IN_PROGRESS` | Work in progress |
| `RELEASE_REQUESTED` | Release requested for the seller |
| `RELEASED` | Funds released to the seller |
| `REFUND_REQUESTED` | Refund requested for the buyer |
| `REFUNDED` | Funds returned to the buyer |
| `DISPUTED` | Dispute opened, flow frozen |
| `CLOSED` | Order completed |

### Valid Transitions

```typescript
const ORDER_TRANSITIONS = {
  ORDER_CREATED: ['FUNDS_RESERVED', 'CLOSED'],
  FUNDS_RESERVED: ['ESCROW_CREATING', 'CLOSED'],
  ESCROW_CREATING: ['ESCROW_FUNDING'],
  ESCROW_FUNDING: ['ESCROW_FUNDED'],
  ESCROW_FUNDED: ['IN_PROGRESS'],
  IN_PROGRESS: ['RELEASE_REQUESTED', 'REFUND_REQUESTED', 'DISPUTED'],
  RELEASE_REQUESTED: ['RELEASED'],
  REFUND_REQUESTED: ['REFUNDED'],
  DISPUTED: ['RELEASED', 'REFUNDED'],
  RELEASED: ['CLOSED'],
  REFUNDED: ['CLOSED'],
  CLOSED: [],
};
```

### Terminal States

- `CLOSED` (only terminal state)

### Business Rules

1. **Cancel only pre-escrow**: Can only cancel in `ORDER_CREATED` or `FUNDS_RESERVED`
2. **One dispute per order**: Cannot open another dispute if one is active
3. **Release/Refund are exclusive**: Once one starts, you cannot switch to the other

---

## Withdrawal States

States for withdrawals via Airtm.

```mermaid
stateDiagram-v2
    [*] --> WITHDRAWAL_CREATED: POST /withdrawals

    WITHDRAWAL_CREATED --> WITHDRAWAL_COMMITTED: POST /withdrawals/{id}/commit
    WITHDRAWAL_CREATED --> WITHDRAWAL_CANCELED: Cancellation

    WITHDRAWAL_COMMITTED --> WITHDRAWAL_PENDING: Airtm processing

    WITHDRAWAL_PENDING --> WITHDRAWAL_PENDING_USER_ACTION: User action required
    WITHDRAWAL_PENDING --> WITHDRAWAL_COMPLETED: Airtm confirms
    WITHDRAWAL_PENDING --> WITHDRAWAL_FAILED: Airtm rejects

    WITHDRAWAL_PENDING_USER_ACTION --> WITHDRAWAL_PENDING: User completes action
    WITHDRAWAL_PENDING_USER_ACTION --> WITHDRAWAL_FAILED: Timeout / failure

    WITHDRAWAL_COMPLETED --> [*]
    WITHDRAWAL_FAILED --> [*]
    WITHDRAWAL_CANCELED --> [*]
```

| State | Description |
|--------|-------------|
| `WITHDRAWAL_CREATED` | Withdrawal started, waiting for commit |
| `WITHDRAWAL_COMMITTED` | Commit done, waiting for processing |
| `WITHDRAWAL_PENDING` | Airtm processing withdrawal |
| `WITHDRAWAL_PENDING_USER_ACTION` | User action required (KYC, verification) |
| `WITHDRAWAL_COMPLETED` | Withdrawal completed successfully |
| `WITHDRAWAL_FAILED` | Withdrawal failed |
| `WITHDRAWAL_CANCELED` | Withdrawal canceled |

### Terminal States

- `WITHDRAWAL_COMPLETED`
- `WITHDRAWAL_FAILED`
- `WITHDRAWAL_CANCELED`

---

## Escrow States (internal)

Escrow states in Trustless Work (mirrored locally).

```mermaid
stateDiagram-v2
    [*] --> CREATING: Call TW API

    CREATING --> CREATED: TW confirms creation
    CREATED --> FUNDING: Starting funding

    FUNDING --> FUNDED: TW confirms funds

    FUNDED --> RELEASING: Release requested
    FUNDED --> REFUNDING: Refund requested
    FUNDED --> DISPUTED: Dispute opened

    RELEASING --> RELEASED: TW confirms
    REFUNDING --> REFUNDED: TW confirms

    DISPUTED --> RELEASED: Release resolution
    DISPUTED --> REFUNDED: Refund resolution

    RELEASED --> [*]
    REFUNDED --> [*]
```

| State | Description |
|--------|-------------|
| `CREATING` | Creating contract in Trustless Work |
| `CREATED` | Contract created, not funded |
| `FUNDING` | Funding contract |
| `FUNDED` | Funds locked in contract |
| `RELEASING` | Releasing funds to the seller |
| `RELEASED` | Funds released |
| `REFUNDING` | Returning funds to the buyer |
| `REFUNDED` | Funds returned |
| `DISPUTED` | Active dispute |

---

## Dispute States (internal)

```mermaid
stateDiagram-v2
    [*] --> OPEN: POST /orders/{id}/disputes

    OPEN --> UNDER_REVIEW: Support assigned
    UNDER_REVIEW --> RESOLVED: POST /disputes/{id}/resolve

    RESOLVED --> [*]
```

| State | Description |
|--------|-------------|
| `OPEN` | Dispute opened, awaiting review |
| `UNDER_REVIEW` | Support reviewing the case |
| `RESOLVED` | Dispute resolved (release/refund/split) |

---

## Balance States (conceptual)

A user balance has two components:

```typescript
interface Balance {
  available: string;  // Available to use
  reserved: string;   // Reserved in active orders
}
```

### Balance Transitions

| Operation | Effect |
|-----------|--------|
| Top-up succeeded | `available += amount` |
| Reserve (order) | `available -= amount`, `reserved += amount` |
| Cancel (pre-escrow) | `available += amount`, `reserved -= amount` |
| Fund escrow | `reserved -= amount` (funds go on-chain) |
| Release | Seller: `available += amount` |
| Refund | Buyer: `available += amount` |
| Withdrawal created | `available -= amount` |
| Withdrawal failed/canceled | `available += amount` |
