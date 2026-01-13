# SDK Integration Guide

## Install

```bash
npm i @offerhub/sdk
```

## Configure

```typescript
import { OfferHub } from '@offerhub/sdk';

const sdk = new OfferHub({
  apiUrl: process.env.OFFERHUB_API_URL,
  apiKey: process.env.OFFERHUB_API_KEY,
});
```

## Create a User

```typescript
const user = await sdk.users.create({
  external_user_id: 'user_123',
  email: 'user@example.com',
  type: 'buyer',
});
```

## Create an Order

```typescript
const order = await sdk.orders.create({
  buyer_id: 'usr_buyer',
  seller_id: 'usr_seller',
  amount: '120.00',
  currency: 'USD',
  title: 'Logo design',
});
```

## Reserve Funds

```typescript
await sdk.orders.reserve(order.id, { amount: '120.00' });
```

## Top-up

```typescript
const topup = await sdk.topups.create({
  user_id: 'usr_buyer',
  amount: '50.00',
  currency: 'USD',
  return_url: 'https://marketplace.com/wallet/topup/success',
  cancel_url: 'https://marketplace.com/wallet/topup/cancel',
});
```
