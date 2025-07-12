#![no_std]
use crate::error::ProposalError;
use crate::events::{emit_proposal_submitted, emit_proposal_removed};
use crate::types::{DataKey, ProposalData};
use soroban_sdk::{contract, contractimpl, Address, Env, Map, String, Symbol, Vec, IntoVal};

#[contract]
pub struct ProposalContract;

#[contractimpl]
impl ProposalContract {
    pub fn submit_proposal(
        env: Env,
        freelancer: Address,
        job_id: u32,
        message: String,
        proposed_price: u64,
    ) -> Result<(), ProposalError> {
        freelancer.require_auth();

        if message.len() == 0 || proposed_price == 0 {
            return Err(ProposalError::InvalidInput);
        }

        let freelancer_registry: Address = env
            .storage()
            .instance()
            .get(&DataKey::FreelancerRegistry)
            .ok_or(ProposalError::NotInitialized)?;

        let is_registered: bool = env.invoke_contract(
            &freelancer_registry,
            &Symbol::new(&env, "is_registered"),
            soroban_sdk::vec![&env, freelancer.clone().into_val(&env)],
        );

        if !is_registered {
            return Err(ProposalError::FreelancerNotRegistered);
        }

        let proposal_key = DataKey::Proposals(job_id);
        let mut proposals: Map<Address, ProposalData> = env
            .storage()
            .persistent()
            .get(&proposal_key)
            .unwrap_or(Map::new(&env));

        if proposals.contains_key(freelancer.clone()) {
            return Err(ProposalError::DuplicateProposal);
        }

        let timestamp = env.ledger().timestamp();
        let proposal = ProposalData {
            freelancer: freelancer.clone(),
            message: message.clone(),
            proposed_price,
            timestamp,
        };

        proposals.set(freelancer.clone(), proposal);
        env.storage().persistent().set(&proposal_key, &proposals);

        emit_proposal_submitted(&env, &freelancer, &job_id, &proposed_price, &timestamp);

        Ok(())
    }

    pub fn get_proposals_for_job(env: Env, job_id: u32) -> Vec<ProposalData> {
        let proposal_key = DataKey::Proposals(job_id);
        let proposals: Map<Address, ProposalData> = env
            .storage()
            .persistent()
            .get(&proposal_key)
            .unwrap_or(Map::new(&env));

        let mut result = Vec::new(&env);
        for (_, proposal) in proposals.iter() {
            result.push_back(proposal);
        }
        result
    }

    pub fn get_proposal(
        env: Env,
        job_id: u32,
        freelancer: Address,
    ) -> Option<ProposalData> {
        let proposal_key = DataKey::Proposals(job_id);
        let proposals: Map<Address, ProposalData> = env
            .storage()
            .persistent()
            .get(&proposal_key)?;

        proposals.get(freelancer)
    }

    pub fn initialize(env: Env, admin: Address, freelancer_registry: Address) -> Result<(), ProposalError> {
        admin.require_auth();

        if env.storage().instance().has(&DataKey::Admin) {
            return Err(ProposalError::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::FreelancerRegistry, &freelancer_registry);

        Ok(())
    }

    pub fn remove_proposal(
        env: Env,
        admin: Address,
        job_id: u32,
        freelancer: Address,
    ) -> Result<(), ProposalError> {
        admin.require_auth();

        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(ProposalError::NotInitialized)?;

        if admin != stored_admin {
            return Err(ProposalError::Unauthorized);
        }

        let proposal_key = DataKey::Proposals(job_id);
        let mut proposals: Map<Address, ProposalData> = env
            .storage()
            .persistent()
            .get(&proposal_key)
            .ok_or(ProposalError::ProposalNotFound)?;

        if !proposals.contains_key(freelancer.clone()) {
            return Err(ProposalError::ProposalNotFound);
        }

        proposals.remove(freelancer.clone());

        if proposals.len() == 0 {
            env.storage().persistent().remove(&proposal_key);
        } else {
            env.storage().persistent().set(&proposal_key, &proposals);
        }

        emit_proposal_removed(&env, &freelancer, &job_id);

        Ok(())
    }

    pub fn get_proposal_count(env: Env, job_id: u32) -> u32 {
        let proposal_key = DataKey::Proposals(job_id);
        let proposals: Map<Address, ProposalData> = env
            .storage()
            .persistent()
            .get(&proposal_key)
            .unwrap_or(Map::new(&env));

        proposals.len()
    }
}

mod error;
mod events;
mod test;
mod types;