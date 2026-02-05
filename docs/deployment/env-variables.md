# Environment Variables

Complete reference for all environment variables used by OFFER-HUB Orchestrator.

## Quick Reference

```env
# Required for production
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
REDIS_URL=redis://:password@host:6379
OFFERHUB_MASTER_KEY=your-secure-key
AIRTM_ENV=prod
AIRTM_API_KEY=...
AIRTM_API_SECRET=...
TRUSTLESS_API_KEY=...
PUBLIC_BASE_URL=https://your-domain.com
```

---

## Server Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `development` | Runtime environment: `development`, `staging`, `production` |
| `PORT` | No | `4000` | HTTP server port |
| `LOG_LEVEL` | No | `info` | Logging level: `debug`, `info`, `warn`, `error` |

---

## Database (PostgreSQL)

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `postgresql://user:pass@host:5432/db` | Prisma connection string |

### Connection String Format

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

### Examples by Provider

```env
# Supabase
DATABASE_URL=postgresql://postgres:password@db.xxxx.supabase.co:5432/postgres?sslmode=require

# Railway
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway

# Neon
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Local Docker
DATABASE_URL=postgresql://offerhub:offerhub_password@localhost:5432/offerhub_db
```

---

## Redis

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `REDIS_URL` | Yes | `redis://:pass@host:6379` | Redis connection string |

### Connection String Format

```
redis://[:PASSWORD@]HOST[:PORT][/DATABASE]
rediss://[:PASSWORD@]HOST[:PORT][/DATABASE]  # TLS
```

### Examples by Provider

```env
# Upstash
REDIS_URL=redis://default:xxx@us1-xxx.upstash.io:6379

# Railway
REDIS_URL=redis://default:xxx@containers-us-west-xxx.railway.app:6379

# Redis Cloud
REDIS_URL=redis://default:xxx@redis-12345.c1.us-east-1-2.ec2.cloud.redislabs.com:12345

# Local Docker
REDIS_URL=redis://localhost:6379

# With password
REDIS_URL=redis://:mypassword@localhost:6379
```

### What Redis is Used For

| Feature | Description |
|---------|-------------|
| BullMQ | Background job queues and processing |
| Rate Limiting | API request throttling |
| Idempotency | Duplicate request prevention |
| Caching | Performance optimization |

---

## Authentication

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `OFFERHUB_MASTER_KEY` | Yes | `ohk_master_xxx` | Master key for creating API keys |
| `JWT_SECRET` | No | Auto-generated | JWT signing secret (defaults to master key derivative) |
| `JWT_EXPIRES_IN` | No | `24h` | JWT token expiration |

### Generating a Secure Master Key

```bash
# Generate 32-byte random key (recommended)
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Airtm Integration

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `AIRTM_ENV` | Yes | `sandbox` or `prod` | Airtm environment |
| `AIRTM_API_KEY` | Yes | `ak_xxx` | Airtm API key |
| `AIRTM_API_SECRET` | Yes | `as_xxx` | Airtm API secret |
| `AIRTM_WEBHOOK_SECRET` | Recommended | `whs_xxx` | HMAC secret for webhook verification |

### Environment URLs

| `AIRTM_ENV` | API Base URL |
|-------------|--------------|
| `sandbox` | `https://sandbox-enterprise.airtm.io/api/v2` |
| `prod` | `https://enterprise.airtm.io/api/v2` |

### Getting Credentials

1. Contact Airtm for Enterprise API access
2. Access sandbox credentials from Airtm dashboard
3. Request production credentials after testing

---

## Trustless Work Integration

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `TRUSTLESS_API_KEY` | Yes | `tw_xxx` | Trustless Work API key |
| `TRUSTLESS_WEBHOOK_SECRET` | Recommended | `tws_xxx` | HMAC secret for webhook verification |
| `TRUSTLESS_API_URL` | No | Auto | Override API base URL |

### Getting Credentials

1. Register at [trustlesswork.com](https://trustlesswork.com)
2. Create an application in the dashboard
3. Copy API key and webhook secret

---

## Stellar Network

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STELLAR_NETWORK` | No | `testnet` | Stellar network: `testnet` or `mainnet` |

### Network Details

| Network | Horizon URL | Passphrase |
|---------|-------------|------------|
| `testnet` | `https://horizon-testnet.stellar.org` | `Test SDF Network ; September 2015` |
| `mainnet` | `https://horizon.stellar.org` | `Public Global Stellar Network ; September 2015` |

---

## Public URLs

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `PUBLIC_BASE_URL` | Yes | `https://api.yourapp.com` | Public URL for callbacks |

### Usage

Used for:
- Webhook callback URLs sent to Airtm
- Top-up redirect URLs
- Event notification URLs

---

## Environment-Specific Configuration

### Development

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://offerhub:offerhub_password@localhost:5432/offerhub_db
REDIS_URL=redis://localhost:6379
OFFERHUB_MASTER_KEY=dev-master-key-not-for-production
AIRTM_ENV=sandbox
AIRTM_API_KEY=sandbox_key
AIRTM_API_SECRET=sandbox_secret
TRUSTLESS_API_KEY=dev_key
STELLAR_NETWORK=testnet
PUBLIC_BASE_URL=http://localhost:4000
LOG_LEVEL=debug
```

### Staging

```env
NODE_ENV=staging
PORT=4000
DATABASE_URL=postgresql://...staging-db...?sslmode=require
REDIS_URL=redis://:password@staging-redis:6379
OFFERHUB_MASTER_KEY=staging-master-key
AIRTM_ENV=sandbox
AIRTM_API_KEY=sandbox_key
AIRTM_API_SECRET=sandbox_secret
AIRTM_WEBHOOK_SECRET=sandbox_webhook_secret
TRUSTLESS_API_KEY=staging_key
TRUSTLESS_WEBHOOK_SECRET=staging_webhook_secret
STELLAR_NETWORK=testnet
PUBLIC_BASE_URL=https://staging-api.yourapp.com
LOG_LEVEL=info
```

### Production

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://...production-db...?sslmode=require
REDIS_URL=rediss://:password@production-redis:6379
OFFERHUB_MASTER_KEY=production-secure-master-key
AIRTM_ENV=prod
AIRTM_API_KEY=production_key
AIRTM_API_SECRET=production_secret
AIRTM_WEBHOOK_SECRET=production_webhook_secret
TRUSTLESS_API_KEY=production_key
TRUSTLESS_WEBHOOK_SECRET=production_webhook_secret
STELLAR_NETWORK=mainnet
PUBLIC_BASE_URL=https://api.yourapp.com
LOG_LEVEL=warn
```

---

## Validation

The API validates required environment variables on startup. Missing variables will cause the application to fail with a clear error message.

### Check Configuration

```bash
# Start API and check logs for configuration status
npm run dev

# Look for:
# [AirtmConfig] Airtm configured for environment: sandbox
# [EscrowClient] Initialized Trustless Work escrow client
# [WalletClient] Initialized Stellar wallet client for testnet network
```

---

## Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use different keys per environment** - Dev, staging, prod should have separate credentials
3. **Rotate keys periodically** - Especially `OFFERHUB_MASTER_KEY`
4. **Use TLS for Redis** - Use `rediss://` in production
5. **Require SSL for database** - Use `?sslmode=require`
6. **Store secrets in vault** - Use platform secrets (Railway, Render) or HashiCorp Vault

---

## .env.example Template

Copy this to `.env` and fill in your values:

```env
# Server
NODE_ENV=development
PORT=4000
LOG_LEVEL=debug

# Database (PostgreSQL)
DATABASE_URL=postgresql://offerhub:offerhub_password@localhost:5432/offerhub_db

# Redis (BullMQ, rate limiting, caching)
REDIS_URL=redis://localhost:6379

# Auth
OFFERHUB_MASTER_KEY=change-me-in-production

# Airtm
AIRTM_ENV=sandbox
AIRTM_API_KEY=
AIRTM_API_SECRET=
AIRTM_WEBHOOK_SECRET=

# Trustless Work
TRUSTLESS_API_KEY=
TRUSTLESS_WEBHOOK_SECRET=

# Stellar
STELLAR_NETWORK=testnet

# Public URL (for callbacks)
PUBLIC_BASE_URL=http://localhost:4000
```
