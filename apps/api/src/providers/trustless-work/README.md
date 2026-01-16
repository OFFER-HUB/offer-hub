# Trustless Work Integration

Complete integration with Trustless Work as the escrow provider for non-custodial fund management on the Stellar blockchain.

## Overview

This module provides:
- **Escrow Contract Management:** Create, fund, release, and refund escrow contracts
- **Stellar Wallet Queries:** Query on-chain USDC balances
- **Balance Projection:** Calculate total balance across Airtm (custodial) and Stellar (on-chain)
- **Partial Release/Refund:** Support fractional fund distribution for milestones and disputes
- **Webhook Processing:** Receive and process real-time escrow status updates with HMAC verification

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Orchestrator  │────▶│  Trustless Work │────▶│    Stellar      │
│   (This API)    │◀────│   (Escrow API)  │◀────│   Blockchain    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Non-Custodial Design:** The Orchestrator NEVER holds private keys. All funds are managed through Trustless Work's smart contracts on Stellar.

## Module Structure

```
apps/api/src/providers/trustless-work/
├── trustless-work.module.ts          # NestJS module definition
├── trustless-work.config.ts          # Configuration with validation
├── clients/
│   ├── escrow.client.ts              # Escrow operations (create, fund, release, refund)
│   └── wallet.client.ts              # Stellar balance queries
├── services/
│   ├── webhook.service.ts            # Webhook processing with HMAC verification
│   └── balance-projection.service.ts # Balance calculation logic
├── dto/
│   ├── escrow.dto.ts                 # Escrow creation DTOs
│   ├── release.dto.ts                # Release operation DTOs
│   ├── refund.dto.ts                 # Refund operation DTOs
│   ├── dispute-resolution.dto.ts     # Dispute split DTOs
│   └── webhook.dto.ts                # Webhook event DTOs
└── types/
    └── trustless-work.types.ts       # API response types and mappings
```

## Configuration

### Environment Variables

**IMPORTANT**: For testnet, use `https://dev.api.trustlesswork.com`

```bash
# Trustless Work API
TRUSTLESS_API_KEY=your_api_key_here  # Get from https://dapp.trustlesswork.com
TRUSTLESS_API_URL=https://dev.api.trustlesswork.com  # Testnet
# TRUSTLESS_API_URL=https://api.trustlesswork.com    # Mainnet (after audit)
TRUSTLESS_WEBHOOK_SECRET=tw_whsec_your_webhook_secret_here
TRUSTLESS_TIMEOUT_MS=60000

# Stellar Network
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_USDC_ASSET_CODE=USDC
STELLAR_USDC_ISSUER=GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5  # Testnet
```

### Key Configuration Notes

1. **API URL**:
   - Testnet: `https://dev.api.trustlesswork.com`
   - Mainnet: `https://api.trustlesswork.com` (post-audit)

2. **Platform Fee**: Must be > 0 (percentage, not stroops)

3. **USDC Trustlines**: All wallet addresses in `roles` MUST have USDC trustline configured

4. **Non-Custodial Flow**:
   - Backend calls Trustless Work API → Returns unsigned XDR
   - Frontend gets XDR → User signs with wallet (Freighter/Albedo)
   - Signed XDR sent back to `/helper/send-transaction`

### Usage in NestJS

```typescript
import { TrustlessWorkModule } from './providers/trustless-work/trustless-work.module';

@Module({
  imports: [
    TrustlessWorkModule, // Import the module
    // ... other modules
  ],
})
export class AppModule {}
```

## Usage Examples

### 1. Create Escrow Contract (Non-Custodial Flow)

**Backend** - Initiate escrow deployment:

```typescript
import { EscrowClient } from './providers/trustless-work/clients/escrow.client';

// Step 1: Backend creates unsigned transaction
const response = await escrowClient.createEscrow(
  {
    order_id: 'ord_abc123',
    buyer_address: 'GB...', // Stellar public key
    seller_address: 'GB...', // Stellar public key
    amount: '100.00', // Orchestrator format (2 decimals)
    terms: {
      allow_partial_release: true,
      allow_partial_refund: true,
    },
    metadata: {
      title: 'Freelance Project',
      description: 'Website development',
      platformFee: 5, // 5% platform fee (must be > 0)
    },
  },
  signerAddress // Wallet address that will sign
);

// Result: {
//   status: 'SUCCESS',
//   unsignedTransaction: 'AAAA...', // XDR format
//   contractId: 'C...',
//   message: '...'
// }

// Step 2: Return unsignedTransaction to frontend
return response.unsignedTransaction;
```

**Frontend** - Sign and submit:

```typescript
// Step 3: User signs transaction with their wallet (Freighter/Albedo/xBull)
const signedXdr = await walletKit.signTransaction(unsignedTransaction);

// Step 4: Send signed transaction back to backend
const result = await escrowClient.sendTransaction(signedXdr);

// Result: {
//   status: 'SUCCESS',
//   message: 'The transaction has been successfully sent to the Stellar network.'
// }
```

### 2. Fund Escrow

```typescript
const fundingResult = await escrowClient.fundEscrow(
  'C...', // contract_id
  '100.00' // amount
);

// Result: { success: true, transaction_hash: 'abc123...', status: 'FUNDED' }
```

### 3. Release Funds (Full or Partial)

```typescript
// Full release
await escrowClient.releaseEscrow('C...', {
  mode: ReleaseMode.FULL,
  reason: 'Work completed successfully',
});

// Partial release (milestone)
await escrowClient.releaseEscrow('C...', {
  mode: ReleaseMode.PARTIAL,
  amount: '40.00',
  milestone_ref: 'm1',
  reason: 'Design milestone completed',
});
```

### 4. Refund Funds

```typescript
// Full refund
await escrowClient.refundEscrow('C...', {
  mode: RefundMode.FULL,
  reason: 'not_delivered',
});

// Partial refund
await escrowClient.refundEscrow('C...', {
  mode: RefundMode.PARTIAL,
  amount: '50.00',
  reason: 'quality_issue',
});
```

### 5. Resolve Dispute (Split)

```typescript
await escrowClient.resolveDispute('C...', {
  release_amount: '60.00', // To seller
  refund_amount: '40.00',  // To buyer
  // Total must equal escrow amount
});
```

### 6. Query Stellar Wallet Balance

```typescript
import { WalletClient } from './providers/trustless-work/clients/wallet.client';

const balance = await walletClient.getWalletBalance('GB...');
// Result: { address: 'GB...', usdc_balance: '100000000', native_balance: '...' }
// Note: Amounts are in stroops (1 USDC = 1,000,000 stroops)
```

### 7. Project User Balance

```typescript
import { BalanceProjectionService } from './providers/trustless-work/services/balance-projection.service';

const projectedBalance = await balanceProjectionService.projectUserBalance('usr_123');

// Result:
// {
//   available: '20.00',    // Airtm available
//   reserved: '0.00',      // Airtm reserved
//   on_chain: '80.00',     // Locked in escrow contracts
//   total: '100.00',       // Sum of all
//   currency: 'USDC',
//   last_updated: '2026-01-15T...'
// }
```

### 8. Process Webhooks

```typescript
import { WebhookService } from './providers/trustless-work/services/webhook.service';

@Post('/webhooks/trustless-work')
async handleWebhook(
  @Headers('TW-Signature') signature: string,
  @Body() event: TrustlessWebhookEvent,
  @Req() request: Request,
) {
  // Verify signature
  webhookService.verifySignature(request.rawBody, signature);

  // Process event
  const result = await webhookService.processWebhook(event);

  return { success: true };
}
```

## Webhook Events

Trustless Work sends the following webhook events:

| Event | Description | Triggers |
|-------|-------------|----------|
| `escrow.created` | Contract created | After successful contract creation |
| `escrow.funding_started` | Funding initiated | Buyer starts fund transfer |
| `escrow.funded` | Funds locked on-chain | Transaction confirmed on Stellar |
| `escrow.milestone_completed` | Milestone marked complete | Milestone completion request |
| `escrow.released` | Funds released to seller | Release transaction confirmed |
| `escrow.refunded` | Funds refunded to buyer | Refund transaction confirmed |
| `escrow.disputed` | Dispute opened | Dispute filed, funds frozen |

### Webhook Security

All webhooks are verified using HMAC-SHA256:

```typescript
const expectedSignature = crypto
  .createHmac('sha256', TRUSTLESS_WEBHOOK_SECRET)
  .update(rawBody)
  .digest('hex');

if (signature !== expectedSignature) {
  throw new UnauthorizedException('Invalid webhook signature');
}
```

## Amount Conversions

The module handles three decimal formats:

1. **Orchestrator Format:** 2 decimals (e.g., `"100.00"`)
2. **Stellar Format:** 6 decimals (e.g., `"100.000000"`)
3. **Stroops Format:** Integer, smallest unit (e.g., `"100000000"`)

Conversions are handled automatically:

```typescript
import {
  toStroops,
  fromStroops,
  orchestratorToStellar,
  stellarToOrchestrator
} from '@offerhub/shared';

// Orchestrator → Stroops (for API calls)
toStroops(orchestratorToStellar('100.00')) // '100000000'

// Stroops → Orchestrator (from API responses)
stellarToOrchestrator(fromStroops('100000000')) // '100.00'
```

## Error Handling

The module maps Trustless Work errors to Orchestrator error codes:

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `PROVIDER_UNAVAILABLE` | 503 | Trustless Work temporarily unavailable |
| `PROVIDER_TIMEOUT` | 504 | API request timeout |
| `ESCROW_NOT_FOUND` | 404 | Contract doesn't exist |
| `ESCROW_ALREADY_FUNDED` | 409 | Attempting to fund funded contract |
| `ESCROW_INSUFFICIENT_FUNDS` | 422 | Partial release/refund exceeds available |
| `ESCROW_INVALID_STATE` | 409 | Operation not allowed in current state |
| `STELLAR_NETWORK_ERROR` | 502 | Blockchain transaction failed |

## State Machine Integration

The module integrates with the Orchestrator's state machine:

```typescript
import { EscrowStateMachine } from '@offerhub/shared';

// Validate state transition before making API call
EscrowStateMachine.assertTransition(
  currentStatus,  // e.g., EscrowStatus.FUNDED
  targetStatus    // e.g., EscrowStatus.RELEASING
);
```

Escrow status transitions:
```
CREATING → CREATED → FUNDING → FUNDED → RELEASING/REFUNDING/DISPUTED → RELEASED/REFUNDED
```

## Database Schema

### Required Fields

**User Table:**
```prisma
model User {
  stellarAddress String? @unique @map("stellar_address")
  // ... other fields
}
```

**Escrow Table:**
```prisma
model Escrow {
  trustlessContractId String?    @unique @map("trustless_contract_id")
  amount              String     // USDC amount (2 decimals)
  fundedAt            DateTime?  @map("funded_at")
  releasedAt          DateTime?  @map("released_at")
  refundedAt          DateTime?  @map("refunded_at")
  // ... other fields
}
```

## Testing

### Unit Tests

```bash
npm test apps/api/src/providers/trustless-work
```

### Integration Tests (Stellar Testnet)

```bash
STELLAR_NETWORK=testnet npm run test:integration
```

## Security Considerations

1. **Non-Custodial:** Orchestrator never holds private keys
2. **HMAC Verification:** All webhooks verified with secret
3. **Idempotency:** API calls use idempotency keys to prevent double-execution
4. **Transaction Verification:** Stellar transaction hashes verified on Horizon API
5. **Amount Validation:** All amounts validated before API calls

## Troubleshooting

### Common Issues

**Issue:** `STELLAR_NETWORK_ERROR`
- **Cause:** Stellar Horizon API unreachable or transaction failed
- **Solution:** Check STELLAR_HORIZON_URL and network status

**Issue:** `Invalid webhook signature`
- **Cause:** Incorrect TRUSTLESS_WEBHOOK_SECRET
- **Solution:** Verify secret matches Trustless Work dashboard

**Issue:** `ESCROW_NOT_FOUND`
- **Cause:** Contract ID doesn't exist or belongs to different network
- **Solution:** Verify contract ID and ensure using correct STELLAR_NETWORK

**Issue:** Milestone amounts don't sum to total
- **Cause:** Validation error in milestone creation
- **Solution:** Ensure `sum(milestone.amount) === escrow.amount`

## Production Checklist

- [ ] Set `STELLAR_NETWORK=mainnet`
- [ ] Update `STELLAR_USDC_ISSUER` to mainnet issuer
- [ ] Configure production `TRUSTLESS_API_KEY`
- [ ] Set up webhook endpoint with public URL
- [ ] Enable webhook signature verification
- [ ] Configure monitoring for Stellar network errors
- [ ] Set up alerts for failed escrow operations
- [ ] Test end-to-end flow on testnet first

## Related Documentation

- [Flow of Funds](../../../docs/architecture/flow-of-funds.md)
- [State Machines](../../../docs/architecture/state-machines.md)
- [Escrow Endpoints](../../../docs/api/endpoints/escrow.md)
- [Webhook Handling](../../../docs/api/endpoints/webhooks.md)

## Support

For issues with:
- **Trustless Work API:** https://docs.trustlesswork.com
- **Stellar Network:** https://developers.stellar.org
- **Orchestrator Integration:** See main repository documentation
