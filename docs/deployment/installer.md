# Installer

## Create an Orchestrator Instance

```bash
npm create offer-hub-orchestrator@latest
```

This generates a folder with:

```
offer-hub-orchestrator/
  docker-compose.yml
  .env.example
  apps/api
  apps/worker
  packages/shared
  apps/backoffice (optional)
  README.md
```

## Run Locally

```bash
cd offer-hub-orchestrator
cp .env.example .env
docker compose up
```

## What the README Should Include

- How to boot the stack
- How to generate `OFFERHUB_API_KEY`
- How to configure webhooks
