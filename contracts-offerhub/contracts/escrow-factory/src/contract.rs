use crate::error::handle_error;
use crate::escrow_contract;
use crate::storage;
use crate::types::{
    EscrowCreateParams, MilestoneCreateParams, MilestoneCreateResult, MilestoneParams,
};

use crate::{error::Error, types::DisputeParams};
use soroban_sdk::BytesN;
use soroban_sdk::{Address, Env, Vec};

const MAX_BATCH_SIZE: u32 = 100;

pub fn upload_escrow_wasm(env: Env, wasm_hash: BytesN<32>) {
    storage::store_escrow_wasm(&env, wasm_hash);
}

pub fn deploy_new_escrow(env: Env, create_params: EscrowCreateParams) -> Address {
    // Validate amount is positive
    if create_params.amount <= 0 {
        handle_error(&env, Error::InvalidAmountSet)
    }

    // Validate addresses are distinct
    if create_params.client == create_params.freelancer {
        handle_error(&env, Error::AddressesShouldNotMatch)
    }

    let wasm_hash = storage::get_escrow_wasm(&env);

    if wasm_hash.is_none() {
        handle_error(&env, Error::WasmKeyError)
    }

    let next_escrow_id = storage::next_escrow_id(&env);

    // Deploy escrow
    let escrow_address = env
        .deployer()
        .with_current_contract(create_params.salt)
        .deploy_v2(wasm_hash.unwrap(), ());

    // Initialize escrow
    let escrow_client = escrow_contract::Client::new(&env, &escrow_address);
    escrow_client.init_contract(
        &create_params.client,
        &create_params.freelancer,
        &create_params.amount,
        &create_params.fee_manager,
    );

    storage::store_escrow(&env, &next_escrow_id, &escrow_address);
    storage::set_next_escrow_id(&env, next_escrow_id + 1);

    escrow_address
}

pub fn batch_deploy(env: Env, params: Vec<EscrowCreateParams>) -> Vec<Address> {
    if params.len() > MAX_BATCH_SIZE {
        handle_error(&env, Error::BatchSizeExceeded)
    }

    let mut deployed_escrows = Vec::new(&env);

    for create_params in params.iter() {
        let escrow_address = deploy_new_escrow(env.clone(), create_params);
        deployed_escrows.push_back(escrow_address);
    }

    deployed_escrows
}

pub fn batch_deposit_funds(env: Env, escrow_ids: Vec<u32>, client: Address) {
    client.require_auth();

    for escrow_id in escrow_ids.iter() {
        let escrow_address = storage::escrow_addr_by_id(&env, escrow_id);

        if escrow_address.is_none() {
            handle_error(&env, Error::EscrowIdNotFoundError);
        }

        let escrow_address = escrow_address.unwrap();

        let escrow_client = escrow_contract::Client::new(&env, &escrow_address);
        escrow_client.deposit_funds(&client);
    }
}

pub fn batch_release_funds(env: Env, escrow_ids: Vec<u32>, freelancer: Address) {
    freelancer.require_auth();

    for escrow_id in escrow_ids.iter() {
        let escrow_address = storage::escrow_addr_by_id(&env, escrow_id);

        if escrow_address.is_none() {
            handle_error(&env, Error::EscrowIdNotFoundError);
        }

        let escrow_address = escrow_address.unwrap();

        let escrow_client = escrow_contract::Client::new(&env, &escrow_address);
        escrow_client.release_funds(&freelancer);
    }
}

pub fn batch_create_disputes(env: Env, escrow_ids: Vec<u32>, caller: Address) {
    caller.require_auth();

    for escrow_id in escrow_ids.iter() {
        let escrow_address = storage::escrow_addr_by_id(&env, escrow_id);

        if escrow_address.is_none() {
            handle_error(&env, Error::EscrowIdNotFoundError);
        }

        let escrow_address = escrow_address.unwrap();

        let escrow_client = escrow_contract::Client::new(&env, &escrow_address);
        escrow_client.dispute(&caller);
    }
}

pub fn batch_resolve_disputes(env: Env, caller: Address, dispute_params: Vec<DisputeParams>) {
    caller.require_auth();

    for param in dispute_params.iter() {
        let escrow_address = storage::escrow_addr_by_id(&env, param.escrow_id);

        if escrow_address.is_none() {
            handle_error(&env, Error::EscrowIdNotFoundError);
        }

        let escrow_address = escrow_address.unwrap();

        let escrow_client = escrow_contract::Client::new(&env, &escrow_address);
        escrow_client.resolve_dispute(&caller, &param.result);
    }
}

pub fn batch_add_milestones(
    env: Env,
    milestone_create_params: Vec<MilestoneCreateParams>,
    client: Address,
) -> Vec<MilestoneCreateResult> {
    client.require_auth();

    let mut milestone_create_results = Vec::new(&env);

    for param in milestone_create_params.iter() {
        let escrow_address = storage::escrow_addr_by_id(&env, param.escrow_id);

        if escrow_address.is_none() {
            handle_error(&env, Error::EscrowIdNotFoundError);
        }

        let escrow_address = escrow_address.unwrap();

        let escrow_client = escrow_contract::Client::new(&env, &escrow_address);
        let milestone_id = escrow_client.add_milestone(&client, &param.desc, &param.amount);

        let result = MilestoneCreateResult {
            escrow_id: param.escrow_id,
            milestone_id,
        };

        milestone_create_results.push_back(result);
    }

    milestone_create_results
}

pub fn batch_approve_milestones(env: Env, milestone_params: Vec<MilestoneParams>, client: Address) {
    client.require_auth();

    for param in milestone_params.iter() {
        let escrow_address = storage::escrow_addr_by_id(&env, param.escrow_id);

        if escrow_address.is_none() {
            handle_error(&env, Error::EscrowIdNotFoundError);
        }

        let escrow_address = escrow_address.unwrap();

        let escrow_client = escrow_contract::Client::new(&env, &escrow_address);
        escrow_client.approve_milestone(&client, &param.milestone_id);
    }
}

pub fn batch_release_milestones(
    env: Env,
    milestone_params: Vec<MilestoneParams>,
    freelancer: Address,
) {
    freelancer.require_auth();

    for param in milestone_params.iter() {
        let escrow_address = storage::escrow_addr_by_id(&env, param.escrow_id);

        if escrow_address.is_none() {
            handle_error(&env, Error::EscrowIdNotFoundError);
        }

        let escrow_address = escrow_address.unwrap();

        let escrow_client = escrow_contract::Client::new(&env, &escrow_address);
        escrow_client.release_milestone(&freelancer, &param.milestone_id);
    }
}

pub fn batch_archive_escrows(env: Env, escrow_ids: Vec<u32>) -> Vec<u32> {
    let mut archived_escrows = Vec::new(&env);

    for escrow_id in escrow_ids.iter() {
        let escrow_address = storage::escrow_addr_by_id(&env, escrow_id);

        if escrow_address.is_none() {
            handle_error(&env, Error::EscrowIdNotFoundError);
        }

        let escrow_address = escrow_address.unwrap();

        let escrow_client = escrow_contract::Client::new(&env, &escrow_address);
        let escrow_data = escrow_client.get_escrow_data();

        if escrow_data.status == escrow_contract::EscrowStatus::Released {
            archived_escrows.push_back(escrow_id.clone());
            storage::archive_escrow(&env, escrow_id, escrow_address);
        }
    }

    archived_escrows
}

pub fn batch_check_escrow_status(
    env: Env,
    escrow_ids: Vec<u32>,
) -> Vec<escrow_contract::EscrowStatus> {
    let mut escrow_statuses = Vec::new(&env);

    for escrow_id in escrow_ids.iter() {
        let escrow_address = storage::escrow_addr_by_id(&env, escrow_id);

        if escrow_address.is_none() {
            handle_error(&env, Error::EscrowIdNotFoundError);
        }

        let escrow_address = escrow_address.unwrap();

        let escrow_client = escrow_contract::Client::new(&env, &escrow_address);
        let escrow_data = escrow_client.get_escrow_data();
        escrow_statuses.push_back(escrow_data.status);
    }

    escrow_statuses
}

pub fn batch_get_escrow_information(
    env: Env,
    escrow_ids: Vec<u32>,
) -> Vec<escrow_contract::EscrowData> {
    let mut escrows = Vec::new(&env);

    for escrow_id in escrow_ids.iter() {
        let escrow_address = storage::escrow_addr_by_id(&env, escrow_id);

        if escrow_address.is_none() {
            handle_error(&env, Error::EscrowIdNotFoundError);
        }

        let escrow_address = escrow_address.unwrap();

        let escrow_client = escrow_contract::Client::new(&env, &escrow_address);
        let escrow_data = escrow_client.get_escrow_data();
        escrows.push_back(escrow_data);
    }

    escrows
}

pub fn get_escrow_id_by_address(env: Env, escrow_address: Address) -> Option<u32> {
    storage::escrow_id_by_addr(&env, &escrow_address)
}

pub fn is_archived(env: Env, escrow_id: Option<u32>, escrow_address: Option<Address>) -> bool {
    if let Some(id) = escrow_id {
        return storage::is_archived(&env, id);
    }

    if let Some(addr) = escrow_address {
        if let Some(id) = storage::escrow_id_by_addr(&env, &addr) {
            return storage::is_archived(&env, id);
        }
        handle_error(&Env::default(), Error::EscrowIdNotFoundError);
    }

    handle_error(&Env::default(), Error::EscrowInfoNotSet)
}
