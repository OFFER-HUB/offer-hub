# Docker Compose Deployment

Self-hosted deployment using Docker Compose.

## Quick Start

```bash
# 1. Start infrastructure (Postgres + Redis)
docker compose up -d

# 2. Copy environment file
cp .env.example .env

# 3. Configure your .env file
# Edit .env with your credentials

# 4. Run migrations
npm run prisma:migrate

# 5. Start the API
npm run dev
```

## Production Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: offerhub-postgres
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-offerhub}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB:-offerhub_db}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U offerhub -d offerhub_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: offerhub-redis
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: ./apps/api/Dockerfile
    container_name: offerhub-api
    restart: always
    env_file:
      - .env
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
    ports:
      - "4000:4000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  postgres_data:
  redis_data:
```

## Dockerfile

Create `apps/api/Dockerfile`:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/database/package*.json ./packages/database/

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/api ./apps/api
COPY packages ./packages
COPY tsconfig*.json ./

# Generate Prisma client
RUN npx prisma generate --schema packages/database/prisma/schema.prisma

# Build
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy built files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/package*.json ./

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:4000/api/v1/health || exit 1

CMD ["node", "apps/api/dist/main.js"]
```

## Environment File

Create `.env` for production:

```env
# Database
POSTGRES_USER=offerhub
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=offerhub_db

# Redis
REDIS_PASSWORD=your_redis_password_here

# API
NODE_ENV=production
PORT=4000
OFFERHUB_MASTER_KEY=your_master_key_here

# Airtm
AIRTM_ENV=prod
AIRTM_API_KEY=your_airtm_key
AIRTM_API_SECRET=your_airtm_secret
AIRTM_WEBHOOK_SECRET=your_airtm_webhook_secret

# Trustless Work
TRUSTLESS_API_KEY=your_trustless_key
TRUSTLESS_WEBHOOK_SECRET=your_trustless_webhook_secret

# Stellar
STELLAR_NETWORK=mainnet

# Public URL
PUBLIC_BASE_URL=https://your-domain.com
```

## Running in Production

```bash
# Build and start all services
docker compose -f docker-compose.prod.yml up -d --build

# View logs
docker compose -f docker-compose.prod.yml logs -f api

# Check status
docker compose -f docker-compose.prod.yml ps

# Stop all services
docker compose -f docker-compose.prod.yml down
```

## Service Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Docker Network                     │
│                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐  │
│  │ Postgres │◄───│   API    │───►│    Redis     │  │
│  │  :5432   │    │  :4000   │    │    :6379     │  │
│  └──────────┘    └──────────┘    └──────────────┘  │
│                        │                            │
└────────────────────────┼────────────────────────────┘
                         │
                         ▼
                   External Traffic
                   (port 4000)
```

## What Each Service Does

| Service | Purpose |
|---------|---------|
| `postgres` | Stores orders, balances, users, audit logs, events |
| `redis` | BullMQ job queues, rate limiting, caching, idempotency |
| `api` | HTTP endpoints, webhook processing, background jobs, SSE |

## Scaling

### Horizontal Scaling (Multiple API Instances)

```yaml
# docker-compose.prod.yml
services:
  api:
    deploy:
      replicas: 3
```

Or with a load balancer:

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - api

  api:
    # Remove ports, nginx handles external traffic
    expose:
      - "4000"
    deploy:
      replicas: 3
```

### Nginx Configuration

```nginx
# nginx.conf
upstream api {
    least_conn;
    server api:4000;
}

server {
    listen 80;

    location / {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # SSE requires longer timeouts
    location /api/v1/events {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 86400s;
    }
}
```

## Backup Strategy

### Database Backup

```bash
# Manual backup
docker exec offerhub-postgres pg_dump -U offerhub offerhub_db > backup.sql

# Automated daily backup (cron)
0 2 * * * docker exec offerhub-postgres pg_dump -U offerhub offerhub_db | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz
```

### Redis Backup

Redis data is persisted to the `redis_data` volume. For additional backup:

```bash
# Save RDB snapshot
docker exec offerhub-redis redis-cli BGSAVE

# Copy RDB file
docker cp offerhub-redis:/data/dump.rdb ./backups/
```

## Monitoring

### Health Check Commands

```bash
# API health
curl http://localhost:4000/api/v1/health

# Detailed health (includes dependencies)
curl http://localhost:4000/api/v1/health/detailed

# Postgres health
docker exec offerhub-postgres pg_isready

# Redis health
docker exec offerhub-redis redis-cli ping
```

### Log Aggregation

```bash
# All logs
docker compose logs -f

# API logs only
docker compose logs -f api

# Last 100 lines
docker compose logs --tail=100 api
```

## Troubleshooting

### API won't start

```bash
# Check logs
docker compose logs api

# Common issues:
# 1. Database not ready - wait for postgres healthcheck
# 2. Missing env vars - check .env file
# 3. Port conflict - check if 4000 is in use
```

### Database connection failed

```bash
# Test connection
docker exec offerhub-postgres psql -U offerhub -d offerhub_db -c "SELECT 1"

# Check postgres logs
docker compose logs postgres
```

### Redis connection failed

```bash
# Test connection
docker exec offerhub-redis redis-cli -a $REDIS_PASSWORD ping

# Check redis logs
docker compose logs redis
```

## Development vs Production

| Aspect | Development | Production |
|--------|-------------|------------|
| Compose file | `docker-compose.yml` | `docker-compose.prod.yml` |
| API | `npm run dev` (hot reload) | Docker container |
| SSL | Not required | Required (use nginx/traefik) |
| Passwords | Simple | Strong, randomly generated |
| Replicas | 1 | 2+ (behind load balancer) |
| Backups | Not needed | Automated daily |
