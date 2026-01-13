# @offerhub/database

Prisma schema and database client for OFFER-HUB Orchestrator.

## Structure

```
prisma/
├── schema.prisma           # Database schema
├── migrations/             # Migration files
└── seed/                   # Seed data
src/
├── index.ts                # Prisma client export
└── client.ts               # PrismaClient singleton
```

## Models

Based on [data/models.md](../../docs/data/models.md):

- `users` - Marketplace users with Airtm linkage
- `balances` - User balances (available/reserved)
- `topups` - Airtm payins and state
- `orders` - Off-chain order records
- `escrows` - Trustless Work escrow records
- `disputes` - Dispute cases and resolutions
- `withdrawals` - Airtm payouts and state
- `events` - Event stream for UI updates
- `audit_logs` - Audit trail for actions
- `idempotency_keys` - Deduplication of POSTs
- `webhook_events` - Provider webhook deduplication
- `api_keys` - Marketplace API keys

## Commands

```bash
# From project root
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

## Documentation

- [Data Models](../../docs/data/models.md)
- [Audit Log](../../docs/data/audit-log.md)
- [AI.md](../../docs/AI.md) - Development guidelines
