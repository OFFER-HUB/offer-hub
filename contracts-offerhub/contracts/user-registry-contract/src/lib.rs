#![no_std]

mod access;
mod basic_test;
mod contract;
mod events;
mod storage;
mod test;
pub mod types;
mod validation;

use crate::contract::UserRegistryContract;
use crate::types::{Error, UserProfile,UserProfileSummary,  UserStatus, VerificationLevel};
use soroban_sdk::{contract, contractimpl, Address, Env, String, Vec};

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    // ==================== INITIALIZATION ====================

    /// Initialize the contract with an admin
    pub fn initialize_admin(env: Env, admin: Address) -> Result<(), Error> {
        UserRegistryContract::initialize_admin(env, admin)
    }

    // ==================== LEGACY FUNCTIONS (for backward compatibility) ====================

    /// Legacy function for registering a verified user
    pub fn register_verified_user(env: Env, user: Address) -> Result<(), Error> {
        UserRegistryContract::register_verified_user(env, user)
    }

    /// Legacy function to check if user is verified
    pub fn is_verified(env: Env, user: Address) -> bool {
        UserRegistryContract::is_verified(env, user)
    }

    // ==================== ENHANCED USER VERIFICATION ====================

    /// Verify a user with a specific level and optional expiration
    pub fn verify_user(
        env: Env,
        admin: Address,
        user: Address,
        level: VerificationLevel,
        expires_at: u64,
        metadata: String,
    ) -> Result<(), Error> {
        UserRegistryContract::verify_user(env, admin, user, level, expires_at, metadata)
    }

    /// Unverify a user
    pub fn unverify_user(env: Env, admin: Address, user: Address) -> Result<(), Error> {
        UserRegistryContract::unverify_user(env, admin, user)
    }

    /// Update verification level
    pub fn update_verification_level(
        env: Env,
        admin: Address,
        user: Address,
        new_level: VerificationLevel,
    ) -> Result<(), Error> {
        UserRegistryContract::update_verification_level(env, admin, user, new_level)
    }

    /// Renew verification (extend expiration)
    pub fn renew_verification(
        env: Env,
        admin: Address,
        user: Address,
        new_expires_at: u64,
    ) -> Result<(), Error> {
        UserRegistryContract::renew_verification(env, admin, user, new_expires_at)
    }

    // ==================== BLACKLIST FUNCTIONALITY ====================

    /// Add user to blacklist
    pub fn blacklist_user(env: Env, admin: Address, user: Address) -> Result<(), Error> {
        UserRegistryContract::blacklist_user(env, admin, user)
    }

    /// Remove user from blacklist
    pub fn unblacklist_user(env: Env, admin: Address, user: Address) -> Result<(), Error> {
        UserRegistryContract::unblacklist_user(env, admin, user)
    }

    /// Check if user is blacklisted
    pub fn is_user_blacklisted(env: Env, user: Address) -> bool {
        UserRegistryContract::is_user_blacklisted(env, user)
    }

    // ==================== BULK OPERATIONS ====================

    /// Bulk verify users
    pub fn bulk_verify_users(
        env: Env,
        admin: Address,
        users: Vec<Address>,
        level: VerificationLevel,
        expires_at: u64,
        metadata: String,
    ) -> Result<(), Error> {
        UserRegistryContract::bulk_verify_users(env, admin, users, level, expires_at, metadata)
    }

    // ==================== USER PROFILE METADATA ====================

    /// Update user metadata
    pub fn update_user_metadata(
        env: Env,
        caller: Address,
        user: Address,
        metadata: String,
    ) -> Result<(), Error> {
        UserRegistryContract::update_user_metadata(env, caller, user, metadata)
    }

    // ==================== STATUS CHECKING ====================

    /// Get comprehensive user status
    pub fn get_user_status(env: Env, user: Address) -> UserStatus {
        UserRegistryContract::get_user_status(env, user)
    }

    /// Get user profile
    pub fn get_user_profile(env: Env, user: Address) -> Option<UserProfile> {
        UserRegistryContract::get_user_profile_data(env, user)
    }

    /// Get  user profile formatted data
    pub fn get_user_profile_formatted(env: Env, user: Address) -> Result<UserProfileSummary, Error> {
        UserRegistryContract::get_user_profile(env, user)
    }


    /// Check verification level
    pub fn get_verification_level(env: Env, user: Address) -> Option<VerificationLevel> {
        UserRegistryContract::get_verification_level(env, user)
    }

    // ==================== ACCESS CONTROL ====================

    /// Add moderator
    pub fn add_moderator(env: Env, admin: Address, moderator: Address) -> Result<(), Error> {
        UserRegistryContract::add_moderator(env, admin, moderator)
    }

    /// Remove moderator
    pub fn remove_moderator(env: Env, admin: Address, moderator: Address) -> Result<(), Error> {
        UserRegistryContract::remove_moderator(env, admin, moderator)
    }

    /// Transfer admin role
    pub fn transfer_admin(
        env: Env,
        current_admin: Address,
        new_admin: Address,
    ) -> Result<(), Error> {
        UserRegistryContract::transfer_admin(env, current_admin, new_admin)
    }

    /// Get current admin
    pub fn get_admin(env: Env) -> Option<Address> {
        UserRegistryContract::get_admin(env)
    }

    /// Get all moderators
    pub fn get_moderators(env: Env) -> Vec<Address> {
        UserRegistryContract::get_moderators(env)
    }

    // ===== Rate limiting admin helpers =====
    pub fn set_rate_limit_bypass(
        env: Env,
        admin: Address,
        user: Address,
        bypass: bool,
    ) -> Result<(), Error> {
        UserRegistryContract::set_rate_limit_bypass(env, admin, user, bypass)
    }

    pub fn reset_rate_limit(
        env: Env,
        admin: Address,
        user: Address,
        limit_type: String,
    ) -> Result<(), Error> {
        UserRegistryContract::reset_rate_limit(env, admin, user, limit_type)
    }

    pub fn get_total_users(env: &Env) -> Result<u64, Error> {
        UserRegistryContract::get_total_users(env)
    }

    // ==================== CONTRACT MANAGEMENT ====================

    /// Set rating contract address (admin only)
    pub fn set_rating_contract(
        env: Env,
        admin: Address,
        contract_address: Address,
    ) -> Result<(), Error> {
        UserRegistryContract::set_rating_contract(env, admin, contract_address)
    }

    /// Add escrow contract address (admin only)
    pub fn add_escrow_contract(
        env: Env,
        admin: Address,
        contract_address: Address,
    ) -> Result<(), Error> {
        UserRegistryContract::add_escrow_contract(env, admin, contract_address)
    }

    /// Add dispute contract address (admin only)
    pub fn add_dispute_contract(
        env: Env,
        admin: Address,
        contract_address: Address,
    ) -> Result<(), Error> {
        UserRegistryContract::add_dispute_contract(env, admin, contract_address)
    }

    // ==================== DATA EXPORT FUNCTIONS ====================

    /// Export user data (user themselves or admin/moderator)
    pub fn export_user_data(
        env: Env,
        caller: Address,
        user: Address,
    ) -> Result<types::UserDataExport, Error> {
        UserRegistryContract::export_user_data(env, caller, user)
    }

    /// Export all users data (admin only)
    pub fn export_all_data(
        env: Env,
        admin: Address,
        limit: u32,
    ) -> Result<types::AllUsersExport, Error> {
        UserRegistryContract::export_all_data(env, admin, limit)
    }

    /// Export all platform data (admin only) - comprehensive export across all contract types
    pub fn export_platform_data(
        env: Env,
        admin: Address,
        limit: u32,
    ) -> Result<types::PlatformDataExport, Error> {
        UserRegistryContract::export_platform_data(env, admin, limit)
    }
}
