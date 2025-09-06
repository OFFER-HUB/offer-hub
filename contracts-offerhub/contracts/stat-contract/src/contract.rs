
use soroban_sdk::{Address, Env, Symbol};
use crate::storage::{ContractStats};
use crate::types::{DataKey, Error};
use escrow_contract;

use rating_contract;

use user_registry_contract;

pub struct StatContract;

impl StatContract {

    pub fn initialize(env: Env, user_registry_id: Address, rating_contract_id: Address, escrow_id: Address, dispute_id: Address, fee_manager_id: Address) {
        env.storage().instance().set(&DataKey::UserRegistryContract, &user_registry_id);
        env.storage().instance().set(&DataKey::RatingContract, &rating_contract_id);
        env.storage().instance().set(&DataKey::EscrowContract, &escrow_id);
        env.storage().instance().set(&DataKey::DisputeContract, &dispute_id);
        env.storage().instance().set(&DataKey::FeeManagerContract, &fee_manager_id);
        env.events().publish((Symbol::new(&env , "stat_contract_initialized"), ), (user_registry_id, rating_contract_id , escrow_id, dispute_id , fee_manager_id , env.ledger().timestamp()));

    }

    pub fn get_contract_stats(env: Env) -> Result<ContractStats, Error> {
        let user_registry_contract_id = env
            .storage()
            .instance()
            .get::<_, Address>(&DataKey::UserRegistryContract)
            .ok_or(Error::NotInitialized)?;

        let rating_contract_id = env
            .storage()
            .instance()
            .get::<_, Address>(&DataKey::RatingContract)
            .ok_or(Error::NotInitialized)?;

        let escrow_contract_id = env
            .storage()
            .instance()
            .get::<_, Address>(&DataKey::EscrowContract)
            .ok_or(Error::NotInitialized)?;

        let dispute_contract_id = env
            .storage()
            .instance()
            .get::<_, Address>(&DataKey::DisputeContract)
            .ok_or(Error::NotInitialized)?;

        let fee_manager_id = env
            .storage()
            .instance()
            .get::<_, Address>(&DataKey::FeeManagerContract)
            .ok_or(Error::NotInitialized)?;

        let user_registry_client =
            user_registry_contract::ContractClient::new(&env, &user_registry_contract_id);
        let total_users = user_registry_client.get_total_users();

        let rating_client = rating_contract::ContractClient::new(&env, &rating_contract_id);
        let total_ratings = rating_client.get_total_rating();

        let escrow_client = escrow_contract::EscrowContractClient::new(&env, &escrow_contract_id);
        let total_transactions = escrow_client.get_total_transactions();

        let dispute_client =
            dispute_contract::DisputeResolutionContractClient::new(&env, &dispute_contract_id);
        let total_disputes = dispute_client.get_total_disputes();

        let dispute_client =
            fee_manager_contract::FeeManagerContractClient::new(&env, &fee_manager_id);
        let total_fees_collected = dispute_client.get_total_fees();

        Ok(ContractStats {
            total_users,
            total_transactions,
            total_ratings,
            total_disputes,
            total_fees_collected,
        })
    }
}
