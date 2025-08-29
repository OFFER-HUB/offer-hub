use soroban_sdk::{contracterror, contracttype, Address, Vec, String};

#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum DisputeOutcome {
    None,
    FavorFreelancer,
    FavorClient,
    Split,
}

#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum DisputeStatus {
    Open,
    UnderMediation,
    UnderArbitration,
    Resolved,
    Timeout,
}

#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum DisputeLevel {
    Mediation,
    Arbitration,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Evidence {
    pub submitter: Address,
    pub description: String,
    pub timestamp: u64,
    pub attachment_hash: Option<String>, // IPFS hash or similar
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DisputeData {
    pub initiator: Address,
    pub reason: String,
    pub timestamp: u64,
    pub resolved: bool,
    pub outcome: DisputeOutcome,
    pub status: DisputeStatus,
    pub level: DisputeLevel,
    pub fee_manager: Address,
    pub dispute_amount: i128,
    pub fee_collected: i128,
    pub escrow_contract: Option<Address>, // Direct escrow integration
    pub timeout_timestamp: Option<u64>,   // Automatic resolution timeout
    pub evidence: Vec<Evidence>,
    pub mediator: Option<Address>,
    pub arbitrator: Option<Address>,
    pub resolution_timestamp: Option<u64>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ArbitratorData {
    pub address: Address,
    pub name: String,
    pub is_active: bool,
    pub total_cases: u32,
    pub successful_resolutions: u32,
    pub added_at: u64,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    DisputeAlreadyExists = 4,
    DisputeNotFound = 5,
    DisputeAlreadyResolved = 6,
    InvalidArbitrator = 7,
    DisputeTimeout = 8,
    InvalidDisputeLevel = 9,
    EvidenceNotFound = 10,
    InvalidTimeout = 11,
    EscrowIntegrationFailed = 12,
    MediationRequired = 13,
    ArbitrationRequired = 14,
    RateLimitExceeded = 15,
}
