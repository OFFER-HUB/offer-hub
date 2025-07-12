use soroban_sdk::{contracttype, Address, String};

/// Proposal data structure
#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct ProposalData {
    pub freelancer: Address,
    pub message: String,
    pub proposed_price: u64,
    pub timestamp: u64,
}

/// Data keys for storage
#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Proposals(u32), 
    Admin, 
    FreelancerRegistry, 
}