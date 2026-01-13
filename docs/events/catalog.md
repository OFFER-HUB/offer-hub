# Event Catalog

## Event Format

```json
{
  "id": "evt_...",
  "type": "order.created",
  "occurred_at": "2026-01-12T12:00:00Z",
  "marketplace_id": "mkt_...",
  "actor": { "type": "user|system|support|webhook", "id": "usr_...|sup_...|airtm|trustless" },
  "resource": { "type": "order|topup|withdrawal|dispute|escrow", "id": "..." },
  "data": {}
}
```

## User and Balance Events

- `user.created`
- `user.airtm_linked`
- `balance.updated`

## Top-up Events

- `topup.created`
- `topup.confirmation_required`
- `topup.processing`
- `topup.succeeded`
- `topup.failed`
- `topup.canceled`

## Order Events

- `order.created`
- `order.reserved`
- `order.canceled`
- `order.state_changed`

## Escrow Events (Trustless Work)

- `escrow.created`
- `escrow.funding_started`
- `escrow.funded`
- `escrow.milestone_completed`
- `escrow.released`
- `escrow.refunded`

## Dispute Events

- `dispute.opened`
- `dispute.updated`
- `dispute.resolved`

## Withdrawal Events

- `withdrawal.created`
- `withdrawal.committed`
- `withdrawal.pending`
- `withdrawal.pending_user_action`
- `withdrawal.completed`
- `withdrawal.failed`
- `withdrawal.canceled`
