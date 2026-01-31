# Airtm Integration Guide

This document covers everything you need to know about integrating with Airtm for fiat on/off-ramp functionality in OFFER-HUB.

## Overview

Airtm is the fiat payment provider used by OFFER-HUB for:
- **Top-ups (Pay-ins)**: Users deposit fiat to get platform balance
- **Withdrawals (Payouts)**: Users withdraw platform balance to fiat
- **User Verification**: KYC/country eligibility checks

## Environments

| Environment | API Host | UI | Use Case |
|-------------|----------|-----|----------|
| **Sandbox** | `https://payments.static-stg.tests.airtm.org` | https://app.stg.airtm.io | Development & Testing |
| **Production** | `https://payments.air-pay.io` | https://app.airtm.com | Live transactions |

## Obtaining API Credentials

### Option 1: Self-Service (Sandbox)

This is the fastest way to get started for development and testing.

#### Step 1: Create Sandbox Account

1. Go to https://app.stg.airtm.io/login
2. Click "Sign Up" / "Create Account"
3. Complete the registration process
4. **Important**: Create at least **2 accounts** (you cannot send payments to yourself)
   - Account A: For initiating payments (buyer/sender)
   - Account B: For receiving payments (seller/receiver)

#### Step 2: Verify Your Account

1. Complete identity verification (KYC)
2. This is required before you can generate API credentials

#### Step 3: Enable Two-Factor Authentication (2FA)

1. Go to **Settings** → **Security**
2. Enable 2FA (mandatory for API access)
3. Save your backup codes

#### Step 4: Generate API Credentials

1. Go to **Settings** → **Applications**
2. Click "Create New Application" or "Generate API Key"
3. Enter your company/site name (this appears when users confirm payments)
4. Save your credentials securely:
   - `API Key`
   - `API Secret`

> **Note**: API key generation is only available through the web interface, not the mobile app.

#### Step 5: Request Test Funds

Contact your **Onboarding Manager** or **Account Manager** at Airtm to add test balance to your sandbox accounts.

### Option 2: Business Account (Recommended for Production)

For production access and enterprise features, register for a Business account.

#### Business Plans

| Plan | Description | Best For |
|------|-------------|----------|
| **Core** | Basic payments to Airtm-enabled users | Getting started |
| **Pro** | Bulk payments, dedicated platform | Growing teams |
| **Integrated** | Full API access, embedded functionality | Enterprise integration |

#### Registration Steps

1. Visit https://www.airtm.com/en/business/
2. Select the appropriate plan (likely **Integrated** for API access)
3. Complete the business registration form
4. Airtm sales team will contact you for onboarding
5. After approval, you'll receive:
   - Production API credentials
   - Webhook secret for signature verification
   - Dedicated Account Manager

## Environment Variables

Add these to your `.env` file:

```env
# Airtm Configuration
AIRTM_ENV=sandbox                           # sandbox | prod
AIRTM_API_KEY=your_api_key_here
AIRTM_API_SECRET=your_api_secret_here
AIRTM_WEBHOOK_SECRET=your_webhook_secret    # For Svix signature verification

# Required for webhooks
PUBLIC_BASE_URL=https://your-domain.com     # Or ngrok URL for local testing
```

### Sandbox vs Production

```env
# For Sandbox
AIRTM_ENV=sandbox

# For Production
AIRTM_ENV=prod
```

The API client automatically selects the correct host based on `AIRTM_ENV`.

## Local Development Setup

### 1. Start the API Server

```bash
npm run dev -w @offerhub/api
```

### 2. Expose Webhooks (Required for Airtm callbacks)

Airtm sends webhooks to notify about payment status changes. For local development, use ngrok:

```bash
# Install ngrok if needed
brew install ngrok  # macOS
# or download from https://ngrok.com

# Expose your local server
ngrok http 4000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`) and update your `.env`:

```env
PUBLIC_BASE_URL=https://abc123.ngrok.io
```

### 3. Configure Webhook URL in Airtm

In your Airtm dashboard, configure the webhook endpoint:
```
{PUBLIC_BASE_URL}/webhooks/airtm
```

## API Endpoints

### Top-ups (Pay-ins)

| Endpoint | Description |
|----------|-------------|
| `POST /topups` | Create a new top-up request |
| `GET /topups/:id` | Get top-up status |
| `GET /topups/:id/callback` | Callback URL for Airtm redirect |

### Withdrawals (Payouts)

| Endpoint | Description |
|----------|-------------|
| `POST /withdrawals` | Create withdrawal (uncommitted) |
| `POST /withdrawals/:id/commit` | Commit the withdrawal |
| `GET /withdrawals/:id` | Get withdrawal status |
| `DELETE /withdrawals/:id` | Cancel uncommitted withdrawal |

### Webhooks

| Endpoint | Description |
|----------|-------------|
| `POST /webhooks/airtm` | Receive Airtm webhook notifications |

## Testing Checklist

Use this checklist when testing the Airtm integration:

### Pay-in (Top-up) Flow
- [ ] Create top-up request returns valid confirmation URI
- [ ] User can be redirected to Airtm for payment confirmation
- [ ] Status check returns correct state (PENDING → PROCESSING → COMPLETED)
- [ ] Webhook updates status correctly on payment confirmation
- [ ] Balance is credited after successful top-up

### Payout (Withdrawal) Flow
- [ ] Create withdrawal request succeeds
- [ ] Commit withdrawal transitions state correctly
- [ ] Status check returns correct state
- [ ] Webhook updates completion status
- [ ] Balance is debited after successful withdrawal

### User Verification
- [ ] Verified user returns eligible status
- [ ] Unverified user returns ineligible with reason
- [ ] Country restrictions are enforced

### Webhook Security
- [ ] Valid Svix signature passes verification
- [ ] Invalid signature is rejected (401)
- [ ] Duplicate webhooks are deduplicated (idempotency)

### Error Scenarios
- [ ] Invalid API credentials return appropriate error
- [ ] Network failures are handled gracefully
- [ ] Insufficient balance errors are caught

## Webhook Signature Verification

Airtm uses [Svix](https://www.svix.com/) for webhook delivery. Each webhook includes these headers:

| Header | Description |
|--------|-------------|
| `svix-id` | Unique message ID |
| `svix-timestamp` | Unix timestamp |
| `svix-signature` | HMAC signature |

The signature is verified using `AIRTM_WEBHOOK_SECRET`.

### Webhook IPs (Whitelist if needed)

If your infrastructure requires IP whitelisting:

```
44.228.126.217
50.112.21.217
52.24.126.164
54.148.139.208
2600:1f24:64:8000::/56
```

## Fees and Limits

Contact your Airtm Sales Representative for specific fee structures. General limits:

| Operation | Min | Max |
|-----------|-----|-----|
| Top-up | $1.00 | $10,000.00 |
| Withdrawal | $10.00 | $5,000.00 |

> Note: Limits may vary based on your business agreement with Airtm.

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "Invalid API credentials" | Verify `AIRTM_API_KEY` and `AIRTM_API_SECRET` are correct |
| "2FA required" | Enable 2FA on your Airtm account before generating API keys |
| Webhooks not received | Check `PUBLIC_BASE_URL` is accessible from internet |
| Signature verification failed | Verify `AIRTM_WEBHOOK_SECRET` matches dashboard |
| "Cannot transact with self" | Use two different Airtm accounts for testing |

### Debug Mode

Enable verbose logging for Airtm requests:

```env
LOG_LEVEL=debug
```

## Support & Resources

| Resource | URL |
|----------|-----|
| API Documentation | https://docs.airtm.com/ |
| Help Center | https://help.airtm.com/en/support/solutions/folders/47000770266 |
| Business Registration | https://www.airtm.com/en/business/ |
| Sandbox Login | https://app.stg.airtm.io/login |
| Production Login | https://app.airtm.com/login |

### Contact

- **Technical Issues**: Contact your Onboarding Manager or Account Manager
- **Business Inquiries**: https://www.airtm.com/en/business/
- **API Support**: Through Airtm Help Center

## Related Documentation

- [Environment Variables](../deployment/env-variables.md)
- [Top-ups API](../api/endpoints/topups.md)
- [Withdrawals API](../api/endpoints/withdrawals.md)
- [Webhooks API](../api/endpoints/webhooks.md)
