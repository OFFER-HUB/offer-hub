#![no_std]
use crate::error::Error;
use soroban_sdk::{contract, contractimpl, Address, Env, Vec};
mod contract;
mod error;
mod storage;
mod types;
mod validation;

#[cfg(test)]
mod test;

#[contract]
pub struct FeeManagerContract;

#[contractimpl]
impl FeeManagerContract {
    pub fn initialize(env: Env, admin: Address, platform_wallet: Address) {
        contract::initialize(&env, admin, platform_wallet);
    }

    pub fn set_fee_rates(
        env: Env,
        escrow_fee_percentage: i128,
        dispute_fee_percentage: i128,
        arbitrator_fee_percentage: i128,
    ) {
        contract::set_fee_rates(
            &env,
            escrow_fee_percentage,
            dispute_fee_percentage,
            arbitrator_fee_percentage,
        );
    }

    pub fn add_premium_user(env: Env, user: Address) {
        contract::add_premium_user(&env, user);
    }

    pub fn remove_premium_user(env: Env, user: Address) {
        contract::remove_premium_user(&env, user);
    }

    pub fn calculate_escrow_fee(env: Env, amount: i128, user: Address) -> types::FeeCalculation {
        contract::calculate_escrow_fee(&env, amount, user)
    }

    pub fn calculate_dispute_fee(env: Env, amount: i128, user: Address) -> types::FeeCalculation {
        contract::calculate_dispute_fee(&env, amount, user)
    }

    pub fn collect_fee(env: Env, amount: i128, fee_type: u32, user: Address) -> i128 {
        contract::collect_fee(&env, amount, fee_type, user)
    }

    pub fn collect(env: Env, amount: i128, fee_type: u32, user: Address) -> i128 {
        contract::collect_fee(&env, amount, fee_type, user)
    }

    pub fn withdraw_platform_fees(env: Env, amount: i128) {
        contract::withdraw_platform_fees(&env, amount);
    }

    pub fn get_fee_config(env: Env) -> types::FeeConfig {
        contract::get_fee_config(&env)
    }

    pub fn is_premium_user(env: Env, user: Address) -> bool {
        contract::is_premium_user(&env, user)
    }

    pub fn get_platform_balance(env: Env) -> i128 {
        contract::get_platform_balance(&env)
    }

    pub fn get_fee_history(env: Env) -> Vec<types::FeeRecord> {
        contract::get_fee_history(&env)
    }

    pub fn get_fee_stats(env: Env) -> types::FeeStats {
        contract::get_fee_stats(&env)
    }

    pub fn get_premium_users(env: Env) -> Vec<types::PremiumUser> {
        contract::get_premium_users(&env)
    }

    pub fn get_total_fees(env: &Env) -> i128 {
        contract::get_total_fees(&env)
    }

    pub fn reset_total_fees_collected(env: &Env, admin: Address) -> Result<(), Error> {
        contract::reset_total_fees_collected(&env, admin)
    }

    pub fn get_platform_stats(env: &Env) -> Result<types::PlatformStats, Error> {
        contract::get_platform_stats(&env)
    }
}
