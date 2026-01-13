# Docker Compose

## Quick Start

```bash
docker compose up
```

## Example docker-compose.yml

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: offerhub
      POSTGRES_PASSWORD: offerhub
      POSTGRES_DB: offerhub
    ports:
      - "5432:5432"
    volumes:
      - offerhub_db:/var/lib/postgresql/data

  api:
    build:
      context: .
      dockerfile: ./apps/api/Dockerfile
    env_file:
      - .env
    depends_on:
      - db
    ports:
      - "4000:4000"
    command: ["node", "dist/main.js"]

  worker:
    build:
      context: .
      dockerfile: ./apps/worker/Dockerfile
    env_file:
      - .env
    depends_on:
      - db
    command: ["node", "dist/worker.js"]

volumes:
  offerhub_db:
```

## What Each Service Does

- `db`: stores orders, balances, audit logs, events, idempotency keys
- `api`: exposes Orchestrator endpoints, SSE, and webhooks
- `worker`: reconciliation, retries, webhook processing (if async)
