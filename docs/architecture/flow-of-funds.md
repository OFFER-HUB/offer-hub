# Flow of Funds

## High-Level Diagram

```mermaid
sequenceDiagram
    participant B as Buyer
    participant MP as Marketplace
    participant ORC as Orchestrator
    participant AIRTM as Airtm
    participant TW as Trustless Work
    participant S as Seller

    Note over B,S: 1. TOP-UP (Buyer adds balance)
    B->>MP: I want to top up $100
    MP->>ORC: POST /topups
    ORC->>AIRTM: Create payin
    AIRTM-->>ORC: confirmation_uri
    ORC-->>MP: { confirmation_uri }
    MP-->>B: Redirects to Airtm
    B->>AIRTM: Confirms payment
    AIRTM->>ORC: Webhook: payin.succeeded
    ORC->>ORC: Balance += $100

    Note over B,S: 2. CREATE ORDER + RESERVE
    B->>MP: Buy service for $80
    MP->>ORC: POST /orders
    ORC-->>MP: { order_id }
    MP->>ORC: POST /orders/{id}/reserve
    ORC->>ORC: available -= $80, reserved += $80
    ORC-->>MP: FUNDS_RESERVED

    Note over B,S: 3. CREATE + FUND ESCROW
    MP->>ORC: POST /orders/{id}/escrow
    ORC->>TW: Create escrow contract
    TW-->>ORC: { contract_id }
    MP->>ORC: POST /orders/{id}/escrow/fund
    ORC->>AIRTM: Transfer to Stellar wallet
    ORC->>TW: Fund escrow
    TW-->>ORC: Webhook: escrow.funded
    ORC->>ORC: reserved -= $80 (funds on-chain)

    Note over B,S: 4. WORK + RELEASE
    S->>MP: Deliver work
    B->>MP: Approve work
    MP->>ORC: POST /orders/{id}/release
    ORC->>TW: Release to seller
    TW-->>ORC: Webhook: escrow.released
    ORC->>ORC: Seller balance += $80

    Note over B,S: 5. WITHDRAWAL (Seller withdraws)
    S->>MP: I want to withdraw $80
    MP->>ORC: POST /withdrawals
    ORC->>AIRTM: Create payout
    AIRTM-->>ORC: Webhook: payout.completed
    ORC->>ORC: Seller balance -= $80
    AIRTM->>S: Funds to bank account
```

## Phase Detail

### Phase 1: Top-up (Add Balance)

The buyer tops up their marketplace account balance.

```mermaid
flowchart LR
    A[Buyer] -->|1. Requests top-up| B[Marketplace]
    B -->|2. POST /topups| C[Orchestrator]
    C -->|3. Create payin| D[Airtm]
    D -->|4. confirmation_uri| C
    C -->|5. Return URI| B
    B -->|6. Redirect| A
    A -->|7. Confirm payment| D
    D -->|8. Webhook| C
    C -->|9. Balance ++| C
```

**Money flow:**
- Buyer pays via payment method (card, transfer, etc.)
- Airtm receives fiat funds
- Buyer balance increases in the Orchestrator

**TopUp states:**
```
TOPUP_CREATED -> TOPUP_AWAITING_USER_CONFIRMATION -> TOPUP_PROCESSING -> TOPUP_SUCCEEDED
```

---

### Phase 2: Create Order + Reserve Funds

The buyer starts a purchase and funds are reserved.

```mermaid
flowchart LR
    A[Buyer] -->|1. Start purchase| B[Marketplace]
    B -->|2. POST /orders| C[Orchestrator]
    C -->|3. Create order| C
    B -->|4. POST /reserve| C
    C -->|5. Logical hold| C
    C -->|6. FUNDS_RESERVED| B
```

**Money flow:**
- No real money movement
- Only a logical hold in the database
- `available -= amount`, `reserved += amount`

**Order states:**
```
ORDER_CREATED -> FUNDS_RESERVED
```

---

### Phase 3: Create and Fund Escrow

Reserved funds move to the non-custodial escrow.

```mermaid
flowchart LR
    A[Marketplace] -->|1. POST /escrow| B[Orchestrator]
    B -->|2. Create contract| C[Trustless Work]
    C -->|3. contract_id| B
    A -->|4. POST /escrow/fund| B
    B -->|5. Fund contract| C
    C -->|6. Webhook: funded| B
    B -->|7. ESCROW_FUNDED| A
```

**Money flow:**
- Orchestrator uses the buyer Airtm balance
- Transfers to a Stellar wallet
- Funds the smart contract in Trustless Work
- Funds are now locked on-chain

**Order states:**
```
FUNDS_RESERVED -> ESCROW_CREATING -> ESCROW_FUNDING -> ESCROW_FUNDED
```

---

### Phase 4a: Release (Pay Seller)

The buyer approves the work and funds go to the seller.

```mermaid
flowchart LR
    A[Buyer] -->|1. Approve| B[Marketplace]
    B -->|2. POST /release| C[Orchestrator]
    C -->|3. Release| D[Trustless Work]
    D -->|4. Webhook: released| C
    C -->|5. Seller balance ++| C
    C -->|6. RELEASED| B
```

**Money flow:**
- Smart contract releases funds
- Funds go to the seller Stellar wallet
- Converted to Airtm balance for the seller
- Seller balance increases

---

### Phase 4b: Refund (Return to Buyer)

Work is not delivered and funds return to the buyer.

```mermaid
flowchart LR
    A[Seller/System] -->|1. Request refund| B[Marketplace]
    B -->|2. POST /refund| C[Orchestrator]
    C -->|3. Refund| D[Trustless Work]
    D -->|4. Webhook: refunded| C
    C -->|5. Buyer balance ++| C
    C -->|6. REFUNDED| B
```

**Money flow:**
- Smart contract returns funds
- Funds return to the buyer Stellar wallet
- Converted to Airtm balance for the buyer
- Buyer balance is restored

---

### Phase 4c: Dispute + Resolution

There is a conflict and support intervenes.

```mermaid
flowchart LR
    A[Buyer/Seller] -->|1. Open dispute| B[Marketplace]
    B -->|2. POST /disputes| C[Orchestrator]
    C -->|3. Freeze escrow| D[Trustless Work]

    E[Support] -->|4. Review case| C
    E -->|5. POST /resolve| C
    C -->|6. Release/Refund/Split| D
    D -->|7. Webhook| C
    C -->|8. Distribute funds| C
```

**Money flow (Split):**
- Support decides: 60% seller, 40% buyer
- Smart contract performs partial release + partial refund
- Each side receives its portion

---

### Phase 5: Withdrawal (Seller Withdrawal)

The seller withdraws funds to their bank account.

```mermaid
flowchart LR
    A[Seller] -->|1. Request withdrawal| B[Marketplace]
    B -->|2. POST /withdrawals| C[Orchestrator]
    C -->|3. Create payout| D[Airtm]
    D -->|4. Process withdrawal| D
    D -->|5. Webhook: completed| C
    C -->|6. Balance --| C
    D -->|7. Transfer| A
```

**Money flow:**
- Seller Airtm balance decreases
- Airtm sends funds to a bank account
- Or to a crypto wallet, depending on destination

**Withdrawal states:**
```
WITHDRAWAL_CREATED -> WITHDRAWAL_COMMITTED -> WITHDRAWAL_PENDING -> WITHDRAWAL_COMPLETED
```

---

## Balance Summary

### Buyer Balance

| Operation | available | reserved |
|-----------|-----------|----------|
| Initial state | 0.00 | 0.00 |
| Top-up $100 | +100.00 | 0.00 |
| Reserve $80 (order) | -80.00 | +80.00 |
| Fund escrow | 0.00 | -80.00 |
| **Final (if release)** | **20.00** | **0.00** |
| **Final (if refund)** | **100.00** | **0.00** |

### Seller Balance

| Operation | available | reserved |
|-----------|-----------|----------|
| Initial state | 0.00 | 0.00 |
| Release $80 | +80.00 | 0.00 |
| Withdrawal $80 | -80.00 | 0.00 |
| **Final** | **0.00** | **0.00** |

---

## Key Points

1. **Funds are never held by the Orchestrator**: They are in Airtm or Trustless Work
2. **Escrow is non-custodial**: The Orchestrator has no private keys
3. **Balance is a mirror**: The Orchestrator tracks state; it does not move money directly
4. **Reconciliation**: Workers verify consistency with providers
