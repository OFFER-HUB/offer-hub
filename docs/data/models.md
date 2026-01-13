# Data Models

## Core Entities

- `users` - Marketplace users with Airtm linkage
- `topups` - Airtm payins and their state
- `orders` - Off-chain order records
- `escrows` - Trustless Work escrow records
- `disputes` - Dispute cases and resolutions
- `withdrawals` - Airtm payouts and their state
- `balances` - User balances (available/reserved)
- `events` - Event stream for UI updates
- `audit_logs` - Audit trail for actions
- `idempotency_keys` - Deduplication of mutable POSTs
- `webhook_events` - Provider webhook deduplication
- `api_keys` - Marketplace API keys

## Key Relationships

- `users` 1:N `topups`
- `users` 1:N `withdrawals`
- `users` 1:N `orders` (buyer_id, seller_id)
- `orders` 1:1 `escrows`
- `orders` 0..1 `disputes`
- `orders` 1:N `events`
- `users` 1:1 `balances`

## IDs and References

- IDs use prefixes like `usr_`, `ord_`, `topup_`, `esc_`, `dsp_`, `wd_`, `evt_`, `aud_`
- Provider references stored per entity:
  - `topups.airtm_payin_id`
  - `withdrawals.airtm_payout_id`
  - `escrows.trustless_contract_id`

## Balance Model

```typescript
interface Balance {
  available: string;
  reserved: string;
}
```

- `available` decreases on reserve and increases on top-up, refund, release, or withdrawal cancel
- `reserved` increases on reserve and decreases on fund escrow or cancel
