# OFFER-HUB Orchestrator

Self-hosted payments orchestrator that lets marketplaces offer a Web2 experience (balance, top-ups, checkout, withdrawals) using Airtm for funds management and Trustless Work for non-custodial escrow on Stellar.

## Quick Start

```bash
# 1. Create an Orchestrator instance
npm create offer-hub-orchestrator@latest

# 2. Configure and boot
cd offer-hub-orchestrator
cp .env.example .env
docker compose up

# 3. Integrate in your marketplace
npm i @offerhub/sdk
```

## Documentation

> [!TIP]
> **For AI Contributors**: Start with [AI.md](./AI.md) - it contains all standards synthesized in one document.

### Architecture

- [Overview](./architecture/overview.md) - System pyramid, actors, self-host model
- [State Machines](./architecture/state-machines.md) - States for TopUp, Order, Withdrawal
- [Flow of Funds](./architecture/flow-of-funds.md) - End-to-end money flow

### API Reference

- [Overview](./api/overview.md) - Principles, authentication, headers
- [Errors](./api/errors.md) - Standard error codes
- [Idempotency](./api/idempotency.md) - Idempotency rules

#### Endpoints

| Domain | Documentation |
|---------|---------------|
| Auth | [auth.md](./api/endpoints/auth.md) |
| Users | [users.md](./api/endpoints/users.md) |
| Top-ups | [topups.md](./api/endpoints/topups.md) |
| Orders | [orders.md](./api/endpoints/orders.md) |
| Escrow | [escrow.md](./api/endpoints/escrow.md) |
| Release/Refund | [release-refund.md](./api/endpoints/release-refund.md) |
| Disputes | [disputes.md](./api/endpoints/disputes.md) |
| Withdrawals | [withdrawals.md](./api/endpoints/withdrawals.md) |
| Events (SSE) | [events.md](./api/endpoints/events.md) |
| Webhooks | [webhooks.md](./api/endpoints/webhooks.md) |
| Audit Logs | [audit-logs.md](./api/endpoints/audit-logs.md) |

### External Providers

- [Trustless Work MCP](https://docs.trustlesswork.com/trustless-work/~gitbook/mcp) - Official MCP documentation
- [Airtm Enterprise API](https://api.enterprise.airtm.com/docs/#v2/description/introduction) - Official Airtm API docs
- [Airtm Enterprise API (JSON)](./airtm/documentation.json) - Same Airtm Enterprise API docs in JSON format

### Events

- [Event Catalog](./events/catalog.md) - All system events

### Data

- [Models](./data/models.md) - Entities and relationships
- [Audit Log](./data/audit-log.md) - Audit schema

### Deployment

- [Docker Compose](./deployment/docker-compose.md) - Service configuration
- [Environment Variables](./deployment/env-variables.md) - .env configuration
- [Installer](./deployment/installer.md) - npm create offer-hub-orchestrator

### SDK

- [Integration Guide](./sdk/integration-guide.md) - How to integrate @offerhub/sdk

### Standards

- [AI.md](./AI.md) - **AI Development Guide** (start here)
- [Tech Stack](./standards/tech-stack.md) - Technologies and versions
- [Naming Conventions](./standards/naming-conventions.md) - Naming conventions
- [Response Format](./standards/response-format.md) - API response format
- [Contribution Guide](./CONTRIBUTING.md) - **Contribute to the project** (start here)
- [Validation Rules](./standards/validation-rules.md) - Validation rules


## Project Structure

```
offer-hub-orchestrator/
├── apps/
│   ├── api/                 # Orchestrator API (NestJS)
│   └── worker/              # Background jobs (webhooks, retries, reconciliation)
├── packages/
│   ├── database/            # Prisma schema and client
│   ├── shared/              # Shared DTOs, types, utilities
│   └── sdk/                 # @offerhub/sdk client
└── docs/                    # Documentation source
```

## Technical Principles

1. **Self-host**: Each marketplace runs its own instance
2. **Funds per user**: Airtm balance is in the user name (not pooled)
3. **Non-custodial escrow**: Trustless Work manages funds on Stellar
4. **Required idempotency**: All mutable POSTs accept `Idempotency-Key`
5. **Server-side secrets**: Provider keys live only in the Orchestrator `.env`
