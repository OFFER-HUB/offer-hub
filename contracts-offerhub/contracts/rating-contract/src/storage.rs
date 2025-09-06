use crate::types::{
    Error, Feedback, FeedbackReport, IncentiveRecord, RateLimitEntry, Rating, RatingStats, UserRatingSummary,
    RatingThreshold, ADMIN, FEEDBACK, FEEDBACK_REPORTS, INCENTIVE_RECORDS, MODERATOR,
    PLATFORM_STATS, RATE_LIMITS, RATE_LIMIT_BYPASS, RATING, RATING_THRESHOLDS, REPUTATION_CONTRACT,
    TOTAL_RATING_COUNT, USER_RATING_STATS, USER_RESTRICTIONS,
};
use soroban_sdk::{Address, Env, String, Symbol, Vec};

// Admin and moderator management
pub fn save_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&ADMIN, admin);
}

pub fn get_admin(env: &Env) -> Address {
    env.storage().instance().get(&ADMIN).unwrap()
}

pub fn save_moderator(env: &Env, moderator: &Address) {
    let key = (MODERATOR, moderator);
    env.storage().persistent().set(&key, &true);
}

pub fn remove_moderator(env: &Env, moderator: &Address) {
    let key = (MODERATOR, moderator);
    env.storage().persistent().remove(&key);
}

pub fn is_moderator(env: &Env, address: &Address) -> bool {
    let key = (MODERATOR, address);
    env.storage().persistent().get(&key).unwrap_or(false)
}

// Rating storage
pub fn save_rating(env: &Env, rating: &Rating) {
    let key = (RATING, rating.id.clone());
    env.storage().persistent().set(&key, rating);

    // Also index by user and contract for efficient retrieval
    add_rating_to_user_index(env, &rating.rated_user, &rating.id);
    add_rating_to_contract_index(env, &rating.contract_id, &rating.id);
}

fn add_rating_to_user_index(env: &Env, user: &Address, rating_id: &String) {
    let key = (soroban_sdk::symbol_short!("u_ratings"), user.clone());
    let mut rating_ids: Vec<String> = env
        .storage()
        .persistent()
        .get(&key)
        .unwrap_or_else(|| Vec::new(env));
    rating_ids.push_back(rating_id.clone());
    env.storage().persistent().set(&key, &rating_ids);
}

fn add_rating_to_contract_index(env: &Env, contract_id: &String, rating_id: &String) {
    let key = (soroban_sdk::symbol_short!("c_ratings"), contract_id.clone());
    let mut rating_ids: Vec<String> = env
        .storage()
        .persistent()
        .get(&key)
        .unwrap_or_else(|| Vec::new(env));
    rating_ids.push_back(rating_id.clone());
    env.storage().persistent().set(&key, &rating_ids);
}

pub fn get_rating(env: &Env, rating_id: &String) -> Result<Rating, Error> {
    let key = (RATING, rating_id.clone());
    env.storage()
        .persistent()
        .get(&key)
        .ok_or(Error::ContractNotFound)
}

pub fn has_rated_contract(env: &Env, rater: &Address, contract_id: &String) -> bool {
    // Generate a simple check by iterating through user's ratings
    // In production, this could be optimized with better indexing
    let ratings = get_ratings_by_contract(env, contract_id);
    for rating_id in ratings.iter() {
        if let Ok(rating) = get_rating(env, &rating_id) {
            if rating.rater == *rater {
                return true;
            }
        }
    }
    false
}

pub fn get_ratings_by_user(env: &Env, user: &Address) -> Vec<String> {
    let key = (soroban_sdk::symbol_short!("u_ratings"), user.clone());
    env.storage()
        .persistent()
        .get(&key)
        .unwrap_or_else(|| Vec::new(env))
}

pub fn get_ratings_by_contract(env: &Env, contract_id: &String) -> Vec<String> {
    let key = (soroban_sdk::symbol_short!("c_ratings"), contract_id.clone());
    env.storage()
        .persistent()
        .get(&key)
        .unwrap_or_else(|| Vec::new(env))
}

// Function to get user's rating history with pagination
pub fn get_user_rating_history(env: &Env, user: &Address, limit: u32, offset: u32) -> Vec<Rating> {
    let rating_ids = get_ratings_by_user(env, user);
    let mut ratings = Vec::new(env);

    let start = offset as usize;
    let end = u32::min(limit + offset, rating_ids.len()) as usize;

    for i in start..end {
        if let Some(rating_id) = rating_ids.get(i.try_into().unwrap()) {
            if let Ok(rating) = get_rating(env, &rating_id) {
                ratings.push_back(rating);
            }
        }
    }

    ratings
}

// New function to get user feedback IDs
pub fn get_user_feedback_ids(env: &Env, user: &Address) -> Vec<String> {
    let mut feedback_ids = Vec::new(env);
    let key = (soroban_sdk::symbol_short!("u_feedbck"), user.clone());

    // Get stored feedback IDs for this user
    if let Some(stored_ids) = env.storage().persistent().get::<_, Vec<String>>(&key) {
        feedback_ids = stored_ids;
    }

    feedback_ids
}

// Function to add feedback ID to user's feedback list
pub fn add_user_feedback_id(env: &Env, user: &Address, feedback_id: &String) {
    let mut feedback_ids = get_user_feedback_ids(env, user);
    feedback_ids.push_back(feedback_id.clone());

    let key = (soroban_sdk::symbol_short!("u_feedbck"), user.clone());
    env.storage().persistent().set(&key, &feedback_ids);
}

// Feedback storage
pub fn save_feedback(env: &Env, feedback: &Feedback) {
    let key = (FEEDBACK, feedback.id.clone());
    env.storage().persistent().set(&key, feedback);
}

pub fn get_feedback(env: &Env, feedback_id: &String) -> Result<Feedback, Error> {
    let key = (FEEDBACK, feedback_id.clone());
    env.storage()
        .persistent()
        .get(&key)
        .ok_or(Error::FeedbackNotFound)
}

pub fn update_feedback(env: &Env, feedback: &Feedback) {
    let key = (FEEDBACK, feedback.id.clone());
    env.storage().persistent().set(&key, feedback);
}

// Rating statistics
pub fn save_user_rating_stats(env: &Env, stats: &RatingStats) {
    let key = (USER_RATING_STATS, stats.user.clone());
    env.storage().persistent().set(&key, stats);
}

pub fn get_user_rating_stats(env: &Env, user: &Address) -> Result<RatingStats, Error> {
    let key = (USER_RATING_STATS, user.clone());
    env.storage()
        .persistent()
        .get(&key)
        .ok_or(Error::InsufficientRatings)
}

// Feedback reports
pub fn save_feedback_report(env: &Env, report: &FeedbackReport) {
    let key = (FEEDBACK_REPORTS, report.id.clone());
    env.storage().persistent().set(&key, report);
}

// Rating thresholds
pub fn save_rating_threshold(env: &Env, threshold: &RatingThreshold) {
    let key = (RATING_THRESHOLDS, threshold.threshold_type.clone());
    env.storage().persistent().set(&key, threshold);
}

pub fn get_rating_threshold(env: &Env, threshold_type: &String) -> Result<RatingThreshold, Error> {
    let key = (RATING_THRESHOLDS, threshold_type.clone());
    env.storage()
        .persistent()
        .get(&key)
        .ok_or(Error::ThresholdNotFound)
}

// Incentive records
pub fn save_incentive_record(env: &Env, record: &IncentiveRecord) {
    let key = (
        INCENTIVE_RECORDS,
        record.user.clone(),
        record.incentive_type.clone(),
    );
    env.storage().persistent().set(&key, record);
}

pub fn get_incentive_record(
    env: &Env,
    user: &Address,
    incentive_type: &String,
) -> Result<IncentiveRecord, Error> {
    let key = (INCENTIVE_RECORDS, user.clone(), incentive_type.clone());
    env.storage()
        .persistent()
        .get(&key)
        .ok_or(Error::IncentiveNotFound)
}

// Reputation contract integration
pub fn save_reputation_contract(env: &Env, contract_address: &Address) {
    env.storage()
        .instance()
        .set(&REPUTATION_CONTRACT, contract_address);
}

pub fn get_reputation_contract(env: &Env) -> Result<Address, Error> {
    env.storage()
        .instance()
        .get(&REPUTATION_CONTRACT)
        .ok_or(Error::ReputationContractNotSet)
}

// User restrictions
pub fn save_user_restriction(env: &Env, user: &Address, restriction: &String) {
    let key = (USER_RESTRICTIONS, user);
    env.storage().persistent().set(&key, restriction);
}

pub fn get_user_restriction(env: &Env, user: &Address) -> String {
    let key = (USER_RESTRICTIONS, user);
    env.storage()
        .persistent()
        .get(&key)
        .unwrap_or_else(|| String::from_str(env, "none"))
}

// Platform statistics
pub fn increment_platform_stat(env: &Env, stat_name: &String) {
    let key = (PLATFORM_STATS, stat_name.clone());
    let current: u32 = env.storage().persistent().get(&key).unwrap_or(0);
    env.storage().persistent().set(&key, &(current + 1));
}

pub fn get_platform_stat(env: &Env, stat_name: &String) -> u32 {
    let key = (PLATFORM_STATS, stat_name.clone());
    env.storage().persistent().get(&key).unwrap_or(0)
}

// ================= Rate limiting =================
fn rl_key<'a>(user: &'a Address, limit_type: &'a String) -> (&'static [u8], Address, String) {
    (RATE_LIMITS, user.clone(), limit_type.clone())
}

fn bypass_key(user: &Address) -> (&'static [u8], Address) {
    (RATE_LIMIT_BYPASS, user.clone())
}

pub fn get_rate_limit(env: &Env, user: &Address, limit_type: &String) -> RateLimitEntry {
    env.storage()
        .persistent()
        .get(&rl_key(user, limit_type))
        .unwrap_or(RateLimitEntry {
            current_calls: 0,
            window_start: env.ledger().timestamp(),
        })
}

pub fn set_rate_limit(env: &Env, user: &Address, limit_type: &String, entry: &RateLimitEntry) {
    env.storage()
        .persistent()
        .set(&rl_key(user, limit_type), entry);
}

pub fn reset_rate_limit(env: &Env, user: &Address, limit_type: &String) {
    let entry = RateLimitEntry {
        current_calls: 0,
        window_start: env.ledger().timestamp(),
    };
    set_rate_limit(env, user, limit_type, &entry);
}

pub fn set_rate_limit_bypass(
    env: &Env,
    admin: &Address,
    user: &Address,
    bypass: bool,
) -> Result<(), Error> {
    // Simple admin check using stored admin
    let current_admin = get_admin(env);
    if &current_admin != admin {
        return Err(Error::Unauthorized);
    }
    env.storage().persistent().set(&bypass_key(user), &bypass);
    Ok(())
}

pub fn has_rate_limit_bypass(env: &Env, user: &Address) -> bool {
    env.storage()
        .persistent()
        .get(&bypass_key(user))
        .unwrap_or(false)
}

pub fn check_rate_limit(
    env: &Env,
    user: &Address,
    limit_type: &String,
    max_calls: u32,
    time_window: u64,
) -> Result<(), Error> {
    if has_rate_limit_bypass(env, user) {
        return Ok(());
    }
    let now = env.ledger().timestamp();
    let mut entry = get_rate_limit(env, user, limit_type);
    if now.saturating_sub(entry.window_start) > time_window {
        entry.current_calls = 0;
        entry.window_start = now;
    }
    if entry.current_calls >= max_calls {
        return Err(Error::RateLimitExceeded);
    }
    entry.current_calls += 1;
    set_rate_limit(env, user, limit_type, &entry);
    // emit a basic rate_limit event
    env.events().publish(
        (Symbol::new(env, "rate_limit"), user.clone()),
        (limit_type.clone(), entry.current_calls, entry.window_start),
    );
    Ok(())
}

// ================= Health Check Storage =================
pub fn save_last_health_check(env: &Env, timestamp: u64) {
    env.storage()
        .instance()
        .set(&Symbol::new(env, "last_health_check"), &timestamp);
}

pub fn get_last_health_check(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get(&Symbol::new(env, "last_health_check"))
        .unwrap_or(0)
}

pub fn save_health_check_issues(env: &Env, issues: &Vec<String>) {
    env.storage()
        .instance()
        .set(&Symbol::new(env, "health_issues"), issues);
}

pub fn get_health_check_issues(env: &Env) -> Vec<String> {
    env.storage()
        .instance()
        .get(&Symbol::new(env, "health_issues"))
        .unwrap_or_else(|| Vec::new(env))
}

pub fn save_contract_version(env: &Env, version: &String) {
    env.storage()
        .instance()
        .set(&Symbol::new(env, "contract_version"), version);
}

pub fn get_contract_version(env: &Env) -> String {
    env.storage()
        .instance()
        .get(&Symbol::new(env, "contract_version"))
        .unwrap_or_else(|| String::from_str(env, "1.0.0"))
}

// Statistcis and Metrics
pub fn get_total_rating(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get(&TOTAL_RATING_COUNT)
        .unwrap_or(0)
}

pub fn set_total_rating(env: &Env, count: u64) {
    env.storage().instance().set(&TOTAL_RATING_COUNT, &count);
}

pub fn increment_rating_count(env: &Env) -> u64 {
    let current_count = get_total_rating(env);
    let new_total_rating = current_count + 1;
    set_total_rating(env, new_total_rating);
    new_total_rating
}
