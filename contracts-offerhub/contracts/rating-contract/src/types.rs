use soroban_sdk::{contracttype, Address, String};

/// Represents a rating given by one user to another for a specific job
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RatingData {
    pub rater: Address,
    pub job_id: u32,
    pub score: i32,
    pub comment: String,
    pub timestamp: u64,
}

/// Error types for the Rating Contract
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Error {
    // Authentication errors
    Unauthorized,
    
    // Validation errors
    InvalidScore,
    DuplicateRating,
    JobNotComplete,
    NotJobParticipant,
    UserNotFound,
}

impl From<soroban_sdk::Error> for Error {
    fn from(_e: soroban_sdk::Error) -> Self {
        // Default to Unauthorized for any SDK errors
        Error::Unauthorized
    }
}

impl From<Error> for soroban_sdk::Error {
    fn from(_e: Error) -> Self {
        // Map our custom errors to generic contract error
        soroban_sdk::Error::from_contract_error(1)
    }
}

impl From<&Error> for soroban_sdk::Error {
    fn from(_e: &Error) -> Self {
        // Map our custom errors to generic contract error
        soroban_sdk::Error::from_contract_error(1)
    }
}

/// Storage keys for the contract's persistent data
pub const RATING_KEY_PREFIX: &[u8] = b"RATING";
pub const USER_RATINGS_PREFIX: &[u8] = b"USER_RATINGS";
