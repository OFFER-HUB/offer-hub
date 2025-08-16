#![no_std]

mod contract;
mod error;
mod storage;
mod types;

use soroban_sdk::{contract, contractimpl, Address, BytesN, Env, Vec};
use types::{
    DisputeParams, EscrowCreateParams, MilestoneCreateParams, MilestoneCreateResult,
    MilestoneParams,
};

mod escrow_contract {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32-unknown-unknown/release/escrow_contract.wasm"
    );
}

#[contract]
pub struct EscrowFactory;

#[contractimpl]
impl EscrowFactory {
    pub fn __constructor(env: Env, wasm_hash: BytesN<32>) {
        contract::upload_escrow_wasm(env, wasm_hash);
    }

    pub fn deploy_new_escrow(env: Env, create_params: EscrowCreateParams) -> Address {
        contract::deploy_new_escrow(env, create_params)
    }

    pub fn batch_deploy(env: Env, params: Vec<EscrowCreateParams>) -> Vec<Address> {
        contract::batch_deploy(env, params)
    }

    pub fn batch_deposit_funds(env: Env, escrow_ids: Vec<u32>, client: Address) {
        contract::batch_deposit_funds(env, escrow_ids, client);
    }

    pub fn batch_release_funds(env: Env, escrow_ids: Vec<u32>, freelancer: Address) {
        contract::batch_release_funds(env, escrow_ids, freelancer);
    }

    pub fn batch_create_disputes(env: Env, escrow_ids: Vec<u32>, caller: Address) {
        contract::batch_create_disputes(env, escrow_ids, caller);
    }

    pub fn batch_resolve_disputes(env: Env, caller: Address, dispute_params: Vec<DisputeParams>) {
        contract::batch_resolve_disputes(env, caller, dispute_params);
    }

    pub fn batch_add_milestones(
        env: Env,
        milestone_create_params: Vec<MilestoneCreateParams>,
        client: Address,
    ) -> Vec<MilestoneCreateResult> {
        contract::batch_add_milestones(env, milestone_create_params, client)
    }

    pub fn batch_approve_milestones(
        env: Env,
        milestone_params: Vec<MilestoneParams>,
        client: Address,
    ) {
        contract::batch_approve_milestones(env, milestone_params, client);
    }

    pub fn batch_release_milestones(
        env: Env,
        milestone_params: Vec<MilestoneParams>,
        freelancer: Address,
    ) {
        contract::batch_release_milestones(env, milestone_params, freelancer);
    }

    pub fn batch_archive_escrows(env: Env, escrow_ids: Vec<u32>) -> Vec<u32> {
        contract::batch_archive_escrows(env, escrow_ids)
    }

    pub fn batch_check_escrow_status(
        env: Env,
        escrow_ids: Vec<u32>,
    ) -> Vec<escrow_contract::EscrowStatus> {
        contract::batch_check_escrow_status(env, escrow_ids)
    }

    pub fn batch_get_escrow_information(
        env: Env,
        escrow_ids: Vec<u32>,
    ) -> Vec<escrow_contract::EscrowData> {
        contract::batch_get_escrow_information(env, escrow_ids)
    }

    pub fn get_escrow_id_by_address(env: Env, escrow_address: Address) -> Option<u32> {
        contract::get_escrow_id_by_address(env, escrow_address)
    }

    pub fn is_archived(env: Env, escrow_id: Option<u32>, escrow_address: Option<Address>) -> bool {
        contract::is_archived(env, escrow_id, escrow_address)
    }
}

#[cfg(test)]
mod test;
