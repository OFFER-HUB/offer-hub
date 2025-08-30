# Fee Manager Contract Documentation

## Overview

The Fee Manager Contract is the centralized fee calculation and collection system for the Offer Hub platform. It manages platform fees, premium user exemptions, fee statistics, and provides transparent fee calculation for all platform transactions including escrow operations and dispute resolutions.

## Architecture

```
┌─────────────────────┐    ┌──────────────────────┐
│   Fee Configuration │────│   Premium Users      │
└─────────────────────┘    └──────────────────────┘
           │                           │
           ▼                           ▼
┌─────────────────────┐    ┌──────────────────────┐
│  Fee Calculation    │    │   Fee Collection     │
│  • Escrow Fees      │    │  • Platform Balance  │
│  • Dispute Fees     │    │  • Fee History       │
│  • Premium Discounts│    │  • Statistics        │
└─────────────────────┘    └──────────────────────┘
```

## API Reference

### Initialization

#### `initialize(env: Env, admin: Address, platform_wallet: Address)`
Initializes the fee manager with default configuration.

**Default Fees:**
- Escrow Fee: 2.5% (250 basis points)
- Dispute Fee: 5.0% (500 basis points)
- Arbitrator Fee: 3.0% (300 basis points)

### Fee Configuration

#### `set_fee_rates(env: Env, escrow_fee_percentage: i128, dispute_fee_percentage: i128, arbitrator_fee_percentage: i128)`
Updates platform fee rates.

**Authorization:** Admin only
**Parameters:** All percentages in basis points (100 = 1%)

### Premium User Management

#### `add_premium_user(env: Env, user: Address)`
Grants premium status with fee exemptions.

#### `remove_premium_user(env: Env, user: Address)`
Removes premium status.

#### `is_premium_user(env: Env, user: Address) -> bool`
Checks premium status.

### Fee Calculation

#### `calculate_escrow_fee(env: Env, amount: i128, user: Address) -> FeeCalculation`
Calculates escrow transaction fees.

#### `calculate_dispute_fee(env: Env, amount: i128, user: Address) -> FeeCalculation`
Calculates dispute resolution fees.

**Returns:**
```rust
FeeCalculation {
    original_amount: i128,
    fee_amount: i128,
    net_amount: i128,
    fee_percentage: i128,
    is_premium: bool,
}
```

### Fee Collection

#### `collect_fee(env: Env, amount: i128, fee_type: u32, user: Address) -> i128`
Collects fees and updates platform balance.

**Returns:** Net amount after fee deduction

## Integration Examples

### Calculate and Display Fees
```typescript
const calculateTransactionFee = async (amount: string, userAddress: string, type: 'escrow' | 'dispute') => {
  const calculation = type === 'escrow' 
    ? await feeManager.calculate_escrow_fee({ amount, user: userAddress })
    : await feeManager.calculate_dispute_fee({ amount, user: userAddress });
  
  return {
    originalAmount: calculation.original_amount,
    feeAmount: calculation.fee_amount,
    netAmount: calculation.net_amount,
    effectiveRate: calculation.fee_percentage / 100, // Convert to percentage
    isPremiumUser: calculation.is_premium
  };
};
```

## Security Considerations

1. **Admin-only configuration** for fee rates
2. **Precision handling** using basis points
3. **Premium user validation** with audit trail
4. **Fee transparency** with detailed calculations

---

For complete implementation details, see the full contract code and test suite.