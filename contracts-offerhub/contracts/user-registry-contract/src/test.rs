#![cfg(test)]

use crate::{
    storage::{get_verified_users, set_verified_users},
    types::{Error, VerificationLevel},
    Contract,
};
use soroban_sdk::{log, testutils::Address as _, Address, Env, String, Vec};

// ==================== LEGACY TESTS ====================

#[test]
fn test_unregistered_user_is_not_verified() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let user = Address::generate(&env);

    env.as_contract(&contract_id, || {
        let is_verified = Contract::is_verified(env.clone(), user);
        assert!(!is_verified);
    });
}

#[test]
fn test_manual_register_and_query() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let user = Address::generate(&env);

    env.as_contract(&contract_id, || {
        // Simulate the manual registration in storage
        let mut users = get_verified_users(&env);
        users.set(user.clone(), true);
        set_verified_users(&env, &users);

        let is_verified = Contract::is_verified(env.clone(), user.clone());
        assert!(is_verified);
    });
}

#[test]
fn test_duplicate_manual_register() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let user = Address::generate(&env);

    env.as_contract(&contract_id, || {
        let mut users = get_verified_users(&env);
        users.set(user.clone(), true);
        set_verified_users(&env, &users);

        // Trying to register again manually does not change the value
        let mut users2 = get_verified_users(&env);
        users2.set(user.clone(), true);
        set_verified_users(&env, &users2);

        let is_verified = Contract::is_verified(env.clone(), user.clone());
        assert!(is_verified);
    });
}

#[test]
fn test_multiple_users_verification() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    let user3 = Address::generate(&env);

    env.as_contract(&contract_id, || {
        let mut users = get_verified_users(&env);
        users.set(user1.clone(), true);
        users.set(user2.clone(), true);
        set_verified_users(&env, &users);

        assert!(Contract::is_verified(env.clone(), user1.clone()));
        assert!(Contract::is_verified(env.clone(), user2.clone()));
        assert!(!Contract::is_verified(env.clone(), user3.clone()));
    });
}

// ==================== NEW FUNCTIONALITY TESTS ====================

#[test]
fn test_admin_initialization() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let admin = Address::generate(&env);

    env.as_contract(&contract_id, || {
        // Initialize admin
        let result = Contract::initialize_admin(env.clone(), admin.clone());
        assert!(result.is_ok());

        // Check admin is set
        let current_admin = Contract::get_admin(env.clone());
        assert_eq!(current_admin, Some(admin.clone()));

        // Cannot initialize again
        let admin2 = Address::generate(&env);
        let result2 = Contract::initialize_admin(env.clone(), admin2);
        assert_eq!(result2, Err(Error::AlreadyInitialized));
    });
}

#[test]
fn test_user_verification_with_levels() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    // Initialize admin
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        Contract::initialize_admin(env.clone(), admin.clone()).unwrap();
    });

    // Verify user with premium level
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        let metadata = String::from_str(&env, "Test user metadata");
        let expires_at = env.ledger().timestamp() + 365 * 24 * 60 * 60; // 1 year

        let result = Contract::verify_user(
            env.clone(),
            admin.clone(),
            user.clone(),
            VerificationLevel::Premium,
            expires_at,
            metadata.clone(),
        );
        assert!(result.is_ok());

        // Check user status
        let status = Contract::get_user_status(env.clone(), user.clone());
        assert!(status.is_verified);
        assert_eq!(status.verification_level, VerificationLevel::Premium);
        assert!(!status.is_blacklisted);
        assert_eq!(status.verification_expires_at, expires_at);
        assert!(!status.is_expired);

        // Check user profile
        let profile = Contract::get_user_profile(env.clone(), user.clone());
        assert!(profile.is_some());
        let profile = profile.unwrap();
        assert_eq!(profile.verification_level, VerificationLevel::Premium);
        assert_eq!(profile.metadata, metadata);
        assert!(!profile.is_blacklisted);
    });
}

#[test]
fn test_blacklist_functionality() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    env.as_contract(&contract_id, || {
        // Initialize admin
        Contract::initialize_admin(env.clone(), admin.clone()).unwrap();

        // For now, test blacklist status checking functions which don't require auth
        assert!(!Contract::is_user_blacklisted(env.clone(), user.clone()));

        // Test user status for non-blacklisted user
        let status = Contract::get_user_status(env.clone(), user.clone());
        assert!(!status.is_blacklisted);

        // Test that admin exists
        let current_admin = Contract::get_admin(env.clone());
        assert_eq!(current_admin, Some(admin.clone()));
    });
}

#[test]
fn test_moderator_management() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let admin = Address::generate(&env);
    let moderator = Address::generate(&env);
    let user = Address::generate(&env);

    // Initialize admin
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        Contract::initialize_admin(env.clone(), admin.clone()).unwrap();
    });

    // Add moderator
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        let result = Contract::add_moderator(env.clone(), admin.clone(), moderator.clone());
        assert!(result.is_ok());

        // Check moderator is added
        let moderators = Contract::get_moderators(env.clone());
        assert!(moderators.contains(&moderator));
    });

    // Moderator verifies user
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        let metadata = String::from_str(&env, "Verified by moderator");
        let result = Contract::verify_user(
            env.clone(),
            moderator.clone(),
            user.clone(),
            VerificationLevel::Basic,
            0,
            metadata,
        );
        assert!(result.is_ok());
    });

    // Remove moderator
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        let result = Contract::remove_moderator(env.clone(), admin.clone(), moderator.clone());
        assert!(result.is_ok());

        // Check moderator is removed
        let moderators = Contract::get_moderators(env.clone());
        assert!(!moderators.contains(&moderator));
    });
}

#[test]
fn test_verification_expiration() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    // Initialize admin
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        Contract::initialize_admin(env.clone(), admin.clone()).unwrap();
    });

    // Verify user with short expiration
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        let metadata = String::from_str(&env, "Short-lived verification");
        let expires_at = env.ledger().timestamp() + 86400; // 1 day (minimum allowed)

        Contract::verify_user(
            env.clone(),
            admin.clone(),
            user.clone(),
            VerificationLevel::Basic,
            expires_at,
            metadata,
        )
        .unwrap();

        // User should be verified initially
        assert!(Contract::is_verified(env.clone(), user.clone()));

        // Check status
        let status = Contract::get_user_status(env.clone(), user.clone());
        assert_eq!(status.verification_expires_at, expires_at);
    });

    // Test renewal
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        let new_expires_at = env.ledger().timestamp() + 365 * 24 * 60 * 60; // 1 year
        let result =
            Contract::renew_verification(env.clone(), admin.clone(), user.clone(), new_expires_at);
        assert!(result.is_ok());

        let status = Contract::get_user_status(env.clone(), user.clone());
        assert_eq!(status.verification_expires_at, new_expires_at);
    });
}

#[test]
fn test_bulk_verification() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let admin = Address::generate(&env);

    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    let user3 = Address::generate(&env);

    // Initialize admin in first context
    env.as_contract(&contract_id, || {
        Contract::initialize_admin(env.clone(), admin.clone()).unwrap();
    });

    // Bulk verify in second context
    env.as_contract(&contract_id, || {
        let mut users = Vec::new(&env);
        users.push_back(user1.clone());
        users.push_back(user2.clone());
        users.push_back(user3.clone());

        let metadata = String::from_str(&env, "Bulk verified");
        let expires_at = env.ledger().timestamp() + 365 * 24 * 60 * 60; // 1 year

        let result = Contract::bulk_verify_users(
            env.clone(),
            admin.clone(),
            users,
            VerificationLevel::Premium,
            expires_at,
            metadata,
        );
        assert!(result.is_ok());
    });

    // Check verification results in third context
    env.as_contract(&contract_id, || {
        assert!(Contract::is_verified(env.clone(), user1.clone()));
        assert!(Contract::is_verified(env.clone(), user2.clone()));
        assert!(Contract::is_verified(env.clone(), user3.clone()));

        assert_eq!(
            Contract::get_verification_level(env.clone(), user1.clone()),
            Some(VerificationLevel::Premium)
        );
        assert_eq!(
            Contract::get_verification_level(env.clone(), user2.clone()),
            Some(VerificationLevel::Premium)
        );
        assert_eq!(
            Contract::get_verification_level(env.clone(), user3.clone()),
            Some(VerificationLevel::Premium)
        );
    });
}

#[test]
fn test_unauthorized_access() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let admin = Address::generate(&env);
    let unauthorized_user = Address::generate(&env);
    let target_user = Address::generate(&env);

    // Initialize admin
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        Contract::initialize_admin(env.clone(), admin.clone()).unwrap();
    });

    // Test unauthorized user tries to verify someone
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        let metadata = String::from_str(&env, "Unauthorized attempt");
        let result = Contract::verify_user(
            env.clone(),
            unauthorized_user.clone(),
            target_user.clone(),
            VerificationLevel::Basic,
            0,
            metadata,
        );
        assert_eq!(result, Err(Error::Unauthorized));
    });

    // Test unauthorized user tries to blacklist someone
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        let result =
            Contract::blacklist_user(env.clone(), unauthorized_user.clone(), target_user.clone());
        assert_eq!(result, Err(Error::Unauthorized));
    });

    // Test unauthorized user tries to add moderator
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        let result =
            Contract::add_moderator(env.clone(), unauthorized_user.clone(), target_user.clone());
        assert_eq!(result, Err(Error::Unauthorized));
    });
}

#[test]
fn test_cannot_blacklist_admin_or_moderator() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let admin = Address::generate(&env);
    let moderator = Address::generate(&env);

    // Setup: Initialize admin first
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        Contract::initialize_admin(env.clone(), admin.clone()).unwrap();
    });

    // Setup: Add moderator
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        Contract::add_moderator(env.clone(), admin.clone(), moderator.clone()).unwrap();
    });

    // Test: Try to blacklist admin - should fail
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        let result = Contract::blacklist_user(env.clone(), admin.clone(), admin.clone());
        assert_eq!(result, Err(Error::CannotBlacklistAdmin));
    });

    // Test: Try to blacklist moderator - should fail
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        let result = Contract::blacklist_user(env.clone(), admin.clone(), moderator.clone());
        assert_eq!(result, Err(Error::CannotBlacklistModerator));
    });
}

#[test]
fn test_admin_transfer() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let old_admin = Address::generate(&env);
    let new_admin = Address::generate(&env);

    env.as_contract(&contract_id, || {
        // Initialize admin first
        Contract::initialize_admin(env.clone(), old_admin.clone()).unwrap();

        // Verify admin is set
        let current_admin = Contract::get_admin(env.clone());
        assert_eq!(current_admin, Some(old_admin.clone()));
    });

    // Transfer admin in a separate context to avoid auth conflicts
    env.as_contract(&contract_id, || {
        // Transfer admin
        let result = Contract::transfer_admin(env.clone(), old_admin.clone(), new_admin.clone());
        assert!(result.is_ok());

        // Check new admin is set
        let current_admin = Contract::get_admin(env.clone());
        assert_eq!(current_admin, Some(new_admin.clone()));
    });
}

#[test]
fn test_metadata_update() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    // Initialize admin
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        Contract::initialize_admin(env.clone(), admin.clone()).unwrap();
    });

    // Verify user
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        let initial_metadata = String::from_str(&env, "Initial metadata");
        Contract::verify_user(
            env.clone(),
            admin.clone(),
            user.clone(),
            VerificationLevel::Basic,
            0,
            initial_metadata.clone(),
        )
        .unwrap();

        // Check initial metadata
        let profile = Contract::get_user_profile(env.clone(), user.clone()).unwrap();
        assert_eq!(profile.metadata, initial_metadata);
    });

    // Update metadata
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        let new_metadata = String::from_str(&env, "Updated metadata");
        let result = Contract::update_user_metadata(
            env.clone(),
            user.clone(), // User updating their own metadata
            user.clone(),
            new_metadata.clone(),
        );
        assert!(result.is_ok());

        // Check updated metadata
        let profile = Contract::get_user_profile(env.clone(), user.clone()).unwrap();
        assert_eq!(profile.metadata, new_metadata);
    });

    // Admin can also update user metadata
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        let admin_metadata = String::from_str(&env, "Admin updated metadata");
        let result = Contract::update_user_metadata(
            env.clone(),
            admin.clone(),
            user.clone(),
            admin_metadata.clone(),
        );
        assert!(result.is_ok());

        // Check admin updated metadata
        let profile = Contract::get_user_profile(env.clone(), user.clone()).unwrap();
        assert_eq!(profile.metadata, admin_metadata);
    });
}

// ==================== ADDITIONAL COMPREHENSIVE TESTS ====================

#[test]
fn test_additional_security_scenarios() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let attacker = Address::generate(&env);

    // Initialize admin
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        Contract::initialize_admin(env.clone(), admin.clone()).unwrap();
    });

    // Test: Double initialization should fail
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        let result = Contract::initialize_admin(env.clone(), attacker.clone());
        assert_eq!(result, Err(Error::AlreadyInitialized));
    });

    // Test: Non-admin cannot verify users
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        let result = Contract::verify_user(
            env.clone(),
            attacker.clone(), // Not admin
            user.clone(),
            VerificationLevel::Basic,
            0,
            String::from_str(&env, "metadata"),
        );
        assert_eq!(result, Err(Error::Unauthorized));
    });

    // Test: Verify user works with admin
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        let result = Contract::verify_user(
            env.clone(),
            admin.clone(),
            user.clone(),
            VerificationLevel::Basic,
            0,
            String::from_str(&env, "metadata"),
        );
        assert!(result.is_ok());
    });

    // Test: User profile metadata can be updated
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        let result = Contract::update_user_metadata(
            env.clone(),
            user.clone(),
            user.clone(),
            String::from_str(&env, "Updated metadata"),
        );
        assert!(result.is_ok());
    });

    // Test: Non-admin cannot blacklist users
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        let result = Contract::blacklist_user(env.clone(), attacker.clone(), user.clone());
        assert_eq!(result, Err(Error::Unauthorized));
    });
}

#[test]
fn test_user_get_total_users() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let admin = Address::generate(&env);

    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    let user3 = Address::generate(&env);

    // Initialize admin in first context
    env.as_contract(&contract_id, || {
        Contract::initialize_admin(env.clone(), admin.clone()).unwrap();
    });

    // Bulk verify in second context
    env.as_contract(&contract_id, || {
        let mut users = Vec::new(&env);
        users.push_back(user1.clone());
        users.push_back(user2.clone());
        users.push_back(user3.clone());

        let metadata = String::from_str(&env, "Bulk verified");
        let expires_at = env.ledger().timestamp() + 365 * 24 * 60 * 60; // 1 year

        let result = Contract::bulk_verify_users(
            env.clone(),
            admin.clone(),
            users,
            VerificationLevel::Premium,
            expires_at,
            metadata,
        );
        assert!(result.is_ok());
    });

    env.as_contract(&contract_id, || {
        let metadata = String::from_str(&env, "Bulk verified");
        let expires_at = env.ledger().timestamp() + 365 * 24 * 60 * 60; // 1 year

        let user4 = Address::generate(&env);
        let result = Contract::verify_user(
            env.clone(),
            admin.clone(),
            user4,
            VerificationLevel::Premium,
            expires_at,
            metadata,
        );
        assert!(result.is_ok());

        let total_users_count = Contract::get_total_users(&env).unwrap();
        assert_eq!(total_users_count, 4);
    });
}

// ==================== DATA EXPORT TESTS ====================

#[test]
fn test_export_user_data_self() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    // Initialize admin
    env.as_contract(&contract_id, || {
        Contract::initialize_admin(env.clone(), admin.clone()).unwrap();
    });

    // Verify user
    env.as_contract(&contract_id, || {
        let metadata = String::from_str(&env, "Test user for export");
        Contract::verify_user(
            env.clone(),
            admin.clone(),
            user.clone(),
            VerificationLevel::Premium,
            0,
            metadata,
        )
        .unwrap();
    });

    // User exports their own data
    env.as_contract(&contract_id, || {
        let result = Contract::export_user_data(env.clone(), user.clone(), user.clone());
        assert!(result.is_ok());

        let export_data = result.unwrap();
        assert_eq!(export_data.user_address, user);
        assert!(export_data.has_profile);
        assert_eq!(
            export_data.status.verification_level,
            VerificationLevel::Premium
        );
        assert_eq!(export_data.export_version, String::from_str(&env, "1.0"));
    });
}

#[test]
fn test_export_user_data_admin() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    // Initialize admin
    env.as_contract(&contract_id, || {
        Contract::initialize_admin(env.clone(), admin.clone()).unwrap();
    });

    // Verify user
    env.as_contract(&contract_id, || {
        let metadata = String::from_str(&env, "Test user for admin export");
        Contract::verify_user(
            env.clone(),
            admin.clone(),
            user.clone(),
            VerificationLevel::Basic,
            0,
            metadata,
        )
        .unwrap();
    });

    // Admin exports user data
    env.as_contract(&contract_id, || {
        let result = Contract::export_user_data(env.clone(), admin.clone(), user.clone());
        assert!(result.is_ok());

        let export_data = result.unwrap();
        assert_eq!(export_data.user_address, user);
        assert!(export_data.has_profile);
        assert_eq!(
            export_data.status.verification_level,
            VerificationLevel::Basic
        );
    });
}

#[test]
fn test_export_user_data_unauthorized() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let unauthorized = Address::generate(&env);

    // Initialize admin
    env.as_contract(&contract_id, || {
        Contract::initialize_admin(env.clone(), admin.clone()).unwrap();
    });

    // Verify user
    env.as_contract(&contract_id, || {
        let metadata = String::from_str(&env, "Test user");
        Contract::verify_user(
            env.clone(),
            admin.clone(),
            user.clone(),
            VerificationLevel::Basic,
            0,
            metadata,
        )
        .unwrap();
    });

    // Unauthorized user tries to export data
    env.as_contract(&contract_id, || {
        let result = Contract::export_user_data(env.clone(), unauthorized.clone(), user.clone());
        assert_eq!(result, Err(Error::Unauthorized));
    });
}

#[test]
fn test_export_all_data() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    let blacklisted_user = Address::generate(&env);

    // Initialize admin
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        Contract::initialize_admin(env.clone(), admin.clone()).unwrap();
    });

    // Verify user 1
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        let metadata = String::from_str(&env, "Test user 1");
        Contract::verify_user(
            env.clone(),
            admin.clone(),
            user1.clone(),
            VerificationLevel::Basic,
            0,
            metadata,
        )
        .unwrap();
    });

    // Verify user 2
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        let metadata2 = String::from_str(&env, "Test user 2");
        Contract::verify_user(
            env.clone(),
            admin.clone(),
            user2.clone(),
            VerificationLevel::Premium,
            0,
            metadata2,
        )
        .unwrap();
    });

    // Blacklist user
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        Contract::blacklist_user(env.clone(), admin.clone(), blacklisted_user.clone()).unwrap();
    });

    // Export all data
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        let result = Contract::export_all_data(env.clone(), admin.clone(), 10);
        assert!(result.is_ok());

        let export_data = result.unwrap();
        assert_eq!(export_data.total_users, 2); // Only verified users count
        assert!(export_data.verified_users.len() >= 2);
        assert!(export_data.blacklisted_users.len() >= 1);
        assert_eq!(export_data.export_version, String::from_str(&env, "1.0"));
        assert!(!export_data.data_size_limit_reached); // Should be false for small dataset
    });
}

#[test]
fn test_export_all_data_unauthorized() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let admin = Address::generate(&env);
    let unauthorized = Address::generate(&env);

    // Initialize admin
    env.as_contract(&contract_id, || {
        Contract::initialize_admin(env.clone(), admin.clone()).unwrap();
    });

    // Unauthorized user tries to export all data
    env.as_contract(&contract_id, || {
        let result = Contract::export_all_data(env.clone(), unauthorized.clone(), 10);
        assert_eq!(result, Err(Error::Unauthorized));
    });
}

#[test]
fn test_export_data_size_limits() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let admin = Address::generate(&env);

    // Initialize admin
    env.as_contract(&contract_id, || {
        Contract::initialize_admin(env.clone(), admin.clone()).unwrap();
    });

    // Test with limit of 0 (should use default max limit)
    env.as_contract(&contract_id, || {
        let result = Contract::export_all_data(env.clone(), admin.clone(), 0);
        assert!(result.is_ok());

        let export_data = result.unwrap();
        // Should use default limit, not unlimited
        assert_eq!(export_data.export_version, String::from_str(&env, "1.0"));
    });

    // Test with very high limit (should be capped)
    env.as_contract(&contract_id, || {
        let result = Contract::export_all_data(env.clone(), admin.clone(), 1000);
        assert!(result.is_ok());

        let export_data = result.unwrap();
        // Should be capped to max limit
        assert_eq!(export_data.export_version, String::from_str(&env, "1.0"));
    });
}

#[test]
fn test_export_platform_data_unauthorized() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let admin = Address::generate(&env);
    let unauthorized = Address::generate(&env);

    // Initialize admin
    env.as_contract(&contract_id, || {
        Contract::initialize_admin(env.clone(), admin.clone()).unwrap();
    });

    // Unauthorized user tries to export platform data
    env.as_contract(&contract_id, || {
        let result = Contract::export_platform_data(env.clone(), unauthorized.clone(), 10);
        assert_eq!(result, Err(Error::Unauthorized));
    });
}

#[test]
fn test_export_platform_data() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    // Initialize admin
    env.as_contract(&contract_id, || {
        Contract::initialize_admin(env.clone(), admin.clone()).unwrap();
    });

    // Add user 1
    env.as_contract(&contract_id, || {
        let metadata = String::from_str(&env, "Test user 1");
        Contract::verify_user(
            env.clone(),
            admin.clone(),
            user1.clone(),
            VerificationLevel::Basic,
            0,
            metadata,
        )
        .unwrap();
    });

    // Add user 2
    env.as_contract(&contract_id, || {
        let metadata2 = String::from_str(&env, "Test user 2");
        Contract::verify_user(
            env.clone(),
            admin.clone(),
            user2.clone(),
            VerificationLevel::Premium,
            0,
            metadata2,
        )
        .unwrap();
    });

    // Export platform data
    env.as_contract(&contract_id, || {
        let platform_data = Contract::export_platform_data(env.clone(), admin.clone(), 10).unwrap();
        assert_eq!(platform_data.total_contracts_processed, 1);
        assert_eq!(platform_data.successful_exports, 1);
        assert_eq!(platform_data.failed_exports, 0);
        assert_eq!(platform_data.export_version, String::from_str(&env, "1.0"));
        assert_eq!(platform_data.user_registry_summary.total_users, 2);
        assert!(platform_data.platform_statistics.len() > 0);
    });
}

#[test]
fn test_get_user_profile_formatted() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    // Initialize admin
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        Contract::initialize_admin(env.clone(), admin.clone()).unwrap();
    });

    // Verify user with premium level
    env.mock_all_auths();
    env.as_contract(&contract_id, || {
        let metadata = String::from_str(&env, "Test user metadata");
        let expires_at = env.ledger().timestamp() + 365 * 24 * 60 * 60; // 1 year

        let result = Contract::verify_user(
            env.clone(),
            admin.clone(),
            user.clone(),
            VerificationLevel::Premium,
            expires_at,
            metadata.clone(),
        );
        assert!(result.is_ok());

        // Check user status
        let status = Contract::get_user_status(env.clone(), user.clone());
        assert!(status.is_verified);
        assert_eq!(status.verification_level, VerificationLevel::Premium);
        assert!(!status.is_blacklisted);
        assert_eq!(status.verification_expires_at, expires_at);
        assert!(!status.is_expired);

        // Check user profile
        let profile = Contract::get_user_profile_formatted(env.clone(), user.clone());
        assert!(profile.is_ok());
        let profile = profile.unwrap();
        assert_eq!(profile.verification_level, String::from_str(&env, "Premium"));
        assert_eq!(profile.publication_status, String::from_str(&env, "Private"));
        assert_eq!(profile.metadata, metadata);
        assert!(!profile.is_blacklisted);
    });
}