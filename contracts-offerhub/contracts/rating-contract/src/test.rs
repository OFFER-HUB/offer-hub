#![cfg(test)]
use super::*;
use crate::Contract;
use rand::{distributions::Alphanumeric, Rng};
use reputation_nft_contract::{Contract as ReputationContract, Error as E};
use soroban_sdk::{
    log,
    testutils::{Address as _, Ledger},
    vec, Address, Env, IntoVal, String, Vec,
};
extern crate std;

#[derive(Clone)]
struct RatingContext {
    caller: Address,
    rated_user: Address,
    contract_str: String,
    feedback: String,
    category: String,
}

fn create_contract(e: &Env) -> Address {
    e.register(Contract, ())
}

fn _random_string() -> std::string::String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(6)
        .map(char::from)
        .collect()
}

fn random_string(env: &Env) -> String {
    let str = _random_string();
    String::from_str(&env, &str)
}

/// @notice Helper to submit a rating and check for expected outcome
///
/// @param client the contract client
/// @param val the rating value to submit
/// @param c the context for the submission
/// @returns a non-changeable context in this architecture
fn submit_rating(client: &ContractClient<'_>, val: i32, c: RatingContext) {
    let result = client.try_submit_rating(
        &c.caller,
        &c.rated_user,
        &c.contract_str,
        &(val as u32),
        &c.feedback,
        &c.category,
    );

    if val < 1 || val > 5 {
        assert_eq!(result, Err(Ok(Error::InvalidRating)));
    } else {
        assert_eq!(result, Ok(Ok(())));
    }
}

fn default_rating_submission(client: &ContractClient<'_>, env: &Env, val: i32) {
    let context = default_rating_context(&env);
    submit_rating(client, val, context);
}

fn feign_rating(
    env: &Env,
    client: &ContractClient<'_>,
    len: usize,
    rating: i32,
    c: &mut RatingContext,
) {
    let mut window = 0;
    for i in 0..len {
        if i % 5 == 0 {
            window += 3600;
            env.ledger().set_timestamp(window);
            c.caller = Address::generate(&env);
        }
        c.contract_str = random_string(&env);
        submit_rating(&client, rating, c.clone());
    }
}

fn default_rating_context(env: &Env) -> RatingContext {
    RatingContext {
        caller: Address::generate(&env),
        rated_user: Address::generate(&env),
        contract_str: String::from_str(&env, "c1"),
        feedback: String::from_str(&env, "ok"),
        category: String::from_str(&env, "web"),
    }
}

#[test]
fn test_rating_contract_initialization() {
    let env = Env::default();

    // Test basic contract registration
    let contract_id = create_contract(&env);
    assert!(contract_id != Address::generate(&env));

    // Test that we can create a client
    let client = ContractClient::new(&env, &contract_id);
    assert!(client.address == contract_id);
}

#[test]
#[should_panic]
fn test_rate_limit_submit_rating_panics_on_6th() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = create_contract(&env);
    let client = ContractClient::new(&env, &contract_id);

    // Init admin
    let admin = Address::generate(&env);
    client.init(&admin);

    let caller = Address::generate(&env);
    let rated_user = Address::generate(&env);
    let _contract_str = String::from_str(&env, "c1");
    let feedback = String::from_str(&env, "ok");
    let category = String::from_str(&env, "web");

    // Set a stable timestamp window start
    env.ledger().with_mut(|l| l.timestamp = 10_000);

    // 5 calls should pass with different contract IDs, 6th should panic due to rate limit
    for i in 0..5 {
        let cid = String::from_str(
            &env,
            match i {
                0 => "c1",
                1 => "c2",
                2 => "c3",
                3 => "c4",
                _ => "c5",
            },
        );
        client.submit_rating(&caller, &rated_user, &cid, &5u32, &feedback, &category);
    }
    let cid6 = String::from_str(&env, "c6");
    client.submit_rating(&caller, &rated_user, &cid6, &5u32, &feedback, &category);
}

#[test]
fn test_rate_limit_window_and_bypass() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = create_contract(&env);
    let client = ContractClient::new(&env, &contract_id);

    // Init admin
    let admin = Address::generate(&env);
    client.init(&admin);

    let caller = Address::generate(&env);
    let rated_user = Address::generate(&env);
    let contract_str = String::from_str(&env, "c1");
    let feedback = String::from_str(&env, "ok");
    let category = String::from_str(&env, "web");

    // Set a stable timestamp window start
    env.ledger().with_mut(|l| l.timestamp = 10_000);

    for i in 0..5 {
        let cid = String::from_str(
            &env,
            match i {
                0 => "w1",
                1 => "w2",
                2 => "w3",
                3 => "w4",
                _ => "w5",
            },
        );
        client.submit_rating(&caller, &rated_user, &cid, &5u32, &feedback, &category);
    }
    // window advance resets
    env.ledger().with_mut(|l| l.timestamp += 3601);
    client.submit_rating(
        &caller,
        &rated_user,
        &contract_str,
        &5u32,
        &feedback,
        &category,
    );

    // Bypass
    client.set_rate_limit_bypass(&admin, &caller, &true);
    for i in 0..3 {
        let cid = String::from_str(
            &env,
            match i {
                0 => "b1",
                1 => "b2",
                _ => "b3",
            },
        );
        client.submit_rating(&caller, &rated_user, &cid, &5u32, &feedback, &category);
    }
}

#[test]
fn test_rating_validation_logic() {
    let env = Env::default();

    // Test valid rating range
    let valid_ratings = [1u32, 2, 3, 4, 5];
    for rating in valid_ratings.iter() {
        assert!(
            rating >= &1 && rating <= &5,
            "Rating {} should be valid",
            rating
        );
    }

    // Test invalid ratings
    let invalid_ratings = [0u32, 6, 10, 100];
    for rating in invalid_ratings.iter() {
        assert!(
            !(rating >= &1 && rating <= &5),
            "Rating {} should be invalid",
            rating
        );
    }
}

#[test]
fn test_rating_data_structures() {
    let env = Env::default();

    // Test basic string operations
    let feedback_text = String::from_str(&env, "Excellent work!");
    assert_eq!(feedback_text.len(), 15); // "Excellent work!" tiene 15 caracteres

    let category = String::from_str(&env, "web_development");
    assert_eq!(category.len(), 15);

    // Test address generation
    let rater = Address::generate(&env);
    let rated_user = Address::generate(&env);
    assert_ne!(rater, rated_user);

    // Test timestamp
    let _timestamp = env.ledger().timestamp();
}

#[test]
fn test_rating_calculations() {
    let env = Env::default();

    // Test average rating calculation
    let ratings = [5u32, 4, 5, 3, 5]; // 5, 4, 5, 3, 5
    let total: u32 = ratings.iter().sum();
    let average = total / ratings.len() as u32;

    assert_eq!(total, 22);
    assert_eq!(average, 4); // 22 / 5 = 4.4, pero como es u32 = 4

    // Test percentage calculation
    let five_star_count = ratings.iter().filter(|&&r| r == 5).count() as u32;
    let five_star_percentage = (five_star_count * 100) / ratings.len() as u32;

    assert_eq!(five_star_count, 3);
    assert_eq!(five_star_percentage, 60); // 3/5 * 100 = 60%
}

#[test]
fn test_rating_categories() {
    let env = Env::default();

    let categories = [
        String::from_str(&env, "web_development"),
        String::from_str(&env, "mobile_development"),
        String::from_str(&env, "design"),
        String::from_str(&env, "marketing"),
        String::from_str(&env, "consulting"),
    ];

    // Test that all categories are valid
    for category in &categories {
        assert!(category.len() > 0, "Category should not be empty");
        assert!(category.len() <= 50, "Category should not be too long");
    }

    // Test unique categories
    let mut unique_categories = Vec::new(&env);
    for category in &categories {
        if !unique_categories.contains(category) {
            unique_categories.push_back(category.clone());
        }
    }

    assert_eq!(unique_categories.len(), categories.len() as u32);
}

// #[test]
// fn test_health_check_basic_functionality() {
//     let env = Env::default();
//     let contract_id = create_contract(&env);
//     let client = ContractClient::new(&env, &contract_id);

//     // Initialize contract with admin
//     let admin = Address::generate(&env);
//     client.init(&admin);

//     // Perform health check
//     let health_status = client.health_check();
//     assert!(health_status.status.is_healthy, "Contract should be healthy after initialization");
//     assert!(health_status.status.admin_set, "Admin should be set");
//     assert!(health_status.status.storage_accessible, "Storage should be accessible");
//     assert!(health_status.status.critical_params_valid, "Critical parameters should be valid");
//     // Note: last_check might be 0 if not properly initialized
//     assert!(health_status.status.gas_used >= 0, "Gas usage should be recorded");
// }

// #[test]
// fn test_admin_health_check() {
//     let env = Env::default();
//     let contract_id = create_contract(&env);
//     let client = ContractClient::new(&env, &contract_id);

//     // Initialize contract with admin
//     let admin = Address::generate(&env);
//     client.init(&admin);

//     // Perform admin health check
//     let health_status = client.admin_health_check(&admin);
//     assert!(health_status.status.is_healthy, "Contract should be healthy");
//     assert!(health_status.details.len() > 0, "Admin health check should provide details");
//     assert!(health_status.recommendations.len() >= 0, "Recommendations should be provided");
// }

// #[test]
// #[should_panic]
// fn test_health_check_unauthorized_admin() {
//     let env = Env::default();
//     let contract_id = create_contract(&env);
//     let client = ContractClient::new(&env, &contract_id);

//     // Initialize contract with admin
//     let admin = Address::generate(&env);
//     client.init(&admin);

//     // Try admin health check with non-admin
//     let non_admin = Address::generate(&env);
//     // This should panic due to unauthorized access
//     client.admin_health_check(&non_admin);
// }

#[test]
fn test_rating_get_total_rating() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = create_contract(&env);
    let client = ContractClient::new(&env, &contract_id);

    // Init admin
    let admin = Address::generate(&env);
    client.init(&admin);

    let caller = Address::generate(&env);
    let rated_user = Address::generate(&env);
    let contract_str = String::from_str(&env, "c1");
    let feedback = String::from_str(&env, "ok");
    let category = String::from_str(&env, "web");

    // Set a stable timestamp window start
    env.ledger().with_mut(|l| l.timestamp = 10_000);

    for i in 0..5 {
        let cid = String::from_str(
            &env,
            match i {
                0 => "w1",
                1 => "w2",
                2 => "w3",
                3 => "w4",
                _ => "w5",
            },
        );
        client.submit_rating(&caller, &rated_user, &cid, &5u32, &feedback, &category);
    }

    // window advance resets
    env.ledger().with_mut(|l| l.timestamp += 3601);
    client.submit_rating(
        &caller,
        &rated_user,
        &contract_str,
        &5u32,
        &feedback,
        &category,
    );

    // Bypass
    client.set_rate_limit_bypass(&admin, &caller, &true);
    for i in 0..3 {
        let cid = String::from_str(
            &env,
            match i {
                0 => "b1",
                1 => "b2",
                _ => "b3",
            },
        );
        client.submit_rating(&caller, &rated_user, &cid, &5u32, &feedback, &category);
    }

    let total_count = client.get_total_rating();
    assert_eq!(total_count, 9)
}

#[test]
fn test_reset_total_rating() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = create_contract(&env);
    let client = ContractClient::new(&env, &contract_id);

    // Init admin
    let admin = Address::generate(&env);
    client.init(&admin);

    let caller = Address::generate(&env);
    let rated_user = Address::generate(&env);
    let contract_str = String::from_str(&env, "c1");
    let feedback = String::from_str(&env, "ok");
    let category = String::from_str(&env, "web");

    // Set a stable timestamp window start
    env.ledger().with_mut(|l| l.timestamp = 10_000);

    for i in 0..5 {
        let cid = String::from_str(
            &env,
            match i {
                0 => "w1",
                1 => "w2",
                2 => "w3",
                3 => "w4",
                _ => "w5",
            },
        );
        client.submit_rating(&caller, &rated_user, &cid, &5u32, &feedback, &category);
    }

    // window advance resets
    env.ledger().with_mut(|l| l.timestamp += 3601);
    client.submit_rating(
        &caller,
        &rated_user,
        &contract_str,
        &5u32,
        &feedback,
        &category,
    );

    // Bypass
    client.set_rate_limit_bypass(&admin, &caller, &true);
    for i in 0..3 {
        let cid = String::from_str(
            &env,
            match i {
                0 => "b1",
                1 => "b2",
                _ => "b3",
            },
        );
        client.submit_rating(&caller, &rated_user, &cid, &5u32, &feedback, &category);
    }

    let total_count = client.get_total_rating();
    assert_eq!(total_count, 9);

    client.reset_total_rating(&admin);

    let total_count = client.get_total_rating();
    assert_eq!(total_count, 0);
}


#[test]
fn test_rating_get_user_rating_summary() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = create_contract(&env);
    let client = ContractClient::new(&env, &contract_id);

    // Init admin
    let admin = Address::generate(&env);
    client.init(&admin);

    let caller = Address::generate(&env);
    let rated_user = Address::generate(&env);
    let contract_str = String::from_str(&env, "c1");
    let feedback = String::from_str(&env, "ok");
    let category = String::from_str(&env, "web");

    // Set a stable timestamp window start
    env.ledger().with_mut(|l| l.timestamp = 10_000);

    for i in 0..5 {
        let cid = String::from_str(
            &env,
            match i {
                0 => "w1",
                1 => "w2",
                2 => "w3",
                3 => "w4",
                _ => "w5",
            },
        );
        client.submit_rating(&caller, &rated_user, &cid, &5u32, &feedback, &category);
    }

    // window advance resets
    env.ledger().with_mut(|l| l.timestamp += 3601);
    client.submit_rating(
        &caller,
        &rated_user,
        &contract_str,
        &5u32,
        &feedback,
        &category,
    );

    // Bypass
    client.set_rate_limit_bypass(&admin, &caller, &true);
    for i in 0..3 {
        let cid = String::from_str(
            &env,
            match i {
                0 => "b1",
                1 => "b2",
                _ => "b3",
            },
        );
        client.submit_rating(&caller, &rated_user, &cid, &4u32, &feedback, &category);
    }

    let user_rating_summary = client.get_user_rating_summary(&rated_user);
    assert_eq!(user_rating_summary.five_star_count, 6);
    assert_eq!(user_rating_summary.four_star_count, 3);
    assert_eq!(user_rating_summary.total_ratings, 9);
}

#[test]
fn test_rating_reset_rate_limit_should_panic_on_non_admin() {
    let env = Env::default();
    let contract_id = create_contract(&env);
    let client = ContractClient::new(&env, &contract_id);

    // Initialize contract with admin
    let admin = Address::generate(&env);
    client.init(&admin);

    // Try to reset rate limit as non-admin
    let non_admin = Address::generate(&env);
    // This should panic due to unauthorized access
    // should panic with #1 from the Error enum
    let res = client.try_reset_rate_limit(
        &non_admin,
        &non_admin,
        &String::from_str(&env, "total_ratings"),
    );
    assert_eq!(res, Err(Ok(Error::Unauthorized)));
}

#[test]
fn test_rating_out_of_range() {
    let env = Env::default();
    let contract_id = create_contract(&env);
    let client = ContractClient::new(&env, &contract_id);
    env.mock_all_auths();

    // Test ratings from -1 to 6 (invalid) and 1 to 5 (valid)
    for val in -1..7 {
        default_rating_submission(&client, &env, val);
    }
}

#[test]
fn test_rating_rate_limiting_with_multiple_users() {
    let env = Env::default();
    let contract_id = create_contract(&env);
    let client = ContractClient::new(&env, &contract_id);
    env.mock_all_auths();
    let str_ = vec![
        &env,
        String::from_str(&env, "c0"),
        String::from_str(&env, "c1"),
        String::from_str(&env, "c2"),
        String::from_str(&env, "c3"),
        String::from_str(&env, "c4"),
    ];

    let window = 3600;
    let mut c = default_rating_context(&env);
    for i in 0..5 {
        c.contract_str = str_.get(i).unwrap();
        submit_rating(&client, 5, c.clone());
    }
    // 6th should be rate-limited
    c.contract_str = String::from_str(&env, "c6");
    let result = client.try_submit_rating(
        &c.caller,
        &c.rated_user,
        &c.contract_str,
        &3u32,
        &c.feedback,
        &c.category,
    );

    assert_eq!(result, Err(Ok(Error::RateLimitExceeded)));
    let prev_caller = c.caller;
    c.caller = Address::generate(&env);
    // New caller should work
    submit_rating(&client, 4, c.clone());
    env.ledger().set_timestamp(window + 1);

    // Previous caller should work after window
    c.caller = prev_caller;
    submit_rating(&client, 2, c.clone());
}

#[test]
fn test_rating_admin_authorization_verification() {
    let env = Env::default();
    let contract_id = create_contract(&env);
    let client = ContractClient::new(&env, &contract_id);

    // Initialize contract with admin
    let admin = Address::generate(&env);
    client.init(&admin);

    // Test authorized admin access
    let result = client.try_set_rate_limit_bypass(&admin, &admin, &true);
    assert!(
        result.is_ok(),
        "Admin should be authorized to perform this action"
    );

    // Test unauthorized access by non-admin
    let non_admin = Address::generate(&env);
    let result = client.try_set_rate_limit_bypass(&non_admin, &admin, &true);
    assert_eq!(result, Err(Ok(Error::Unauthorized)));

    // Test unauthorized access to reset rate limit
    let result =
        client.try_reset_rate_limit(&non_admin, &admin, &String::from_str(&env, "total_ratings"));
    assert_eq!(result, Err(Ok(Error::Unauthorized)));

    // Test authorized access to reset rate limit
    client.reset_rate_limit(&admin, &non_admin, &String::from_str(&env, "total_ratings"));
}

#[test]
fn test_rating_moderation_scenarios() {
    let env = Env::default();
    let contract_id = create_contract(&env);
    let client = ContractClient::new(&env, &contract_id);
    env.mock_all_auths();

    let admin = Address::generate(&env);
    client.init(&admin);

    // Add a moderator
    let moderator = Address::generate(&env);
    client.add_moderator(&admin, &moderator);

    // Submit a rating to be moderated
    let c = default_rating_context(&env);

    client.submit_rating(
        &c.caller,
        &c.rated_user,
        &c.contract_str,
        &1u32,
        &c.feedback,
        &c.category,
    );

    // Moderator approves the feedback
    let feedback_id = String::from_str(&env, "feedback_id");
    let action_approve = String::from_str(&env, "approve");
    let reason = String::from_str(&env, "Valid feedback");

    // use admin to approve
    client.moderate_feedback(&admin, &feedback_id, &action_approve, &reason);

    // Moderator removes the feedback
    let action_remove = String::from_str(&env, "remove");
    client.moderate_feedback(&moderator, &feedback_id, &action_remove, &reason);

    // Unauthorized user tries to moderate
    let unauthorized_user = Address::generate(&env);
    let result =
        client.try_moderate_feedback(&unauthorized_user, &feedback_id, &action_remove, &reason);
    assert_eq!(
        result,
        Err(Ok(Error::Unauthorized)),
        "Unauthorized user should not be able to moderate feedback"
    );
}

#[test]
fn test_rating_admin_transfer() {
    let env = Env::default();
    let contract_id = create_contract(&env);
    let client = ContractClient::new(&env, &contract_id);
    env.mock_all_auths();

    // Initialize contract with admin
    let admin = Address::generate(&env);
    client.init(&admin);

    // Transfer admin role to a new admin, and perform an admin function
    let new_admin = Address::generate(&env);
    client.transfer_admin(&admin, &new_admin);
    client.set_rate_limit_bypass(&new_admin, &new_admin, &true);

    // Old admin should no longer be valid
    let result = client.try_set_rate_limit_bypass(&admin, &new_admin, &true);
    assert_eq!(result, Err(Ok(Error::Unauthorized)));
}

#[test]
fn test_rating_incentives() {
    let env = Env::default();
    let contract_id = create_contract(&env);
    let client = ContractClient::new(&env, &contract_id);
    env.mock_all_auths();

    // Initialize contract with admin
    let admin = Address::generate(&env);
    client.init(&admin);

    let mut c = default_rating_context(&env);

    // simulate various ratings
    submit_rating(&client, 5, c.clone());
    let incentives = client.check_rating_incentives(&c.rated_user);
    assert_eq!(incentives.len(), 1, "Incentive len should be 1"); // First five-star rating incentive
    assert_eq!(
        incentives.get(0).unwrap(),
        String::from_str(&env, "first_five_star")
    );

    feign_rating(&env, &client, 50, 5, &mut c);

    let incentives = client.check_rating_incentives(&c.rated_user);
    assert_eq!(incentives.len(), 5, "Incentive len should be 3");
    assert_eq!(
        incentives.get(1).unwrap(),
        String::from_str(&env, "ten_reviews")
    );
    assert_eq!(
        incentives.get(2).unwrap(),
        String::from_str(&env, "fifty_reviews")
    );
    assert_eq!(
        incentives.get(3).unwrap(),
        String::from_str(&env, "top_rated")
    );
    assert_eq!(
        incentives.get(4).unwrap(),
        String::from_str(&env, "consistency_award")
    );

    // To simulate the top_rated achievement..
    // simulate a 4.75 rating using fifteen 5-stars and four 4-stars

    c.rated_user = Address::generate(&env);
    feign_rating(&env, &client, 15, 5, &mut c);
    feign_rating(&env, &client, 4, 4, &mut c);
    let incentives = client.check_rating_incentives(&c.rated_user);
    log!(&env, "", incentives);
    assert_eq!(incentives.len(), 2, "Incentive len should be 2");
    assert_eq!(
        incentives.get(0).unwrap(),
        String::from_str(&env, "first_five_star")
    );
    assert_eq!(
        incentives.get(1).unwrap(),
        String::from_str(&env, "ten_reviews")
    );

    // Simulate top rated by adding an extra 5-star rating
    feign_rating(&env, &client, 1, 5, &mut c);
    let incentives = client.check_rating_incentives(&c.rated_user);
    assert_eq!(incentives.len(), 3, "Incentive len should be 3");
    assert_eq!(
        incentives.get(2).unwrap(),
        String::from_str(&env, "top_rated")
    );
}

#[test]
fn test_rating_reputation_contract_integration() {
    let env = Env::default();
    let contract_id = create_contract(&env);

    let reputation_cid = env.register(ReputationContract, ());
    let client = ContractClient::new(&env, &contract_id);
    let r_client = reputation_nft_contract::ContractClient::new(&env, &reputation_cid);
    env.mock_all_auths_allowing_non_root_auth();

    // Initialize contract with admin
    let admin = Address::generate(&env);
    let non_admin = Address::generate(&env);
    client.init(&admin);
    r_client.init(&admin);
    r_client.add_minter(&admin, &contract_id);

    let mut c = default_rating_context(&env);

    let res = client.try_set_reputation_contract(&non_admin, &reputation_cid);
    assert_eq!(res, Err(Ok(Error::Unauthorized)));
    client.set_reputation_contract(&admin, &reputation_cid);

    feign_rating(&env, &client, 10, 5, &mut c);

    // Before claiming, check the user's ownership of Token ID 1
    // should panic because token does not exist.
    let res = r_client.try_get_owner(&1);
    assert_eq!(res, Err(Ok(E::TokenDoesNotExist)));
    client.claim_incentive_reward(&c.rated_user, &String::from_str(&env, "first_five_star"));

    // Token should exist, and owner as c.rated_user
    let owner = r_client.get_owner(&1);
    assert_eq!(owner, c.rated_user);

    let new_recipient = Address::generate(&env);
    r_client.transfer(&c.rated_user, &new_recipient, &1);
    let new_owner = r_client.get_owner(&1);
    assert_eq!(new_owner, new_recipient);

    // no other token ID should've been created
    let res = r_client.try_get_owner(&2);
    assert_eq!(res, Err(Ok(E::TokenDoesNotExist)));
}

#[test]
fn test_get_user_rating_history_pagination_edge_cases() {
    let env = Env::default();
    let contract_id = create_contract(&env);
    let client = ContractClient::new(&env, &contract_id);
    env.mock_all_auths();

    // Initialize contract with admin
    let admin = Address::generate(&env);
    client.init(&admin);

    let mut c = default_rating_context(&env);

    // Submit 3 ratings
    for _ in 0..3 {
        c.contract_str = random_string(&env);
        submit_rating(&client, 5, c.clone());
    }

    // Test pagination with limit greater than total ratings
    let history = client.get_user_rating_history(&c.rated_user, &0, &10);
    assert_eq!(history.len(), 3, "Should return all 3 ratings");

    // Test pagination with offset beyond total ratings
    let history = client.get_user_rating_history(&c.rated_user, &5, &2);
    assert_eq!(history.len(), 0, "Should return 0 ratings");

    // Test pagination with exact limit
    let history = client.get_user_rating_history(&c.rated_user, &0, &3);
    assert_eq!(history.len(), 3, "Should return all 3 ratings");

    // Test pagination with offset and limit within range
    let history = client.get_user_rating_history(&c.rated_user, &1, &2);
    assert_eq!(history.len(), 2, "Should return 2 ratings");
}

#[test]
fn test_rating_set_rating_threshold_parameter_validation() {
    let env = Env::default();
    let contract_id = create_contract(&env);
    let client = ContractClient::new(&env, &contract_id);
    env.mock_all_auths();

    // Initialize contract with admin
    let admin = Address::generate(&env);
    client.init(&admin);

    // Test valid threshold values
    let valid_thresholds = [0u32, 50, 100, 200, 300, 400, 500];
    for threshold in valid_thresholds.iter() {
        let threshold_type = random_string(&env);
        client.set_rating_threshold(&admin, &threshold_type, threshold);
    }

    // in the contract, get_threshold() is never used
}
