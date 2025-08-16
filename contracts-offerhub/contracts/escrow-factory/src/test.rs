#![cfg(test)]
use soroban_sdk::{testutils::Address as _, Address, BytesN, Env};

use rand::rngs::OsRng;
use rand::RngCore;

use crate::escrow_contract;
use crate::types::EscrowCreateParams;
use crate::EscrowFactory;
use crate::EscrowFactoryClient;

fn gen_random_bytes<const N: usize>(env: &Env) -> BytesN<N> {
    let mut rng = OsRng;
    let mut random_bytes = [0u8; N];
    rng.try_fill_bytes(&mut random_bytes)
        .expect("unable to fill bytes");

    BytesN::from_array(env, &random_bytes)
}

const WASM: &[u8] =
    include_bytes!("../../../target/wasm32-unknown-unknown/release/escrow_contract.wasm");

#[test]
fn test_deploy() {
    let env = Env::default();

    env.mock_all_auths();

    let wasm_hash = env.deployer().upload_contract_wasm(WASM);

    let contract_id = env.register(EscrowFactory, (&wasm_hash,));
    let client = EscrowFactoryClient::new(&env, &contract_id);

    let create_params = EscrowCreateParams {
        client: Address::generate(&env),
        freelancer: Address::generate(&env),
        amount: 1000,
        fee_manager: Address::generate(&env),
        salt: gen_random_bytes::<32>(&env),
    };

    let escrow_address = client.deploy_new_escrow(&create_params);

    let escrow_client = escrow_contract::Client::new(&env, &escrow_address);

    let escrow_data = escrow_client.get_escrow_data();

    assert_eq!(escrow_data.freelancer, create_params.freelancer);
    assert_eq!(escrow_data.client, create_params.client);
    assert_eq!(escrow_data.amount, create_params.amount);
    assert_eq!(escrow_data.fee_manager, create_params.fee_manager);
}
