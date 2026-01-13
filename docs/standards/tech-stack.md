# Tech Stack

## Recommended Versions

| Technology | Version | Justification |
|------------|---------|---------------|
| Node.js | 20 LTS (v20.x) | Long-term support through 2026, native ESM |
| TypeScript | 5.4+ | Stage 3 decorators, improved type inference |
| Supabase (remote) | Managed Postgres 16 | Each marketplace provisions its own Supabase instance |
| Redis | 7.x | Cache, queues, pub/sub for SSE |
| Docker | 24+ | Native Compose V2, BuildKit |
| pnpm | 9.x | Efficient workspaces, deduplication |

## Frameworks and Libraries

### Backend (API + Worker)

| Library | Version | Usage |
|----------|---------|-----|
| NestJS | 10.x | Main framework, modular, decorators |
| Prisma | 5.x | Type-safe ORM, migrations |
| BullMQ | 5.x | Job queues for workers |
| Zod | 3.x | Schema validation |
| @nestjs/event-emitter | 2.x | Internal events |
| ioredis | 5.x | Redis client |

### Authentication and Security

| Library | Version | Usage |
|----------|---------|-----|
| @nestjs/passport | 10.x | Auth strategies |
| passport-http-bearer | 1.x | Bearer token auth |
| helmet | 7.x | Security headers |
| class-validator | 0.14.x | DTO validation |
| class-transformer | 0.5.x | Object transformation |

### External Integrations

| Library | Version | Usage |
|----------|---------|-----|
| axios | 1.x | HTTP client for Airtm/Trustless Work |
| stellar-sdk | 11.x | Stellar interaction (if required) |

### Testing

| Library | Version | Usage |
|----------|---------|-----|
| Jest | 29.x | Test runner |
| Supertest | 6.x | HTTP integration tests |
| @nestjs/testing | 10.x | NestJS testing utilities |

### SDK (@offerhub/sdk)

| Library | Version | Usage |
|----------|---------|-----|
| TypeScript | 5.4+ | Typing |
| ky | 1.x | Lightweight HTTP client (browser + node) |
| zod | 3.x | Response validation |

## Monorepo Structure

```
offer-hub-orchestrator/
├── apps/
│   ├── api/                 # NestJS API
│   └── worker/              # BullMQ workers
├── packages/
│   ├── shared/              # Shared DTOs, types, utils
│   ├── database/            # Prisma schema and client
│   └── sdk/                 # @offerhub/sdk (publishable)
├── docker-compose.yml
├── pnpm-workspace.yaml
└── turbo.json               # (optional) Turborepo
```

## Database

### PostgreSQL Schema (conceptual)

```
users
topups
orders
escrows
disputes
withdrawals
balances
audit_logs
idempotency_keys
webhook_events
api_keys
```

### Supabase (remote, required)

Supabase provides managed PostgreSQL. Each marketplace must provision its own Supabase project:

- Use the project's Postgres connection string as `DATABASE_URL`
- Enable SSL for remote connections

### Prisma (required)

Prisma manages schema and migrations regardless of the underlying Postgres host:

- Use Prisma migrations to evolve schema
- Supabase is treated as the Postgres provider

### Recommended Indexes

- `orders.status` - Queries by status
- `orders.buyer_id`, `orders.seller_id` - Queries by user
- `audit_logs.occurred_at` - Time-based queries
- `idempotency_keys.key` - Unique lookup

## Redis

### Keys Used

| Pattern | Usage |
|--------|-----|
| `idem:{key}` | Idempotency keys (TTL 24h-7d) |
| `bull:*` | BullMQ queues |
| `sse:user:{id}` | Pub/sub for SSE per user |

## Environment Variables

See [env-variables.md](../deployment/env-variables.md) for the full list.

## Compatibility

- **Browsers**: SDK compatible with ES2020+
- **Node.js**: API requires Node 20+
- **Docker**: Compose V2 (included in Docker Desktop 4.x+)
