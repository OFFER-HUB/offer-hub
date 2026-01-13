# AI.md - AI Agent Development Guide

This document is the **main entry point** for any AI agent contributing to the OFFER-HUB Orchestrator project. Read this document FIRST before making any changes.

---

## 🎯 What is this project?

OFFER-HUB Orchestrator is a self-hosted payment orchestrator that allows marketplaces to offer:
- User Balance (Web2)
- Top-ups (refills via Airtm)
- Checkout with escrow (via Trustless Work on Stellar)
- Withdrawals (payouts via Airtm)

**Architecture**: See [architecture/overview.md](./architecture/overview.md)

---

## 📚 Mandatory Documentation

Before contributing, you **MUST** read these documents:

| Priority | Document | Content |
|----------|----------|---------|
| 🔴 1 | [standards/naming-conventions.md](./standards/naming-conventions.md) | ID prefixes, formats, file naming |
| 🔴 2 | [api/errors.md](./api/errors.md) | Error codes, HTTP status, JSON format |
| 🔴 3 | [standards/validation-rules.md](./standards/validation-rules.md) | Validation rules, state guardrails |
| 🟡 4 | [api/overview.md](./api/overview.md) | Headers, pagination, rate limiting |
| 🟡 5 | [api/idempotency.md](./api/idempotency.md) | Idempotency rules |
| 🟡 6 | [architecture/state-machines.md](./architecture/state-machines.md) | TopUp, Order, Withdrawal states |
| 🟢 7 | [data/models.md](./data/models.md) | Entities and relationships |
| 🟢 8 | [standards/tech-stack.md](./standards/tech-stack.md) | Technologies and versions |

---

## 🏗️ Project Structure

```
offer-hub-orchestrator/
├── apps/
│   ├── api/                 # NestJS API (main server)
│   │   └── src/
│   │       ├── modules/     # Domain-specific modules (users, orders, etc.)
│   │       ├── common/      # Guards, filters, interceptors, pipes
│   │       ├── config/      # Configuration
│   │       └── providers/   # Airtm/Trustless Work integrations
│   └── worker/              # Background jobs (BullMQ)
├── packages/
│   ├── database/            # Prisma schema and client
│   ├── shared/              # Shared DTOs, types, enums, utils
│   └── sdk/                 # @offerhub/sdk client for marketplaces
└── docs/                    # This documentation
```

---

## ✅ Code Standards

### Naming Conventions

| Element | Style | Example |
|---------|-------|---------|
| Files | kebab-case | `order.service.ts` |
| Classes | PascalCase | `OrderService` |
| Interfaces | PascalCase | `Order`, `CreateOrderDto` |
| Functions | camelCase | `createOrder()` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_ATTEMPTS` |
| Enums | PascalCase + UPPER_SNAKE | `OrderStatus.ORDER_CREATED` |
| Directories | kebab-case | `audit-logs/` |

### ID Prefixes

**ALWAYS** use these prefixes when generating IDs:

| Resource | Prefix | Example |
|----------|--------|---------|
| User | `usr_` | `usr_abc123def456` |
| Order | `ord_` | `ord_xyz789ghi012` |
| Top-up | `topup_` | `topup_jkl345mno678` |
| Escrow | `esc_` | `esc_pqr901stu234` |
| Dispute | `dsp_` | `dsp_vwx567yza890` |
| Withdrawal | `wd_` | `wd_bcd123efg456` |
| Event | `evt_` | `evt_hij789klm012` |
| Audit Log | `aud_` | `aud_nop345qrs678` |
| API Key | `key_` | `key_tuv901wxy234` |

Format: `{prefix}_{nanoid(21)}`

### Amount Format

```typescript
// ✅ CORRECT
amount: "100.00"
amount: "0.50"

// ❌ INCORRECT
amount: 100.00      // Number, not string
amount: "100"       // Missing decimals
amount: "100.0"     // Only 1 decimal
```

### Date Format

```typescript
// ✅ CORRECT - ISO 8601 UTC
created_at: "2026-01-12T14:30:00.000Z"

// ❌ INCORRECT
created_at: "2026-01-12"              // Missing time
created_at: "01/12/2026 14:30:00"     // Incorrect format
```

---

## 🚨 Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable description",
    "details": {}
  }
}
```

### Common Error Codes

| Code | HTTP | When to use |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid fields in request |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `INSUFFICIENT_SCOPE` | 403 | Insufficient API key scope |
| `USER_NOT_FOUND` | 404 | User does not exist |
| `ORDER_NOT_FOUND` | 404 | Order does not exist |
| `INVALID_STATE` | 409 | Invalid state transition |
| `INSUFFICIENT_FUNDS` | 422 | Insufficient balance |
| `PROVIDER_TIMEOUT` | 504 | Airtm/Trustless timeout |

See full list in [api/errors.md](./api/errors.md)

---

## 📤 Response Format

### Creation Response (201)

```json
{
  "id": "ord_abc123",
  "status": "ORDER_CREATED",
  "amount": "100.00",
  "currency": "USD",
  "created_at": "2026-01-12T10:00:00.000Z",
  "updated_at": "2026-01-12T10:00:00.000Z"
}
```

### List Response (200)

```json
{
  "data": [...],
  "pagination": {
    "has_more": true,
    "next_cursor": "ord_abc123"
  }
}
```

---

## 🔄 States (State Machines)

### Order States

```
ORDER_CREATED → FUNDS_RESERVED → ESCROW_CREATING → ESCROW_FUNDING → ESCROW_FUNDED
→ IN_PROGRESS → RELEASE_REQUESTED/REFUND_REQUESTED/DISPUTED → RELEASED/REFUNDED → CLOSED
```

### TopUp States

```
TOPUP_CREATED → TOPUP_AWAITING_USER_CONFIRMATION → TOPUP_PROCESSING → TOPUP_SUCCEEDED/TOPUP_FAILED
```

### Withdrawal States

```
WITHDRAWAL_CREATED → WITHDRAWAL_COMMITTED → WITHDRAWAL_PENDING → WITHDRAWAL_COMPLETED/WITHDRAWAL_FAILED
```

See full diagrams in [architecture/state-machines.md](./architecture/state-machines.md)

---

## 🔑 Idempotency

**ALL state-mutating POSTs must:**
1. Accept `Idempotency-Key` header
2. Check if the key already exists
3. Return the original response if it's a duplicate
4. Return `409 IDEMPOTENCY_KEY_REUSED` if the body is different

See implementation in [api/idempotency.md](./api/idempotency.md)

---

## 🗄️ Database

### Main Models

- `users` - Users with Airtm linkage
- `balances` - Per-user balance (available/reserved)
- `topups` - Airtm payins
- `orders` - Marketplace orders
- `escrows` - Trustless Work records
- `disputes` - Dispute cases
- `withdrawals` - Airtm payouts
- `audit_logs` - Audit trail
- `idempotency_keys` - Deduplication

See schema at `packages/database/prisma/schema.prisma`

---

## 🧪 Testing

- Unit tests: Jest
- Integration tests: Supertest
- Naming: `*.spec.ts` for unit, `*.e2e-spec.ts` for e2e

---

## 📝 Checklist Before Every Change

Before making any change, verify:

- [ ] Am I using the correct naming convention?
- [ ] Do IDs have the correct prefix?
- [ ] Are amounts strings with 2 decimal places?
- [ ] Are dates ISO 8601 UTC?
- [ ] Do errors follow the standard format?
- [ ] Does the endpoint have idempotency if mutable?
- [ ] Am I respecting valid state transitions?

---

## 🚀 Useful Commands

```bash
# Development
npm run dev           # Start in development mode
npm run build         # Production build
npm test              # Run tests

# Database
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Run migrations
npm run db:seed       # Seed data

# Docker
docker compose up     # Start services
```

---

## ❓ FAQ

**Where do new endpoints go?**
In `apps/api/src/modules/{domain}/` - create controller, service, dto, module.

**Where do shared types go?**
In `packages/shared/src/types/` or `packages/shared/src/dto/`.

**Where do state enums go?**
In `packages/shared/src/enums/`.

**How do I add a new model?**
In `packages/database/prisma/schema.prisma`, then `npm run db:generate`.
