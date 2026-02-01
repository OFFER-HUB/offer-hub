# Event Catalog

## Overview

The OFFER-HUB Orchestrator uses an internal event bus to enable loose coupling between modules and support real-time notifications. Events are the foundation for:
- Real-time SSE streaming (Issue 6.2)
- Audit trail persistence (Issue 6.3)
- Future integrations (webhooks, analytics)

## Event Format

### Internal Event Structure (DomainEvent)

```typescript
interface DomainEvent<T> {
  eventId: string;           // evt_xxx (prefixed with nanoid)
  eventType: string;         // From EVENT_CATALOG
  occurredAt: string;        // ISO 8601 timestamp
  aggregateId: string;       // Resource ID (ord_xxx, topup_xxx, etc.)
  aggregateType: string;     // Resource type (Order, TopUp, etc.)
  payload: T;                // Event-specific data
  metadata: {
    correlationId?: string;
    causationId?: string;
    userId?: string;
    marketplaceId?: string;
  };
}
```

### SSE Stream Format (External)

```json
{
  "id": "evt_...",
  "type": "order.created",
  "occurred_at": "2026-01-12T12:00:00Z",
  "marketplace_id": "mkt_...",
  "actor": { "type": "user|system|support|webhook", "id": "usr_..." },
  "resource": { "type": "order|topup|withdrawal|dispute|escrow", "id": "..." },
  "data": {}
}
```

## Event Catalog

### User Events

| Event | Description | Payload |
|-------|-------------|---------|
| `user.created` | User account created | `{ userId, externalUserId, type, status }` |
| `user.airtm_linked` | User linked Airtm account | `{ userId, airtmUserId, linkedAt }` |
| `user.stellar_linked` | User linked Stellar address | `{ userId, stellarAddress, linkedAt }` |

### Balance Events

| Event | Description | Payload |
|-------|-------------|---------|
| `balance.credited` | Balance credited (topup, refund, release) | `{ userId, amount, source, newBalance }` |
| `balance.debited` | Balance debited (withdrawal, order) | `{ userId, amount, destination, newBalance }` |
| `balance.reserved` | Balance reserved for order | `{ userId, amount, orderId, reservedBalance }` |
| `balance.released` | Reserved balance released | `{ userId, amount, orderId, reason }` |

### Top-up Events

| Event | Description | Payload |
|-------|-------------|---------|
| `topup.created` | Top-up initiated | `{ userId, amount, currency }` |
| `topup.confirmation_required` | User needs to confirm payment | `{ topupId, confirmationUri }` |
| `topup.processing` | Airtm processing payment | `{ topupId, airtmPayinId }` |
| `topup.succeeded` | Top-up completed, balance credited | `{ topupId, userId, amount, newBalance }` |
| `topup.failed` | Top-up failed | `{ topupId, reason, errorCode }` |
| `topup.canceled` | Top-up canceled | `{ topupId, canceledBy }` |

### Order Events

| Event | Description | Payload |
|-------|-------------|---------|
| `order.created` | Order created | `{ orderId, buyerId, sellerId, amount, title }` |
| `order.funds_reserved` | Buyer funds reserved | `{ orderId, amount, buyerId, reservedBalance }` |
| `order.escrow_creating` | Escrow creation initiated | `{ orderId, escrowId }` |
| `order.escrow_funding` | Escrow being funded on Stellar | `{ orderId, escrowId, trustlessContractId }` |
| `order.escrow_funded` | Escrow successfully funded | `{ orderId, escrowId, fundedAt }` |
| `order.in_progress` | Order in progress | `{ orderId }` |
| `order.release_requested` | Release requested | `{ orderId, requestedBy }` |
| `order.released` | Funds released to seller | `{ orderId, sellerId, amount, releasedAt }` |
| `order.refund_requested` | Refund requested | `{ orderId, requestedBy }` |
| `order.refunded` | Funds refunded to buyer | `{ orderId, buyerId, amount, refundedAt }` |
| `order.disputed` | Order disputed | `{ orderId, disputeId, openedBy, reason }` |
| `order.closed` | Order closed | `{ orderId, finalStatus, closedAt }` |
| `order.canceled` | Order canceled | `{ orderId, canceledBy, reason }` |

### Escrow Events (Trustless Work)

| Event | Description | Payload |
|-------|-------------|---------|
| `escrow.created` | Escrow created | `{ escrowId, orderId, amount }` |
| `escrow.funding_started` | Escrow funding started | `{ escrowId, trustlessContractId }` |
| `escrow.funded` | Escrow funded on Stellar | `{ escrowId, fundedAt, amount }` |
| `escrow.milestone_completed` | Milestone completed | `{ escrowId, milestoneRef, completedAt }` |
| `escrow.released` | Escrow released | `{ escrowId, releasedAt, amount }` |
| `escrow.refunded` | Escrow refunded | `{ escrowId, refundedAt, amount }` |

### Dispute Events

| Event | Description | Payload |
|-------|-------------|---------|
| `dispute.opened` | Dispute opened | `{ disputeId, orderId, openedBy, reason }` |
| `dispute.under_review` | Dispute under review | `{ disputeId, reviewedBy }` |
| `dispute.resolved` | Dispute resolved | `{ disputeId, decision, resolvedBy, resolvedAt }` |

### Withdrawal Events

| Event | Description | Payload |
|-------|-------------|---------|
| `withdrawal.created` | Withdrawal initiated | `{ withdrawalId, userId, amount, destinationType }` |
| `withdrawal.committed` | Balance debited | `{ withdrawalId, userId, amount, committedBalance }` |
| `withdrawal.pending` | Pending with Airtm | `{ withdrawalId, airtmPayoutId }` |
| `withdrawal.pending_user_action` | User action required | `{ withdrawalId, actionRequired }` |
| `withdrawal.completed` | Withdrawal completed | `{ withdrawalId, userId, amount, completedAt }` |
| `withdrawal.failed` | Withdrawal failed | `{ withdrawalId, reason, errorCode }` |
| `withdrawal.canceled` | Withdrawal canceled | `{ withdrawalId, canceledBy, refundedToBalance }` |

## Wildcard Subscriptions

The event system supports wildcard subscriptions:

- `order.*` - All order events
- `topup.*` - All top-up events
- `withdrawal.*` - All withdrawal events
- `*` - All events

## Implementation

See `apps/api/src/modules/events/` for the complete implementation:
- `event-bus.service.ts` - Core event bus
- `event-catalog.ts` - Event type constants
- `types/` - TypeScript payload interfaces
- `docs/events/integration.md` - Integration guide for services
