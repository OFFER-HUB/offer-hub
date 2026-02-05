# Deployment Guide

Complete guide for deploying OFFER-HUB Orchestrator to production.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Deployment Options](#deployment-options)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Redis Setup](#redis-setup)
- [Platform-Specific Guides](#platform-specific-guides)
- [Post-Deployment](#post-deployment)
- [Monitoring & Health Checks](#monitoring--health-checks)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

The Orchestrator is a **single unified service** that handles:

- HTTP API endpoints
- Background job processing (BullMQ)
- Webhook reception
- Event streaming (SSE)

```
┌─────────────────────────────────────────────────────────┐
│                    OFFER-HUB API                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  HTTP API   │  │  BullMQ     │  │  Event Stream   │  │
│  │  Endpoints  │  │  Processors │  │  (SSE)          │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└────────────┬────────────────┬────────────────┬──────────┘
             │                │                │
             ▼                ▼                ▼
      ┌──────────┐     ┌──────────┐     ┌──────────┐
      │ Postgres │     │  Redis   │     │ External │
      │          │     │ (BullMQ) │     │   APIs   │
      └──────────┘     └──────────┘     └──────────┘
```

### Required Services

| Service | Purpose | Required |
|---------|---------|----------|
| PostgreSQL | Data persistence (orders, users, balances, audit logs) | Yes |
| Redis | Job queues, rate limiting, caching, idempotency | Yes |
| Airtm API | Fiat on/off ramp | Yes |
| Trustless Work API | Stellar escrow management | Yes |

---

## Prerequisites

Before deploying, ensure you have:

### 1. External Service Accounts

- [ ] **Airtm Enterprise Account** - Contact Airtm for API credentials
  - API Key
  - API Secret
  - Webhook Secret (for signature verification)

- [ ] **Trustless Work Account** - Register at trustlesswork.com
  - API Key
  - Webhook Secret

### 2. Infrastructure

- [ ] **PostgreSQL 15+** database
- [ ] **Redis 7+** instance
- [ ] **Domain name** with SSL certificate
- [ ] **Hosting platform** (Railway, Render, AWS, etc.)

### 3. Security

- [ ] Generate secure `OFFERHUB_MASTER_KEY`
- [ ] Configure webhook secrets for signature verification
- [ ] Set up SSL/TLS for all endpoints

---

## Deployment Options

### Option 1: Railway (Recommended for startups)

**Pros:** Easy setup, automatic SSL, built-in Redis/Postgres
**Cons:** Can get expensive at scale

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and initialize
railway login
railway init

# 3. Add services
railway add --database postgres
railway add --database redis

# 4. Deploy
railway up
```

Railway automatically injects `DATABASE_URL` and `REDIS_URL`.

### Option 2: Render

**Pros:** Free tier available, simple
**Cons:** Cold starts on free tier

1. Create a new "Web Service" from your repo
2. Add a PostgreSQL database
3. Add a Redis instance
4. Configure environment variables
5. Deploy

### Option 3: Docker Compose (Self-hosted)

**Pros:** Full control, cost-effective
**Cons:** Requires infrastructure management

See [docker-compose.md](./docker-compose.md) for details.

### Option 4: AWS / GCP / Azure

**Pros:** Enterprise-grade, scalable
**Cons:** Complex setup

| AWS | GCP | Azure |
|-----|-----|-------|
| ECS/Fargate | Cloud Run | Container Apps |
| RDS PostgreSQL | Cloud SQL | Azure Database |
| ElastiCache Redis | Memorystore | Azure Cache |

---

## Pre-Deployment Checklist

### Critical Steps

```
[ ] 1. Database migrations are ready
[ ] 2. All environment variables configured
[ ] 3. Webhook URLs registered with Airtm/Trustless Work
[ ] 4. SSL certificate configured
[ ] 5. Health check endpoint accessible
[ ] 6. Master key generated and stored securely
[ ] 7. Backup strategy defined
```

### Generate Secure Keys

```bash
# Generate OFFERHUB_MASTER_KEY (32 bytes, base64)
openssl rand -base64 32

# Example output: K7gNU3sdo+OL0wNhqoVWhr3g6s1xYv72ol/pe/Unols=
```

### Webhook Registration

After deployment, register your webhook URLs:

| Provider | Webhook URL |
|----------|-------------|
| Airtm | `https://your-domain.com/api/v1/webhooks/airtm` |
| Trustless Work | `https://your-domain.com/api/v1/webhooks/trustless-work` |

---

## Environment Configuration

### Required Variables

```env
# Server
NODE_ENV=production
PORT=4000

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# Redis (for BullMQ, rate limiting, caching)
REDIS_URL=redis://:password@host:6379

# Auth
OFFERHUB_MASTER_KEY=your-secure-master-key

# Airtm
AIRTM_ENV=prod
AIRTM_API_KEY=your-airtm-api-key
AIRTM_API_SECRET=your-airtm-api-secret
AIRTM_WEBHOOK_SECRET=your-airtm-webhook-secret

# Trustless Work
TRUSTLESS_API_KEY=your-trustless-api-key
TRUSTLESS_WEBHOOK_SECRET=your-trustless-webhook-secret

# Stellar
STELLAR_NETWORK=mainnet

# Public URL (for callbacks)
PUBLIC_BASE_URL=https://your-domain.com
```

### Environment-Specific Settings

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `NODE_ENV` | development | staging | production |
| `AIRTM_ENV` | sandbox | sandbox | prod |
| `STELLAR_NETWORK` | testnet | testnet | mainnet |
| `LOG_LEVEL` | debug | info | warn |

See [env-variables.md](./env-variables.md) for complete reference.

---

## Database Setup

### 1. Create Database

```sql
CREATE DATABASE offerhub_db;
CREATE USER offerhub WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE offerhub_db TO offerhub;
```

### 2. Run Migrations

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npx prisma migrate deploy --schema packages/database/prisma/schema.prisma
```

### 3. Verify Connection

```bash
# Test database connection
npx prisma db pull --schema packages/database/prisma/schema.prisma
```

### Managed Database Options

| Provider | Service | Notes |
|----------|---------|-------|
| Supabase | PostgreSQL | Free tier, auto backups |
| Railway | PostgreSQL | Easy integration |
| Neon | PostgreSQL | Serverless, branching |
| PlanetScale | MySQL | Not recommended (Prisma works better with Postgres) |
| AWS RDS | PostgreSQL | Enterprise, multi-AZ |

---

## Redis Setup

Redis is required for:
- **BullMQ** - Background job processing
- **Rate Limiting** - API protection
- **Idempotency** - Duplicate request prevention
- **Caching** - Performance optimization

### Managed Redis Options

| Provider | Service | Free Tier | Notes |
|----------|---------|-----------|-------|
| **Upstash** | Serverless Redis | 10K cmds/day | Best for low traffic |
| **Railway** | Redis | No | Easy setup |
| **Render** | Redis | No | Simple |
| **AWS ElastiCache** | Redis | No | Enterprise |
| **Redis Cloud** | Redis | 30MB | Official Redis |

### Upstash Setup (Recommended for starting)

1. Go to [upstash.com](https://upstash.com)
2. Create account and new database
3. Select region closest to your API
4. Copy the Redis URL:

```
redis://default:YOUR_PASSWORD@YOUR_ENDPOINT.upstash.io:6379
```

### Connection String Format

```
redis://[:password@]host[:port][/database]

# Examples:
redis://localhost:6379                          # Local, no auth
redis://:mypassword@redis.example.com:6379      # With password
rediss://:password@host:6379                    # TLS (note the 's')
```

### Verify Redis Connection

```bash
# Using redis-cli
redis-cli -u "redis://:password@host:6379" ping
# Should return: PONG
```

---

## Platform-Specific Guides

### Railway

```bash
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run start:prod -w @offerhub/api"
healthcheckPath = "/api/v1/health"
healthcheckTimeout = 30
restartPolicyType = "on_failure"
```

### Render

```yaml
# render.yaml
services:
  - type: web
    name: offerhub-api
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run start:prod -w @offerhub/api
    healthCheckPath: /api/v1/health
    envVars:
      - key: NODE_ENV
        value: production
```

### Docker

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages ./packages
COPY apps/api ./apps/api
RUN npm ci
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/packages ./packages
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/main.js"]
```

---

## Post-Deployment

### 1. Verify Health

```bash
# Basic health check
curl https://your-domain.com/api/v1/health

# Detailed health (includes all dependencies)
curl https://your-domain.com/api/v1/health/detailed
```

Expected response:
```json
{
  "data": {
    "status": "healthy",
    "dependencies": {
      "database": { "status": "healthy" },
      "redis": { "status": "healthy" },
      "airtm": { "status": "healthy" },
      "trustlessWork": { "status": "healthy" }
    }
  }
}
```

### 2. Create First API Key

```bash
curl -X POST https://your-domain.com/api/v1/auth/api-keys \
  -H "Authorization: Bearer $OFFERHUB_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Marketplace",
    "scopes": ["orders", "users", "balance", "withdrawals", "topups"]
  }'
```

### 3. Register Webhooks

Contact Airtm and Trustless Work support to register your webhook URLs.

### 4. Test End-to-End

```bash
# Create a test user
curl -X POST https://your-domain.com/api/v1/users \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"externalId": "test-user-1", "email": "test@example.com"}'
```

---

## Monitoring & Health Checks

### Health Endpoints

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `GET /api/v1/health` | Basic liveness | `{ status: "healthy" }` |
| `GET /api/v1/health/detailed` | All dependencies | Full status with latencies |

### Recommended Monitoring

1. **Uptime Monitoring** - Pingdom, UptimeRobot, Better Uptime
2. **Error Tracking** - Sentry, Bugsnag
3. **Logs** - Datadog, LogDNA, Papertrail
4. **Metrics** - Prometheus + Grafana

### Alerts to Configure

| Alert | Condition | Priority |
|-------|-----------|----------|
| API Down | Health check fails 3x | Critical |
| High Error Rate | >5% 5xx errors | High |
| Database Connection | DB health unhealthy | Critical |
| Redis Connection | Redis health unhealthy | High |
| High Latency | p95 > 2s | Medium |
| DLQ Growing | Dead letter queue > 100 jobs | Medium |

---

## Troubleshooting

### Common Issues

#### "Cannot connect to database"

```bash
# Check connection string format
# Ensure SSL mode for production
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

#### "Redis connection refused"

```bash
# Verify Redis URL format
REDIS_URL=redis://:password@host:6379

# Check if TLS is required (use rediss://)
REDIS_URL=rediss://:password@host:6379
```

#### "Webhook signature verification failed"

- Verify `AIRTM_WEBHOOK_SECRET` matches Airtm dashboard
- Check that raw body is being used for signature verification
- Ensure no middleware is modifying the request body

#### "Rate limit exceeded"

- Redis must be connected for rate limiting
- Check `REDIS_URL` configuration
- Review rate limit settings in code

### Debug Mode

For troubleshooting, enable debug logging:

```env
LOG_LEVEL=debug
DEBUG=bullmq:*
```

### Getting Help

1. Check logs: `docker logs offerhub-api` or platform logs
2. Review health endpoint: `/api/v1/health/detailed`
3. Check GitHub issues: https://github.com/OFFER-HUB/OFFER-HUB-Orchestrator/issues

---

## Security Considerations

### Production Checklist

- [ ] All secrets stored in environment variables (never in code)
- [ ] SSL/TLS enabled for all endpoints
- [ ] Database connections use SSL (`?sslmode=require`)
- [ ] Redis connection uses TLS if available
- [ ] Rate limiting enabled
- [ ] Webhook signature verification enabled
- [ ] CORS configured for your frontend domain only
- [ ] Master key is long and random (32+ bytes)
- [ ] Regular backups configured for database

### Secret Rotation

Periodically rotate:
1. `OFFERHUB_MASTER_KEY` - Regenerate API keys after rotation
2. Database password - Update `DATABASE_URL`
3. Webhook secrets - Coordinate with Airtm/Trustless Work

---

## Scaling Considerations

### When to Scale

| Metric | Threshold | Action |
|--------|-----------|--------|
| CPU Usage | >70% sustained | Add replicas |
| Memory | >80% | Increase instance size |
| Request Latency | p95 >500ms | Add replicas or optimize |
| Queue Backlog | >1000 jobs | Consider separate worker |

### Horizontal Scaling

The API is stateless and can be scaled horizontally:

```yaml
# Example: 3 replicas
replicas: 3
```

Note: BullMQ workers coordinate via Redis, so multiple instances can process jobs safely.

### Future: Separating Worker

If you need independent scaling of API vs background jobs:

1. The codebase supports this - queue modules are already modular
2. Create a separate deployment that only runs processors
3. Both services share the same Redis for job coordination

---

## Related Documentation

- [Environment Variables](./env-variables.md) - Complete env var reference
- [Docker Compose](./docker-compose.md) - Self-hosted deployment
- [Architecture Overview](../architecture/overview.md) - System design
- [API Reference](../api/README.md) - Endpoint documentation
