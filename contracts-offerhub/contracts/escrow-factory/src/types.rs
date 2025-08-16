use soroban_sdk::{contracttype, Address, BytesN, String, Symbol};

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct EscrowCreateParams {
    pub client: Address,
    pub freelancer: Address,
    pub amount: i128,
    pub fee_manager: Address,
    pub salt: BytesN<32>,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct DisputeParams {
    pub escrow_id: u32,
    pub result: Symbol,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct MilestoneCreateParams {
    pub escrow_id: u32,
    pub desc: String,
    pub amount: i128,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct MilestoneCreateResult {
    pub escrow_id: u32,
    pub milestone_id: u32,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct MilestoneParams {
    pub escrow_id: u32,
    pub milestone_id: u32,
}
