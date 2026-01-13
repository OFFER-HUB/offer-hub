# @offerhub/api

Main server for **OFFER-HUB Orchestrator** built with NestJS. This service exposes the RESTful API for marketplaces to manage funds, orders, and escrow flows.

## 🎯 Responsibility

The API Server is responsible for:
- Authentication and API Key management.
- Orchestration of balance flows (users, balances).
- Synchronous integration with Airtm and Trustless Work (TW).
- State management for orders and escrows.
- Emitting SSE (Server-Sent Events) events.

## 🗂️ `src` Module Structure

```
src/
├── app.module.ts           # Root module
├── main.ts                 # Application bootstrap and Banner
├── common/                 # Global Guards, Filters, Interceptors, and Pipes
├── config/                 # Injectable configuration
├── providers/              # External service clients (Airtm, TW)
└── modules/                # Domain modules (users, topups, orders, etc.)
```

## 🛠️ Development

From the project root:

```bash
# Start in development mode (Watch mode)
npm run dev

# Compile for production
npm run build

# Run tests
npm test
```

## 🔗 Main Endpoints

- `GET /api/v1/health`: System health status.
- `POST /api/v1/auth/api-keys`: API key creation.
- `POST /api/v1/users`: Marketplace user registration.
- `GET /api/v1/events`: Real-time event subscription (SSE).

## 📚 Related Documentation

- [API Overview](../../docs/api/overview.md)
- [Error Codes](../../docs/api/errors.md)
- [Response Format](../../docs/standards/response-format.md)

---
*For more details on development standards, see [docs/AI.md](../../docs/AI.md).*
