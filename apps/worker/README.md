# @offerhub/worker

Background job processor for OFFER-HUB Orchestrator built with BullMQ.

## Structure

```
src/
├── index.ts                # Entry point
├── config/                 # Worker configuration
├── queues/                 # Queue definitions
├── processors/             # Job processors
│   ├── webhooks/           # Webhook processing
│   ├── reconciliation/     # Balance/order reconciliation
│   └── notifications/      # Event notifications
└── utils/                  # Worker utilities
```

## Responsibilities

- Process incoming webhooks from Airtm and Trustless Work
- Run periodic reconciliation jobs
- Handle retry logic for failed operations
- Send event notifications

## Development

```bash
# From project root
npm run dev:worker   # Start worker in development mode
npm run build        # Build for production
```

## Documentation

- [Architecture Overview](../../docs/architecture/overview.md)
- [AI.md](../../docs/AI.md) - Development guidelines
