use soroban_sdk::{contracttype, Address, String};

// Fee type constants
pub const FEE_TYPE_ESCROW: u32 = 1;
pub const FEE_TYPE_DISPUTE: u32 = 2;

#[contracttype]
#[derive(Clone)]
pub struct FeeConfig {
    pub escrow_fee_percentage: i128, // Fee percentage for escrow transactions (in basis points, 100 = 1%)
    pub dispute_fee_percentage: i128, // Fee percentage for dispute resolution (in basis points)
    pub arbitrator_fee_percentage: i128, // Fee percentage for arbitrators (in basis points)
    pub admin: Address,              // Admin address that can modify fees
    pub platform_wallet: Address,    // Platform wallet to receive fees
    pub initialized: bool,           // Whether the contract is initialized
}

#[contracttype]
#[derive(Clone)]
pub struct FeeCalculation {
    pub original_amount: i128, // Original amount before fees
    pub fee_amount: i128,      // Fee amount to be collected
    pub net_amount: i128,      // Amount after fees
    pub fee_percentage: i128,  // Applied fee percentage
    pub is_premium: bool,      // Whether user has premium status
}

#[contracttype]
#[derive(Clone)]
pub struct FeeRecord {
    pub timestamp: u64,         // When the fee was collected
    pub fee_type: u32,          // Type of fee (1 = escrow, 2 = dispute)
    pub amount: i128,           // Fee amount collected
    pub user: Address,          // User who paid the fee
    pub transaction_id: String, // Associated transaction ID
}

#[contracttype]
#[derive(Clone)]
pub struct FeeDistribution {
    pub platform_fee: i128,   // Amount going to platform
    pub arbitrator_fee: i128, // Amount going to arbitrator
    pub total_fee: i128,      // Total fee amount
}

#[contracttype]
#[derive(Clone)]
pub struct PremiumUser {
    pub address: Address,  // User address
    pub added_at: u64,     // When premium status was granted
    pub added_by: Address, // Who granted premium status
}

#[contracttype]
#[derive(Clone)]
pub struct FeeStats {
    pub total_fees_collected: i128,     // Total fees collected
    pub total_escrow_fees: i128,        // Total escrow fees
    pub total_dispute_fees: i128,       // Total dispute fees
    pub total_premium_exemptions: i128, // Total fees exempted for premium users
    pub total_transactions: u32,        // Total number of fee transactions
}


#[contracttype]
#[derive(Clone)]
pub struct PlatformStats {
    pub total_fees_collected: i128,     // Total fees collected
    pub total_escrow_fees: i128,        // Total escrow fees
    pub total_dispute_fees: i128,       // Total dispute fees
    pub total_premium_exemptions: i128, // Total fees exempted for premium users
    pub total_transactions: u32,            
    pub platform_balance: i128,           // Current platform balance
    pub premium_user_count: u32,          // Number of premium users
    pub escrow_fee_percentage: i128,      // Current escrow fee rate
    pub dispute_fee_percentage: i128,     // Current dispute fee rate
    pub arbitrator_fee_percentage: i128,  // Current arbitrator fee rate
    pub timestamp: u64,                   // Timestamp of the stats snapshot
}