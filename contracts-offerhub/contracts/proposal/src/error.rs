use soroban_sdk::contracterror;

#[contracterror]
#[derive(Clone, Debug, Eq, PartialEq, Copy)]
#[repr(u32)]
pub enum ProposalError {
    InvalidInput = 1,
    FreelancerNotRegistered = 2,
    DuplicateProposal = 3,
    ProposalNotFound = 4,
    Unauthorized = 5,
    NotInitialized = 6,
    AlreadyInitialized = 7,
}