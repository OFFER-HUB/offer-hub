#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String, Vec};

mod access;
mod analytics;
mod contract;
mod events;
mod health_check;
mod incentives;
// mod integration_test;
mod moderation;
mod restrictions;
mod storage;
mod test;
mod types;
mod validation;

pub use crate::contract::RatingContract;
use crate::types::UserRatingSummary;
pub use types::{
    Error, Feedback, HealthCheckResult, HealthStatus, Rating, RatingStats, UserRatingData,
};

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    /// Initialize the rating contract with an admin
    pub fn init(env: Env, admin: Address) -> Result<(), Error> {
        RatingContract::init(env, admin)
    }

    /// Submit a rating and feedback for a completed work contract
    pub fn submit_rating(
        env: Env,
        caller: Address,
        rated_user: Address,
        contract_id: String,
        rating: u32, // Changed from u8 to u32
        feedback: String,
        work_category: String,
    ) -> Result<(), Error> {
        RatingContract::submit_rating(
            env,
            caller,
            rated_user,
            contract_id,
            rating,
            feedback,
            work_category,
        )
    }

    /// Get rating statistics for a user
    pub fn get_user_rating_stats(env: Env, user: Address) -> Result<RatingStats, Error> {
        RatingContract::get_user_rating_stats(env, user)
    }

    /// Get all feedback for a user
    pub fn get_user_feedback(env: Env, user: Address, limit: u32) -> Result<Vec<Feedback>, Error> {
        RatingContract::get_user_feedback(env, user, limit)
    }

    /// Get detailed rating data for a user including history and trends
    pub fn get_user_rating_data(env: Env, user: Address) -> Result<UserRatingData, Error> {
        RatingContract::get_user_rating_data(env, user)
    }

    /// Get user's rating history with pagination
    pub fn get_user_rating_history(
        env: Env,
        user: Address,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<Rating>, Error> {
        RatingContract::get_user_rating_history(env, user, limit, offset)
    }

    /// Check if user has rating-based restrictions
    pub fn has_restrictions(env: Env, user: Address) -> Result<bool, Error> {
        RatingContract::has_restrictions(env, user)
    }

    /// Get user privileges based on ratings
    pub fn get_user_privileges(env: Env, user: Address) -> Result<Vec<String>, Error> {
        RatingContract::get_user_privileges(env, user)
    }

    /// Report feedback for moderation
    pub fn report_feedback(
        env: Env,
        caller: Address,
        feedback_id: String,
        reason: String,
    ) -> Result<(), Error> {
        RatingContract::report_feedback(env, caller, feedback_id, reason)
    }

    /// Moderate reported feedback (admin only)
    pub fn moderate_feedback(
        env: Env,
        caller: Address,
        feedback_id: String,
        action: String, // "approve", "remove", "flag"
        reason: String,
    ) -> Result<(), Error> {
        RatingContract::moderate_feedback(env, caller, feedback_id, action, reason)
    }

    /// Get platform-wide rating analytics
    pub fn get_platform_analytics(env: Env) -> Result<Vec<(String, String)>, Error> {
        RatingContract::get_platform_analytics(env)
    }

    /// Check user eligibility for rating incentives
    pub fn check_rating_incentives(env: Env, user: Address) -> Result<Vec<String>, Error> {
        RatingContract::check_rating_incentives(env, user)
    }

    /// Claim rating incentive rewards
    pub fn claim_incentive_reward(
        env: Env,
        caller: Address,
        incentive_type: String,
    ) -> Result<(), Error> {
        RatingContract::claim_incentive_reward(env, caller, incentive_type)
    }

    /// Update user reputation based on ratings (integration with reputation contract)
    pub fn update_reputation(env: Env, caller: Address, user: Address) -> Result<(), Error> {
        RatingContract::update_reputation(env, caller, user)
    }

    /// Admin functions
    pub fn add_moderator(env: Env, caller: Address, moderator: Address) -> Result<(), Error> {
        RatingContract::add_moderator(env, caller, moderator)
    }

    pub fn remove_moderator(env: Env, caller: Address, moderator: Address) -> Result<(), Error> {
        RatingContract::remove_moderator(env, caller, moderator)
    }

    pub fn set_rating_threshold(
        env: Env,
        caller: Address,
        threshold_type: String,
        value: u32,
    ) -> Result<(), Error> {
        RatingContract::set_rating_threshold(env, caller, threshold_type, value)
    }

    pub fn set_reputation_contract(
        env: Env,
        caller: Address,
        contract_address: Address,
    ) -> Result<(), Error> {
        RatingContract::set_reputation_contract(env, caller, contract_address)
    }

    pub fn get_admin(env: Env) -> Result<Address, Error> {
        RatingContract::get_admin(env)
    }

    pub fn transfer_admin(env: Env, caller: Address, new_admin: Address) -> Result<(), Error> {
        RatingContract::transfer_admin(env, caller, new_admin)
    }

    pub fn set_rate_limit_bypass(
        env: Env,
        admin: Address,
        user: Address,
        bypass: bool,
    ) -> Result<(), Error> {
        RatingContract::set_rate_limit_bypass(env, admin, user, bypass)
    }

    pub fn reset_rate_limit(
        env: Env,
        admin: Address,
        user: Address,
        limit_type: String,
    ) -> Result<(), Error> {
        RatingContract::reset_rate_limit(env, admin, user, limit_type)
    }

    // /// Perform a health check on the contract
    // pub fn health_check(env: Env) -> Result<HealthCheckResult, Error> {
    //     RatingContract::health_check(env)
    // }

    // /// Perform an admin health check with additional details
    // pub fn admin_health_check(env: Env, caller: Address) -> Result<HealthCheckResult, Error> {
    //     RatingContract::admin_health_check(env, caller)
    // }

    /// Get the last health check timestamp
    pub fn get_last_health_check(env: Env) -> u64 {
        RatingContract::get_last_health_check(env)
    }

    /// Get contract version
    pub fn get_contract_version(env: Env) -> String {
        RatingContract::get_contract_version(env)
    }

    /// Get contract total ratings count
    pub fn get_total_rating(env: &Env) -> Result<u64, Error> {
        Ok(RatingContract::get_total_rating(&env))
    }

    pub fn reset_total_rating(env: &Env, admin: Address) -> Result<(), Error> {
        RatingContract::reset_total_rating(&env, admin)
    }

    pub fn increment_rating_count(env: &Env) -> u64 {
        RatingContract::increment_rating_count(&env)
    }
    
    pub fn get_user_rating_summary(env: &Env, user: Address) -> Result<UserRatingSummary, Error> {
        RatingContract::get_user_rating_summary(&env, user)
    }
}

// use soroban_sdk::contractclient;

// #[contractclient(name = "ContractAClient")]
// pub trait ContractAInterface {
//     fn get_total_rating(env: &Env) -> u64;
// }
