use soroban_sdk::{contracterror, contracttype, symbol_short, Address, String, Symbol, Vec};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum Error {
    Unauthorized = 1,
    InvalidRating = 2,
    AlreadyRated = 3,
    ContractNotFound = 4,
    InsufficientRatings = 5,
    RatingRestricted = 6,
    FeedbackNotFound = 7,
    InvalidModerationAction = 8,
    ThresholdNotFound = 9,
    IncentiveNotFound = 10,
    IncentiveAlreadyClaimed = 11,
    ReputationContractNotSet = 12,
    AlreadyModerator = 13,
    NotModerator = 14,
    RateLimitExceeded = 15,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Rating {
    pub id: String,
    pub rater: Address,
    pub rated_user: Address,
    pub contract_id: String,
    pub rating: u32, // Changed from u8 to u32 for Soroban compatibility
    pub timestamp: u64,
    pub work_category: String,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Feedback {
    pub id: String,
    pub rating_id: String,
    pub rater: Address,
    pub rated_user: Address,
    pub contract_id: String,
    pub feedback: String,
    pub timestamp: u64,
    pub is_flagged: bool,
    pub moderation_status: String, // "pending", "approved", "removed"
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct RatingStats {
    pub user: Address,
    pub total_ratings: u32,
    pub average_rating: u32, // Multiplied by 100 for precision (e.g., 450 = 4.50)
    pub five_star_count: u32,
    pub four_star_count: u32,
    pub three_star_count: u32,
    pub two_star_count: u32,
    pub one_star_count: u32,
    pub last_updated: u64,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct UserRatingSummary {
    pub user: Address,
    pub total_ratings: u32,
    pub average_rating: u32, // Multiplied by 100 for precision (e.g., 450 = 4.50)
    pub five_star_count: u32,
    pub four_star_count: u32,
    pub three_star_count: u32,
    pub two_star_count: u32,
    pub one_star_count: u32,
    pub last_updated: u64,
    pub recent_ratings:  Vec<(String, Address, Address, String, u32, u64, String)>,
    pub rating_trend: i32, // Positive for improving, negative for declining
    pub achievement_eligible: Vec<String>,
    pub restriction_status: String, // "none", "warning", "restricted"
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct UserRatingData {
    pub stats: RatingStats,
    pub recent_ratings: Vec<Rating>,
    pub rating_trend: i32, // Positive for improving, negative for declining
    pub achievement_eligible: Vec<String>,
    pub restriction_status: String, // "none", "warning", "restricted"
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct FeedbackReport {
    pub id: String,
    pub feedback_id: String,
    pub reporter: Address,
    pub reason: String,
    pub timestamp: u64,
    pub status: String, // "pending", "resolved", "dismissed"
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct RatingThreshold {
    pub threshold_type: String,
    pub value: u32,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct IncentiveRecord {
    pub user: Address,
    pub incentive_type: String,
    pub claimed: bool,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct HealthStatus {
    pub is_healthy: bool,
    pub issues: Vec<String>,
    pub last_check: u64,
    pub gas_used: u64,
    pub contract_version: String,
    pub admin_set: bool,
    pub storage_accessible: bool,
    pub critical_params_valid: bool,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct HealthCheckResult {
    pub status: HealthStatus,
    pub details: Vec<String>,
    pub recommendations: Vec<String>,
}

// Storage keys
pub const ADMIN: &[u8] = &[0];
pub const MODERATOR: &[u8] = &[1];
pub const RATING: &[u8] = &[2];
pub const FEEDBACK: &[u8] = &[3];
pub const USER_RATING_STATS: &[u8] = &[4];

pub const FEEDBACK_REPORTS: &[u8] = &[7];
pub const RATING_THRESHOLDS: &[u8] = &[8];
pub const INCENTIVE_RECORDS: &[u8] = &[9];
pub const REPUTATION_CONTRACT: &[u8] = &[10];
pub const PLATFORM_STATS: &[u8] = &[11];
pub const USER_RESTRICTIONS: &[u8] = &[12];
pub const RATE_LIMITS: &[u8] = &[13];
pub const RATE_LIMIT_BYPASS: &[u8] = &[14];

// Rating validation constants
pub const MIN_RATING: u32 = 1;
pub const MAX_RATING: u32 = 5;
pub const MAX_FEEDBACK_LENGTH: u32 = 1000;

// Default thresholds
pub const DEFAULT_RESTRICTION_THRESHOLD: u32 = 250; // 2.50 average rating
pub const DEFAULT_WARNING_THRESHOLD: u32 = 300; // 3.00 average rating
pub const DEFAULT_TOP_RATED_THRESHOLD: u32 = 480; // 4.80 average rating

pub const TOTAL_RATING_COUNT: Symbol = symbol_short!("TOTALRATE");

pub fn require_auth(address: &Address) -> Result<(), Error> {
    address.require_auth();
    Ok(())
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct RateLimitEntry {
    pub current_calls: u32,
    pub window_start: u64,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct RatingDataExport {
    pub user_address: Address,
    pub stats: RatingStats,
    pub ratings: Vec<Rating>,
    pub feedback: Vec<Feedback>,
    pub export_timestamp: u64,
    pub export_version: String,
    pub data_size_limit_reached: bool,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct AllRatingDataExport {
    pub total_ratings: u64,
    pub platform_stats: Vec<(String, String)>,
    pub export_timestamp: u64,
    pub export_version: String,
    pub data_size_limit_reached: bool,
}
