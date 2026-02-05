# SDK Integration Guide

This guide will help you integrate the OfferHub SDK into your marketplace to manage payments and escrow.

## 📋 Table of Contents

- [Installation](#installation)
- [Initial Configuration](#initial-configuration)
- [Complete Integration Flow](#complete-integration-flow)
- [Common Use Cases](#common-use-cases)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

---

## Installation

### Option 1: Monorepo (Local Development)

If you're developing locally in the monorepo:

\`\`\`typescript
import { OfferHubSDK } from '@offerhub/sdk';
\`\`\`

### Option 2: NPM Package (Production)

Once published to NPM:

\`\`\`bash
npm install @offerhub/sdk
\`\`\`

---

## Initial Configuration

### 1. Get API Key

First, you need an API Key from the Orchestrator:

\`\`\`bash
# Using the CLI
offerhub keys create \\
  --user-id usr_admin \\
  --scopes read,write \\
  --name "Production Marketplace Key"
\`\`\`

### 2. Initialize SDK

\`\`\`typescript
import { OfferHubSDK } from '@offerhub/sdk';

const sdk = new OfferHubSDK({
  apiUrl: process.env.OFFERHUB_API_URL,
  apiKey: process.env.OFFERHUB_API_KEY,
  timeout: 30000,          // Optional: 30s timeout
  retryAttempts: 3,        // Optional: 3 retries
});
\`\`\`

### 3. Environment Variables

Create a \`.env\` file:

\`\`\`env
OFFERHUB_API_URL=http://localhost:3000
OFFERHUB_API_KEY=ohk_your_api_key_here
\`\`\`

---

## Complete Integration Flow

See the [SDK README](../../packages/sdk/README.md) for complete examples of:

1. **Register Users** - Create buyer and seller accounts
2. **Link Airtm Account** - Connect users to payment provider
3. **Top-Up** - Add funds to user balance
4. **Create Order** - Create escrow order with milestones
5. **Reserve Funds** - Lock buyer funds for the order
6. **Create & Fund Escrow** - Move funds to blockchain
7. **Complete Milestones** - Track project progress
8. **Release Funds** - Pay seller upon completion
9. **Withdraw Funds** - Cash out earnings

---

## Common Use Cases

### Check Balance

\`\`\`typescript
const balance = await sdk.balance.get(userId);
console.log('Available:', balance.available);
console.log('Reserved:', balance.reserved);
\`\`\`

### List Orders

\`\`\`typescript
const result = await sdk.orders.list({
  buyer_id: 'usr_123',
  status: 'ESCROW_FUNDED',
  limit: 20
});

console.log(\`Found \${result.data.length} orders\`);
\`\`\`

### Handle Disputes

\`\`\`typescript
// Open dispute
const dispute = await sdk.disputes.open(orderId, {
  reason: 'Work not delivered as promised',
  evidence: 'Screenshots attached'
});

// Resolve dispute
await sdk.disputes.resolve(dispute.id, {
  resolution: 'SPLIT',
  sellerAmount: '300.00',
  buyerAmount: '200.00',
  notes: 'Partial work completed'
});
\`\`\`

### Use Idempotency

\`\`\`typescript
const idempotentSdk = sdk.withIdempotencyKey('unique-operation-key');

// This request can be safely retried
const order = await idempotentSdk.orders.create({ ... });
\`\`\`

---

## Error Handling

The SDK provides typed errors for better error handling:

\`\`\`typescript
import {
  InsufficientFundsError,
  NotFoundError,
  ValidationError,
  InvalidTransitionError
} from '@offerhub/sdk';

try {
  await sdk.orders.reserve('ord_123');
} catch (error) {
  if (error instanceof InsufficientFundsError) {
    console.error(\`Need \${error.required}, have \${error.available}\`);
  } else if (error instanceof NotFoundError) {
    console.error(\`\${error.resourceType} not found\`);
  } else if (error instanceof ValidationError) {
    console.error('Validation errors:', error.errors);
  } else if (error instanceof InvalidTransitionError) {
    console.error(\`Cannot go from \${error.currentState} to \${error.attemptedState}\`);
  }
}
\`\`\`

---

## Best Practices

### 1. Always Check Balances

Before creating an order, verify the buyer has sufficient funds:

\`\`\`typescript
const balance = await sdk.balance.get(buyerId);
if (parseFloat(balance.available) < parseFloat(amount)) {
  throw new Error('Insufficient funds');
}
\`\`\`

### 2. Use Milestones for Large Projects

For large projects, break payment into milestones:

\`\`\`typescript
const order = await sdk.orders.create({
  buyer_id: 'usr_buyer',
  seller_id: 'usr_seller',
  amount: '5000.00',
  title: 'Mobile App Development',
  milestones: [
    { ref: 'design', description: 'UI/UX Design', amount: '1000.00' },
    { ref: 'backend', description: 'Backend Development', amount: '2000.00' },
    { ref: 'frontend', description: 'Frontend Development', amount: '1500.00' },
    { ref: 'testing', description: 'Testing & Launch', amount: '500.00' }
  ]
});
\`\`\`

### 3. Implement Logging

Add comprehensive logging:

\`\`\`typescript
async function createOrderWithLogging(orderData: any) {
  logger.info('Creating order', { orderData });
  
  try {
    const order = await sdk.orders.create(orderData);
    logger.info('Order created successfully', { orderId: order.id });
    return order;
  } catch (error) {
    logger.error('Failed to create order', { error, orderData });
    throw error;
  }
}
\`\`\`

### 4. Use Retry Logic

For critical operations:

\`\`\`typescript
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
}
\`\`\`

---

## Next Steps

1. **Read the [SDK README](../../packages/sdk/README.md)** for detailed examples
2. **Review [Publishing Guide](./publishing-guide.md)** to publish to NPM
3. **Check [Error Reference](../api/errors.md)** for all error types
4. **Explore [API Documentation](../api/README.md)** for complete API reference

---

## Support

- [GitHub Issues](https://github.com/OFFER-HUB/OFFER-HUB/issues)
- [Complete Documentation](../README.md)
