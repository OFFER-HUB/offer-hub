use soroban_sdk::{contracterror, contracttype, Address, String, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum EscrowStatus {
    Initialized,
    Funded,
    Released,
    Disputed,
    Resolved,
}

#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum DisputeResult {
    None = 0,
    ClientWins = 1,
    FreelancerWins = 2,
    Split = 3,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct MilestoneHistory {
    pub milestone: Milestone,
    pub action: String,
    pub timestamp: u64,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct Milestone {
    pub id: u32,
    pub description: String,
    pub amount: i128,
    pub approved: bool,
    pub released: bool,
    pub created_at: u64,
    pub approved_at: Option<u64>,
    pub released_at: Option<u64>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EscrowData {
    pub client: Address,
    pub freelancer: Address,
    pub arbitrator: Option<Address>,
    pub token: Option<Address>,
    pub amount: i128,
    pub status: EscrowStatus,
    pub dispute_result: u32,
    pub created_at: u64,
    pub funded_at: Option<u64>,
    pub released_at: Option<u64>,
    pub disputed_at: Option<u64>,
    pub resolved_at: Option<u64>,
    pub timeout_secs: Option<u64>,
    pub milestones: Vec<Milestone>,
    pub milestone_history: Vec<MilestoneHistory>,
    pub released_amount: i128,
    pub fee_manager: Address, // Fee manager contract address
    pub fee_collected: i128,  // Total fees collected
    pub net_amount: i128,     // Amount after fees
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    InvalidAmount = 4,
    InsufficientFunds = 5,
    InvalidStatus = 6,
    DisputeNotOpen = 7,
    InvalidDisputeResult = 8,
    MilestoneNotFound = 9,
    RateLimitExceeded = 10,
    UnexpectedError = 11,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EscrowDataExport {
    pub contract_id: String,
    pub escrow_data: EscrowData,
    pub milestones: Vec<Milestone>,
    pub milestone_history: Vec<MilestoneHistory>,
    pub export_timestamp: u64,
    pub export_version: String,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EscrowSummary {
    pub client: Address,
    pub freelancer: Address,
    pub amount: i128,
    pub status: String,
    pub created_at: u64,
    pub milestone_count: u32,
}
