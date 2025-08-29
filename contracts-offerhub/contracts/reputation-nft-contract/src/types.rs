use soroban_sdk::{contracterror, contracttype, Address, Env, Map, String};

pub type TokenId = u64;

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Metadata {
    pub name: String,
    pub description: String,
    pub uri: String,
    pub achievement_type: AchievementType,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum AchievementType {
    Standard,          // Regular NFT, can be transferred
    Reputation,        // Reputation-based achievements, non-transferable
    ProjectMilestone,  // Project-based milestones, non-transferable
    RatingMilestone,   // Rating-based milestones, non-transferable
    CustomAchievement, // Custom achievements, transferable with restrictions
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum Error {
    Unauthorized = 1,
    TokenDoesNotExist = 2,
    TokenAlreadyExists = 3,
    AlreadyMinter = 4,
    NotMinter = 5,
    NonTransferableToken = 6,
    InvalidAchievementType = 7,
}

// Achievement statistics struct
#[derive(Clone)]
pub struct AchievementStats {
    pub total_achievements: u32,
    pub achievement_types: Map<AchievementType, u32>,
    pub last_updated: u64,
}

pub const TOKEN_OWNER: &[u8] = &[0];
pub const TOKEN_METADATA: &[u8] = &[1];
pub const ADMIN: &[u8] = &[2];
pub const MINTER: &[u8] = &[3];
pub const USER_ACHIEVEMENTS: &[u8] = &[5];
pub const ACHIEVEMENT_STATS: &[u8] = &[6];
pub const ACHIEVEMENT_LEADERBOARD: &[u8] = &[7];

pub fn require_auth(_env: &Env, address: &Address) -> Result<(), Error> {
    address.require_auth();
    Ok(())
}
