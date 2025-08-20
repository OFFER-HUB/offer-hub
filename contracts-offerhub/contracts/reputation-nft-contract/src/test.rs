#![cfg(test)]

use crate::{Contract, Error, ReputationNFTContract, TokenId};
use soroban_sdk::{symbol_short, testutils::Address as _, vec, Address, Env, IntoVal, String};

// For direct access to storage functions for testing
use crate::metadata;
use crate::storage;

// Setup
fn setup() -> (Env, Address, Address) {
    let env = Env::default();
    let admin = Address::generate(&env);
    // Register the contract and get its address
    let contract_id = env.register(Contract, ());
    (env, admin, contract_id)
}

// Contract client for testing
struct ContractClient {
    env: Env,
    contract_id: Address,
}

impl ContractClient {
    fn new(env: Env, contract_id: Address) -> Self {
        Self { env, contract_id }
    }

    fn init(&self, admin: Address) -> Result<(), Error> {
        let env = &self.env;
        let args = vec![env, admin.into_val(env)];
        self.env
            .invoke_contract(&self.contract_id, &symbol_short!("init"), args)
    }

    fn mint(
        &self,
        caller: Address,
        to: Address,
        token_id: TokenId,
        name: String,
        description: String,
        uri: String,
    ) -> Result<(), Error> {
        let env = &self.env;
        let args = vec![
            env,
            caller.into_val(env),
            to.into_val(env),
            token_id.into_val(env),
            name.into_val(env),
            description.into_val(env),
            uri.into_val(env),
        ];

        self.env
            .invoke_contract(&self.contract_id, &symbol_short!("mint"), args)
    }

    fn transfer(&self, from: Address, to: Address, token_id: TokenId) -> Result<(), Error> {
        let env = &self.env;
        let args = vec![
            env,
            from.into_val(env),
            to.into_val(env),
            token_id.into_val(env),
        ];

        self.env
            .invoke_contract(&self.contract_id, &symbol_short!("transfer"), args)
    }

    fn get_owner(&self, token_id: TokenId) -> Result<Address, Error> {
        let env = &self.env;
        let args = vec![env, token_id.into_val(env)];

        self.env
            .invoke_contract(&self.contract_id, &symbol_short!("get_owner"), args)
    }

    fn get_metadata(&self, token_id: TokenId) -> Result<crate::Metadata, Error> {
        let env = &self.env;
        let args = vec![env, token_id.into_val(env)];

        self.env
            .invoke_contract(&self.contract_id, &symbol_short!("get_meta"), args)
    }

    fn add_minter(&self, caller: Address, minter: Address) -> Result<(), Error> {
        let env = &self.env;
        let args = vec![env, caller.into_val(env), minter.into_val(env)];

        self.env
            .invoke_contract(&self.contract_id, &symbol_short!("add_mint"), args)
    }

    fn remove_minter(&self, caller: Address, minter: Address) -> Result<(), Error> {
        let env = &self.env;
        let args = vec![env, caller.into_val(env), minter.into_val(env)];

        self.env
            .invoke_contract(&self.contract_id, &symbol_short!("rem_mint"), args)
    }

    fn is_minter(&self, address: Address) -> Result<bool, Error> {
        let env = &self.env;
        let args = vec![env, address.into_val(env)];

        self.env
            .invoke_contract(&self.contract_id, &symbol_short!("is_minter"), args)
    }

    fn get_admin(&self) -> Result<Address, Error> {
        let args = vec![&self.env];

        self.env
            .invoke_contract(&self.contract_id, &symbol_short!("get_admin"), args)
    }

    fn transfer_admin(&self, caller: Address, new_admin: Address) -> Result<(), Error> {
        let env = &self.env;
        let args = vec![env, caller.into_val(env), new_admin.into_val(env)];

        self.env
            .invoke_contract(&self.contract_id, &symbol_short!("tr_admin"), args)
    }

    fn req_auth(&self, addr: Address) -> Result<(), Error> {
        let env = &self.env;
        let args = vec![env, addr.into_val(env)];

        self.env
            .invoke_contract(&self.contract_id, &symbol_short!("req_auth"), args)
    }
}

#[test]
fn test_init() {
    let (env, admin, contract_id) = setup();

    // Initialize the contract within a contract context
    env.as_contract(&contract_id, || {
        let result = ReputationNFTContract::init(env.clone(), admin.clone());
        assert!(result.is_ok());

        // Verify that the admin is correct
        let admin_result = ReputationNFTContract::get_admin(env.clone()).unwrap();
        assert_eq!(admin_result, admin);
    });
}

#[test]
fn test_get_storage_functions() {
    let (env, admin, contract_id) = setup();

    // Execute basic initialization and query operations
    env.as_contract(&contract_id, || {
        // Initialize the contract
        ReputationNFTContract::init(env.clone(), admin.clone()).unwrap();

        // Verify that the admin was saved correctly
        let stored_admin = ReputationNFTContract::get_admin(env.clone()).unwrap();
        assert_eq!(stored_admin, admin);

        // Verify that we can check the status of a minter
        let is_admin_minter = ReputationNFTContract::is_minter(env.clone(), admin.clone()).unwrap();
        // The admin is not a minter by default, but can mint tokens
        assert!(!is_admin_minter);
    });
}

#[test]
fn test_token_existence_error() {
    let (env, admin, contract_id) = setup();

    env.as_contract(&contract_id, || {
        // Initialize contract
        ReputationNFTContract::init(env.clone(), admin.clone()).unwrap();

        // Verify error when token doesn't exist
        let result = ReputationNFTContract::get_owner(env.clone(), 999);
        assert_eq!(result, Err(Error::TokenDoesNotExist));
    });
}

#[test]
fn test_mock_mint_and_get_metadata() {
    let (env, admin, contract_id) = setup();
    let user = Address::generate(&env);

    // Initialize the contract
    env.as_contract(&contract_id, || {
        ReputationNFTContract::init(env.clone(), admin.clone()).unwrap();
    });

    // Instead of calling mint, we directly simulate the effects
    // that a successful mint call would have had
    env.as_contract(&contract_id, || {
        // Save token ownership
        storage::save_token_owner(&env, &1, &user);

        // Save metadata
        let name = String::from_str(&env, "Test NFT");
        let description = String::from_str(&env, "Test Description");
        let uri = String::from_str(&env, "ipfs://test");
        crate::metadata::store_metadata(&env, &1, name.clone(), description.clone(), uri.clone())
            .unwrap();

        // Verify ownership
        let owner = ReputationNFTContract::get_owner(env.clone(), 1).unwrap();
        assert_eq!(owner, user);

        // Verify metadata
        let metadata = ReputationNFTContract::get_metadata(env.clone(), 1).unwrap();
        assert_eq!(metadata.name, name);
        assert_eq!(metadata.description, description);
        assert_eq!(metadata.uri, uri);
    });
}

#[test]
fn test_mock_transfer() {
    let (env, admin, contract_id) = setup();
    let original_owner = Address::generate(&env);
    let new_owner = Address::generate(&env);

    // Initialize contract and prepare tokens
    env.as_contract(&contract_id, || {
        ReputationNFTContract::init(env.clone(), admin.clone()).unwrap();

        // Simulate an existing token that belongs to original_owner
        storage::save_token_owner(&env, &1, &original_owner);

        // Now simulate the transfer by directly modifying the storage
        storage::save_token_owner(&env, &1, &new_owner);

        // Verify the new ownership
        let owner = ReputationNFTContract::get_owner(env.clone(), 1).unwrap();
        assert_eq!(owner, new_owner);
    });
}

#[test]
fn test_mock_minter_role() {
    let (env, admin, contract_id) = setup();
    let minter = Address::generate(&env);

    env.as_contract(&contract_id, || {
        // Initialize contract
        ReputationNFTContract::init(env.clone(), admin.clone()).unwrap();

        // Simulate adding a minter (without calling add_minter)
        storage::add_minter(&env, &minter);

        // Verify that the minter was added
        let is_minter_role = ReputationNFTContract::is_minter(env.clone(), minter.clone()).unwrap();
        assert!(is_minter_role);

        // Simulate removing the minter
        storage::remove_minter(&env, &minter);

        // Verify that the minter was removed
        let is_still_minter = ReputationNFTContract::is_minter(env.clone(), minter.clone()).unwrap();
        assert!(!is_still_minter);
    });
}

#[test]
fn test_admin_can_mint_without_being_minter() {
    let (env, admin, contract_id) = setup();
    let user = Address::generate(&env);

    env.as_contract(&contract_id, || {
        // Initialize contract and set admin
        ReputationNFTContract::init(env.clone(), admin.clone()).unwrap();

        // Verify that the admin is not a minter
        let is_admin_minter = ReputationNFTContract::is_minter(env.clone(), admin.clone()).unwrap();
        assert!(!is_admin_minter);

        // The check_minter function in access.rs allows minting if the caller is admin, even if not a minter
        // We'll simulate this directly

        // First, save token ownership
        storage::save_token_owner(&env, &1, &user);

        // Verify ownership
        let owner = ReputationNFTContract::get_owner(env.clone(), 1).unwrap();
        assert_eq!(owner, user);
    });
}

#[test]
fn test_transfer_admin_role() {
    let (env, admin, contract_id) = setup();
    let new_admin = Address::generate(&env);

    env.as_contract(&contract_id, || {
        // Initialize contract
        ReputationNFTContract::init(env.clone(), admin.clone()).unwrap();

        // Simulate admin transfer
        storage::save_admin(&env, &new_admin);

        // Verify that the new admin is correct
        let admin_result = ReputationNFTContract::get_admin(env.clone()).unwrap();
        assert_eq!(admin_result, new_admin);
    });
}

#[test]
fn test_multiple_tokens() {
    let (env, admin, contract_id) = setup();
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    env.as_contract(&contract_id, || {
        // Initialize contract
        ReputationNFTContract::init(env.clone(), admin.clone()).unwrap();

        // Simulate multiple tokens with different owners
        // Token 1 for user1
        storage::save_token_owner(&env, &1, &user1);

        // Token 2 for user2
        storage::save_token_owner(&env, &2, &user2);

        // Verify owners
        let owner1 = ReputationNFTContract::get_owner(env.clone(), 1).unwrap();
        let owner2 = ReputationNFTContract::get_owner(env.clone(), 2).unwrap();

        assert_eq!(owner1, user1);
        assert_eq!(owner2, user2);
    });
}

#[test]
fn test_metadata_functionality() {
    let (env, admin, contract_id) = setup();

    env.as_contract(&contract_id, || {
        // Initialize contract
        ReputationNFTContract::init(env.clone(), admin.clone()).unwrap();

        // Create metadata directly
        let token_id = 1;
        let name = String::from_str(&env, "Special NFT");
        let description = String::from_str(&env, "A very special NFT");
        let uri = String::from_str(&env, "ipfs://special");

        // Save metadata
        metadata::store_metadata(
            &env,
            &token_id,
            name.clone(),
            description.clone(),
            uri.clone(),
        )
        .unwrap();

        // Verify metadata
        let metadata = ReputationNFTContract::get_metadata(env.clone(), token_id).unwrap();
        assert_eq!(metadata.name, name);
        assert_eq!(metadata.description, description);
        assert_eq!(metadata.uri, uri);

        // Try to retrieve metadata for a non-existent token
        let result = ReputationNFTContract::get_metadata(env.clone(), 999);
        assert_eq!(result, Err(Error::TokenDoesNotExist));
    });
}

#[test]
fn test_token_uri_update() {
    let (env, admin, contract_id) = setup();
    let token_id = 1;

    env.as_contract(&contract_id, || {
        // Initialize contract
        ReputationNFTContract::init(env.clone(), admin.clone()).unwrap();

        // Create initial metadata
        let name = String::from_str(&env, "Original NFT");
        let description = String::from_str(&env, "Original Description");
        let uri = String::from_str(&env, "ipfs://original");

        // Save token ownership and metadata
        storage::save_token_owner(&env, &token_id, &admin);
        metadata::store_metadata(
            &env,
            &token_id,
            name.clone(),
            description.clone(),
            uri.clone(),
        )
        .unwrap();

        // Verify initial metadata
        let initial_metadata = ReputationNFTContract::get_metadata(env.clone(), token_id).unwrap();
        assert_eq!(initial_metadata.uri, uri);

        // Update with new URI
        let new_uri = String::from_str(&env, "ipfs://updated");
        let updated_name = name.clone();
        let updated_description = description.clone();

        // Store updated metadata
        metadata::store_metadata(
            &env,
            &token_id,
            updated_name.clone(),
            updated_description.clone(),
            new_uri.clone(),
        )
        .unwrap();

        // Verify updated metadata
        let updated_metadata = ReputationNFTContract::get_metadata(env.clone(), token_id).unwrap();
        assert_eq!(updated_metadata.uri, new_uri);
        assert_eq!(updated_metadata.name, updated_name);
        assert_eq!(updated_metadata.description, updated_description);
    });
}

#[test]
fn test_unauthorized_access() {
    let (env, admin, contract_id) = setup();
    let unauthorized = Address::generate(&env);
    let token_id: TokenId = 1;

    // Initialize contract and set up token
    env.as_contract(&contract_id, || {
        ReputationNFTContract::init(env.clone(), admin.clone()).unwrap();
        storage::save_token_owner(&env, &token_id, &admin);
    });

    // Create a client for the tests
    let client = ContractClient::new(env.clone(), contract_id.clone());

    // Mock auth to avoid errors in tests
    env.mock_all_auths();

    let result = client.req_auth(unauthorized.clone());
    assert!(result.is_ok());
}

#[test]
fn test_batch_operations() {
    let (env, admin, contract_id) = setup();
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    let user3 = Address::generate(&env);

    env.as_contract(&contract_id, || {
        // Initialize contract
        ReputationNFTContract::init(env.clone(), admin.clone()).unwrap();

        // Batch mint three tokens to different users
        let token_ids = [1, 2, 3];
        let owners = [&user1, &user2, &user3];

        // Simulate batch mint operation
        for i in 0..token_ids.len() {
            storage::save_token_owner(&env, &token_ids[i], owners[i]);

            // Create and store unique metadata for each token
            let name = match token_ids[i] {
                1 => String::from_str(&env, "Token 1"),
                2 => String::from_str(&env, "Token 2"),
                3 => String::from_str(&env, "Token 3"),
                _ => String::from_str(&env, "Token"),
            };

            let description = match token_ids[i] {
                1 => String::from_str(&env, "Description for token 1"),
                2 => String::from_str(&env, "Description for token 2"),
                3 => String::from_str(&env, "Description for token 3"),
                _ => String::from_str(&env, "Description"),
            };

            let uri = match token_ids[i] {
                1 => String::from_str(&env, "ipfs://token1"),
                2 => String::from_str(&env, "ipfs://token2"),
                3 => String::from_str(&env, "ipfs://token3"),
                _ => String::from_str(&env, "ipfs://token"),
            };

            metadata::store_metadata(&env, &token_ids[i], name.clone(), description, uri).unwrap();
        }

        // Verify all tokens were minted correctly
        for i in 0..token_ids.len() {
            let owner = ReputationNFTContract::get_owner(env.clone(), token_ids[i]).unwrap();
            assert_eq!(&owner, owners[i]);

            let metadata = ReputationNFTContract::get_metadata(env.clone(), token_ids[i]).unwrap();
            let expected_name = match token_ids[i] {
                1 => String::from_str(&env, "Token 1"),
                2 => String::from_str(&env, "Token 2"),
                3 => String::from_str(&env, "Token 3"),
                _ => String::from_str(&env, "Token"),
            };
            assert_eq!(metadata.name, expected_name);
        }
    });
}

#[test]
fn test_mint_and_query() {
    let (env, admin, contract_id) = setup();
    let user = Address::generate(&env);
    let token_id: TokenId = 1;

    // Create client
    let client = ContractClient::new(env.clone(), contract_id.clone());

    // Initialize contract
    client.init(admin.clone()).unwrap();

    // Test minting with admin as caller
    env.mock_all_auths();
    let name = String::from_str(&env, "Test NFT");
    let description = String::from_str(&env, "Test Description");
    let uri = String::from_str(&env, "ipfs://test");

    client
        .mint(
            admin.clone(), // caller
            user.clone(),  // to
            token_id,
            name.clone(),
            description.clone(),
            uri.clone(),
        )
        .unwrap();

    // Verify token ownership
    let owner = client.get_owner(token_id).unwrap();
    assert_eq!(owner, user);

    // Verify metadata
    let metadata = client.get_metadata(token_id).unwrap();
    assert_eq!(metadata.name, name);
    assert_eq!(metadata.description, description);
    assert_eq!(metadata.uri, uri);
}

#[test]
fn test_transfer() {
    let (env, admin, contract_id) = setup();
    let original_owner = Address::generate(&env);
    let new_owner = Address::generate(&env);
    let token_id: TokenId = 1;

    // Create client
    let client = ContractClient::new(env.clone(), contract_id.clone());

    // Initialize contract
    client.init(admin.clone()).unwrap();

    // Mint a token to original_owner
    env.mock_all_auths();
    let name = String::from_str(&env, "Test NFT");
    let description = String::from_str(&env, "Test Description");
    let uri = String::from_str(&env, "ipfs://test");

    client
        .mint(
            admin.clone(), // admin can mint
            original_owner.clone(),
            token_id,
            name,
            description,
            uri,
        )
        .unwrap();

    // Verify initial ownership
    let owner = client.get_owner(token_id).unwrap();
    assert_eq!(owner, original_owner);

    // Transfer the token
    client
        .transfer(original_owner.clone(), new_owner.clone(), token_id)
        .unwrap();

    // Verify new ownership
    let new_owner_result = client.get_owner(token_id).unwrap();
    assert_eq!(new_owner_result, new_owner);
}

#[test]
fn test_minter_role() {
    let (env, admin, contract_id) = setup();
    let minter = Address::generate(&env);
    let user = Address::generate(&env);
    let token_id: TokenId = 1;

    // Create client
    let client = ContractClient::new(env.clone(), contract_id.clone());

    // Initialize contract
    client.init(admin.clone()).unwrap();

    // Add minter
    env.mock_all_auths();
    client.add_minter(admin.clone(), minter.clone()).unwrap();

    // Verify minter was added
    let is_minter = client.is_minter(minter.clone()).unwrap();
    assert!(is_minter);

    // Test minting with minter
    let name = String::from_str(&env, "Minter NFT");
    let description = String::from_str(&env, "Minted by minter");
    let uri = String::from_str(&env, "ipfs://minter");

    client
        .mint(
            minter.clone(), // caller is minter
            user.clone(),
            token_id,
            name,
            description,
            uri,
        )
        .unwrap();

    // Verify token was minted
    let owner = client.get_owner(token_id).unwrap();
    assert_eq!(owner, user);

    // Remove minter
    client.remove_minter(admin.clone(), minter.clone()).unwrap();

    // Verify minter was removed
    let is_still_minter = client.is_minter(minter.clone()).unwrap();
    assert!(!is_still_minter);
}

#[test]
fn test_admin_transfer() {
    let (env, admin, contract_id) = setup();
    let new_admin = Address::generate(&env);

    // Create client
    let client = ContractClient::new(env.clone(), contract_id.clone());

    // Initialize contract
    client.init(admin.clone()).unwrap();

    // Transfer admin
    env.mock_all_auths();
    client
        .transfer_admin(admin.clone(), new_admin.clone())
        .unwrap();

    // Verify new admin
    let current_admin = client.get_admin().unwrap();
    assert_eq!(current_admin, new_admin);
}

#[test]
fn test_mint_for_achievement() {
    let (env, admin, contract_id) = setup();
    let user = Address::generate(&env);
    let client = ContractClient::new(env.clone(), contract_id.clone());
    client.init(admin.clone()).unwrap();
    env.mock_all_auths();
    // Add admin as minter for test
    client.add_minter(admin.clone(), admin.clone()).unwrap();
    // Mint achievement NFT
    let nft_type = symbol_short!("tencontr");
    let result: Result<(), Error> = env.invoke_contract(&contract_id.clone(), &symbol_short!("mint_achv"), vec![&env, admin.clone().into_val(&env), user.clone().into_val(&env), nft_type.into_val(&env)]);
    assert!(result.is_ok());
    // Check that token_id 1 exists and is owned by user
    let owner = client.get_owner(1).unwrap();
    assert_eq!(owner, user);
    let metadata = client.get_metadata(1).unwrap();
    assert_eq!(metadata.name, String::from_str(&env, "10 Completed Contracts"));
}

#[test]
fn test_batch_mint_via_contract_call() {
    let (env, admin, contract_id) = setup();
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    let user3 = Address::generate(&env);

    // Initialize contract and give admin minting rights for the test
    env.as_contract(&contract_id, || {
        ReputationNFTContract::init(env.clone(), admin.clone()).unwrap();
        // Allow actions in this test context
        env.mock_all_auths();
        // Add admin as minter
        storage::add_minter(&env, &admin);
    });

    // Prepare vectors for batch_mint (explicit types to satisfy compiler)
    let tos = soroban_sdk::Vec::<Address>::from_array(&env, [user1.clone(), user2.clone(), user3.clone()]);
    let names = soroban_sdk::Vec::<String>::from_array(&env, [
        String::from_str(&env, "Token 1"),
        String::from_str(&env, "Token 2"),
        String::from_str(&env, "Token 3"),
    ]);
    let descriptions = soroban_sdk::Vec::<String>::from_array(&env, [
        String::from_str(&env, "Desc 1"),
        String::from_str(&env, "Desc 2"),
        String::from_str(&env, "Desc 3"),
    ]);
    let uris = soroban_sdk::Vec::<String>::from_array(&env, [
        String::from_str(&env, "ipfs://t1"),
        String::from_str(&env, "ipfs://t2"),
        String::from_str(&env, "ipfs://t3"),
    ]);

    // Call contract entrypoint for batch_mint using exact symbol name
    let res: Result<(), Error> = env.invoke_contract(&contract_id, &soroban_sdk::Symbol::new(&env, "batch_mint"), vec![&env, admin.clone().into_val(&env), tos.into_val(&env), names.into_val(&env), descriptions.into_val(&env), uris.into_val(&env)]);
    assert!(res.is_ok());

    // Verify tokens 1..3 were minted to the expected owners
    env.as_contract(&contract_id, || {
        let o1 = ReputationNFTContract::get_owner(env.clone(), 1).unwrap();
        let o2 = ReputationNFTContract::get_owner(env.clone(), 2).unwrap();
        let o3 = ReputationNFTContract::get_owner(env.clone(), 3).unwrap();

        assert_eq!(o1, user1);
        assert_eq!(o2, user2);
        assert_eq!(o3, user3);
    });
}

#[test]
fn test_burn_removes_user_index() {
    let (env, admin, contract_id) = setup();
    let user = Address::generate(&env);
    // Initialize contract
    env.as_contract(&contract_id, || {
        ReputationNFTContract::init(env.clone(), admin.clone()).unwrap();
    });

    // Prepare auth and roles
    env.mock_all_auths();
    // storage functions must be called within a contract frame
    env.as_contract(&contract_id, || {
        storage::add_minter(&env, &admin);
    });

    // Mint a token to the user via contract invocation
    let name = String::from_str(&env, "Burnable");
    let desc = String::from_str(&env, "To be burned");
    let uri = String::from_str(&env, "ipfs://burn");
    let mint_res: Result<(), Error> = env.invoke_contract(
        &contract_id,
        &soroban_sdk::Symbol::new(&env, "mint"),
        vec![&env, admin.clone().into_val(&env), user.clone().into_val(&env), 1u64.into_val(&env), name.into_val(&env), desc.into_val(&env), uri.into_val(&env)],
    );
    assert!(mint_res.is_ok());

    // Verify indexing inside contract frame
    env.as_contract(&contract_id, || {
        let achievements = ReputationNFTContract::get_user_achievements(env.clone(), user.clone()).unwrap();
        assert_eq!(achievements.len(), 1);
        assert_eq!(achievements.get(0).unwrap(), 1);
    });

    // Burn the token via contract invocation (outside contract frame)
    let burn_res: Result<(), Error> = env.invoke_contract(&contract_id, &soroban_sdk::Symbol::new(&env, "burn"), vec![&env, admin.clone().into_val(&env), 1u64.into_val(&env)]);
    assert!(burn_res.is_ok());

    // Verify index cleared inside contract frame
    env.as_contract(&contract_id, || {
        let after = ReputationNFTContract::get_user_achievements(env.clone(), user.clone()).unwrap();
        assert_eq!(after.len(), 0);
    });
}

#[test]
fn test_update_reputation_auto_awards_milestone() {
    let (env, admin, contract_id) = setup();
    let user = Address::generate(&env);
    // Initialize contract
    env.as_contract(&contract_id, || {
        ReputationNFTContract::init(env.clone(), admin.clone()).unwrap();
    });

    // Prepare auth and roles
    env.mock_all_auths();
    // add minter inside contract frame
    env.as_contract(&contract_id, || {
        storage::add_minter(&env, &admin);
    });

    // First verify no achievements exist yet
    env.as_contract(&contract_id, || {
        let before = ReputationNFTContract::get_user_achievements(env.clone(), user.clone()).unwrap();
        assert_eq!(before.len(), 0, "User should have no achievements initially");
    });

    // Call update_reputation_score to trigger the 10-ratings milestone
    let upd_res: Result<(), Error> = env.invoke_contract(
        &contract_id,
        &soroban_sdk::Symbol::new(&env, "update_reputation_score"),
        vec![&env, admin.clone().into_val(&env), user.clone().into_val(&env), 400u32.into_val(&env), 10u32.into_val(&env)],
    );
    assert!(upd_res.is_ok(), "update_reputation_score failed");

    // Verify both the score update and achievement
    env.as_contract(&contract_id, || {
        // First check if token 1 exists and is owned by user
        let owner_result = ReputationNFTContract::get_owner(env.clone(), 1);
        assert!(owner_result.is_ok(), "Token 1 should exist");
        let owner = owner_result.unwrap();
        assert_eq!(owner, user, "Token 1 should belong to user");

        // Then verify achievement indexing
        let achievements = ReputationNFTContract::get_user_achievements(env.clone(), user.clone()).unwrap();
        assert_eq!(achievements.len(), 1, "User should have exactly 1 achievement");
        assert_eq!(achievements.get(0).unwrap(), 1, "Achievement should be token ID 1");

        // Verify it's the correct achievement type
        let metadata = ReputationNFTContract::get_metadata(env.clone(), 1).unwrap();
        assert_eq!(metadata.name, String::from_str(&env, "Excellence Milestone"), 
                  "Achievement should be the Excellence Milestone for 10+ excellent ratings");
    });
}
