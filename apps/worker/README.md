# @offerhub/worker (DEPRECATED)

> **Note:** This package is deprecated. Background job processing has been unified into the main API (`@offerhub/api`) for simpler deployment.

## Migration

All queue processing is now handled by the API at `apps/api/src/modules/queues/`:

- `queue.module.ts` - BullMQ queue registration
- `queue.service.ts` - Job management service
- `queue.constants.ts` - Queue names and job types
- `processors/webhook.processor.ts` - Webhook job processing
- `processors/dlq.processor.ts` - Dead letter queue handling

## Running

Simply run the API - it handles both HTTP requests and background jobs:

```bash
npm run dev          # Starts API with queue processing
```

## Why Unified?

1. **Simpler deployment** - Single service to deploy and scale
2. **Shared resources** - Database connections, config, and dependencies are shared
3. **Easier development** - No need to coordinate two processes
4. **Future flexibility** - Can easily split out if needed for independent scaling
