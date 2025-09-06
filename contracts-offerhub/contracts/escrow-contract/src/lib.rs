#![no_std]
use crate::types::{Error, EscrowSummary};
use soroban_sdk::{contract, contractimpl, Address, Env, String, Symbol, Vec};

mod contract;
mod error;
mod storage;
mod types;
mod validation;

// #[cfg(test)]
// mod validation_test;

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    pub fn init_contract(
        env: Env,
        client: Address,
        freelancer: Address,
        amount: i128,
        fee_manager: Address,
    ) {
        contract::init_contract(&env, client, freelancer, amount, fee_manager);
    }

    pub fn deposit_funds(env: Env, client: Address) {
        contract::deposit_funds(&env, client);
    }

    pub fn release_funds(env: Env, freelancer: Address) {
        contract::release_funds(&env, freelancer);
    }

    pub fn dispute(env: Env, caller: Address) {
        contract::dispute(&env, caller);
    }

    pub fn resolve_dispute(env: Env, caller: Address, result: Symbol) {
        contract::resolve_dispute(&env, caller, result);
    }

    pub fn init_contract_full(
        env: Env,
        client: Address,
        freelancer: Address,
        arbitrator: Address,
        token: Address,
        amount: i128,
        timeout_secs: u64,
    ) {
        contract::init_contract_full(
            &env,
            client,
            freelancer,
            arbitrator,
            token,
            amount,
            timeout_secs,
        );
    }

    pub fn auto_release(env: Env) {
        contract::auto_release(&env);
    }

    pub fn get_escrow_data(env: Env) -> types::EscrowData {
        contract::get_escrow_data(&env)
    }

    pub fn add_milestone(env: Env, client: Address, desc: String, amount: i128) -> u32 {
        contract::add_milestone(&env, client, desc, amount)
    }

    pub fn approve_milestone(env: Env, client: Address, milestone_id: u32) {
        contract::approve_milestone(&env, client, milestone_id);
    }

    pub fn release_milestone(env: Env, freelancer: Address, milestone_id: u32) {
        contract::release_milestone(&env, freelancer, milestone_id);
    }

    pub fn get_milestones(env: Env) -> Vec<types::Milestone> {
        contract::get_milestones(&env)
    }

    pub fn get_milestone_history(env: Env) -> Vec<types::MilestoneHistory> {
        contract::get_milestone_history(&env)
    }
    pub fn test_set_dispute_result(env: Env, result: u32) {
        let mut data = contract::get_escrow_data(&env);
        data.dispute_result = result;
        contract::set_escrow_data(&env, &data);
    }

    pub fn get_total_transactions(env: &Env) -> u64 {
        contract::get_total_transactions(env)
    }

    pub fn reset_transaction_count(env: &Env, admin: Address) -> Result<(), Error> {
        contract::reset_transaction_count(env, admin)
    }

    // ===== Rate limiting admin helpers =====
    pub fn set_rate_limit_bypass(env: Env, caller: Address, user: Address, bypass: bool) {
        contract::set_rate_limit_bypass(&env, caller, user, bypass);
    }

    pub fn reset_rate_limit(env: Env, caller: Address, user: Address, limit_type: String) {
        contract::reset_rate_limit(&env, caller, user, limit_type);
    }

    pub fn get_contract_status(env: &Env, contract_id: Address) -> EscrowSummary {
        contract::get_contract_status(&env, contract_id)

    }

}

#[cfg(test)]
mod test;
