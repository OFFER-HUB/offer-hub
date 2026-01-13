# Environment Variables

## Server

| Name | Example | Description |
|------|---------|-------------|
| `NODE_ENV` | `development` | Runtime environment |
| `PORT` | `4000` | API port |
| `DATABASE_URL` | `postgres://...` | Supabase Postgres connection string (SSL required) |
| `REDIS_URL` | `redis://...` | Connection string for Redis (BullMQ) |

## Marketplace Auth

| Name | Example | Description |
|------|---------|-------------|
| `OFFERHUB_MASTER_KEY` | `ohk_master_...` | Master key for API key creation |

## Airtm

| Name | Example | Description |
|------|---------|-------------|
| `AIRTM_ENV` | `sandbox` | `sandbox` or `prod` |
| `AIRTM_API_KEY` | `...` | Airtm API key |
| `AIRTM_API_SECRET` | `...` | Airtm API secret |
| `AIRTM_WEBHOOK_SECRET` | `...` | Airtm webhook HMAC secret |

## Trustless Work

| Name | Example | Description |
|------|---------|-------------|
| `TRUSTLESS_API_KEY` | `...` | Trustless Work API key |
| `TRUSTLESS_WEBHOOK_SECRET` | `...` | Trustless Work webhook HMAC secret |

## Stellar (if applicable)

| Name | Example | Description |
|------|---------|-------------|
| `STELLAR_NETWORK` | `testnet` | `testnet` or `mainnet` |

## Public URLs

| Name | Example | Description |
|------|---------|-------------|
| `PUBLIC_BASE_URL` | `https://your-orchestrator-domain.com` | Base URL for callbacks and webhooks |
