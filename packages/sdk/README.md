# @offerhub/sdk

Client SDK for marketplaces to integrate with OFFER-HUB Orchestrator.

## Installation

```bash
npm install @offerhub/sdk
```

## Structure

```
src/
├── index.ts                # Main OfferHub class export
├── client/                 # HTTP client base
│   ├── http-client.ts      # ky wrapper
│   └── types.ts            # Config types
├── resources/              # API resource clients
│   ├── users.resource.ts
│   ├── topups.resource.ts
│   ├── orders.resource.ts
│   ├── escrow.resource.ts
│   ├── withdrawals.resource.ts
│   ├── disputes.resource.ts
│   └── events.resource.ts
├── types/                  # Response types
└── errors/                 # SDK error classes
```

## Usage

```typescript
import { OfferHub } from '@offerhub/sdk';

const sdk = new OfferHub({
  apiUrl: process.env.OFFERHUB_API_URL,
  apiKey: process.env.OFFERHUB_API_KEY,
});

// Create a user
const user = await sdk.users.create({
  external_user_id: 'user_123',
  email: 'user@example.com',
  type: 'buyer',
});

// Create an order
const order = await sdk.orders.create({
  buyer_id: user.id,
  seller_id: 'usr_seller',
  amount: '100.00',
  currency: 'USD',
  title: 'Logo design',
});

// Reserve funds
await sdk.orders.reserve(order.id, { amount: '100.00' });
```

## Documentation

- [SDK Integration Guide](../../docs/sdk/integration-guide.md)
- [API Overview](../../docs/api/overview.md)
- [AI.md](../../docs/AI.md) - Development guidelines
