#![cfg(test)]

use rating_contract::{Contract, ContractClient, RatingData, Error};
use soroban_sdk::{testutils::Address as _, Address, Env, String, Vec, i32};
use soroban_sdk::testutils::Ledger;

#[test]
fn test_rate_user_successfully() {
    let env = Env::default();
    let contract_id = env.register_contract(None, Contract);
    let client = ContractClient::new(&env, &contract_id);
    
    // Create test addresses
    let rater = Address::generate(&env);
    let target = Address::generate(&env);
    
    // Set timestamp for consistency in tests
    env.ledger().set(Ledger {
        timestamp: 12345,
        ..Default::default()
    });
    
    // Submit a rating
    let job_id = 1;
    let score = 4_i32;
    let comment = String::from_str(&env, "Great work!");
    
    // Invoke with rater's address
    env.mock_all_auths();
    
    let result = client.rate_user(&rater, &target, &job_id, &score, &comment);
    assert!(result.is_ok());
    
    // Verify the rating was stored
    let ratings = client.get_ratings(&target).unwrap();
    assert_eq!(ratings.len(), 1);
    
    let rating = ratings.get(0).unwrap();
    assert_eq!(rating.rater, rater);
    assert_eq!(rating.job_id, job_id);
    assert_eq!(rating.score, score);
    assert_eq!(rating.comment, comment);
    assert_eq!(rating.timestamp, 12345);
    
    // Check average rating
    let avg_rating = client.get_average_rating(&target).unwrap();
    assert_eq!(avg_rating, score);
}

#[test]
fn test_duplicate_rating_fails() {
    let env = Env::default();
    let contract_id = env.register_contract(None, Contract);
    let client = ContractClient::new(&env, &contract_id);
    
    // Create test addresses
    let rater = Address::generate(&env);
    let target = Address::generate(&env);
    
    // Submit a rating
    let job_id = 1;
    let score = 4_i32;
    let comment = String::from_str(&env, "Great work!");
    
    // Mock authorization
    env.mock_all_auths();
    
    // First rating should succeed
    let result = client.rate_user(&rater, &target, &job_id, &score, &comment);
    assert!(result.is_ok());
    
    // Second rating for the same job should fail with DuplicateRating error
    let result = client.rate_user(&rater, &target, &job_id, &score, &comment);
    assert_eq!(result, Err(Error::DuplicateRating));
}

#[test]
fn test_invalid_score_fails_too_low() {
    let env = Env::default();
    let contract_id = env.register_contract(None, Contract);
    let client = ContractClient::new(&env, &contract_id);
    
    // Create test addresses
    let rater = Address::generate(&env);
    let target = Address::generate(&env);
    
    // Submit a rating with an invalid score (0)
    let job_id = 1;
    let score = 0_i32; // Invalid score
    let comment = String::from_str(&env, "Great work!");
    
    // Mock authorization
    env.mock_all_auths();
    
    // Should fail with InvalidScore error
    let result = client.rate_user(&rater, &target, &job_id, &score, &comment);
    assert_eq!(result, Err(Error::InvalidScore));
}

#[test]
fn test_invalid_score_fails_too_high() {
    let env = Env::default();
    let contract_id = env.register_contract(None, Contract);
    let client = ContractClient::new(&env, &contract_id);
    
    // Create test addresses
    let rater = Address::generate(&env);
    let target = Address::generate(&env);
    
    // Submit a rating with an invalid score (6)
    let job_id = 1;
    let score = 6_i32; // Invalid score
    let comment = String::from_str(&env, "Great work!");
    
    // Mock authorization
    env.mock_all_auths();
    
    // Should fail with InvalidScore error
    let result = client.rate_user(&rater, &target, &job_id, &score, &comment);
    assert_eq!(result, Err(Error::InvalidScore));
}

#[test]
fn test_get_ratings_list() {
    let env = Env::default();
    let contract_id = env.register_contract(None, Contract);
    let client = ContractClient::new(&env, &contract_id);
    
    // Create test addresses
    let rater1 = Address::generate(&env);
    let rater2 = Address::generate(&env);
    let target = Address::generate(&env);
    
    // Mock authorization
    env.mock_all_auths();
    
    // Set timestamp for consistency in tests
    env.ledger().set(Ledger {
        timestamp: 12345,
        ..Default::default()
    });
    
    // Submit ratings from different raters for different jobs
    client.rate_user(&rater1, &target, &1, &5_i32, &String::from_str(&env, "Excellent!")).unwrap();
    client.rate_user(&rater2, &target, &2, &3_i32, &String::from_str(&env, "Good job.")).unwrap();
    
    // Get ratings for the target
    let ratings = client.get_ratings(&target).unwrap();
    
    // Verify we have 2 ratings
    assert_eq!(ratings.len(), 2);
    
    // Verify the ratings data
    let rating1 = ratings.get(0).unwrap();
    let rating2 = ratings.get(1).unwrap();
    
    assert_eq!(rating1.rater, rater1);
    assert_eq!(rating1.job_id, 1);
    assert_eq!(rating1.score, 5);
    assert_eq!(rating1.comment, String::from_str(&env, "Excellent!"));
    
    assert_eq!(rating2.rater, rater2);
    assert_eq!(rating2.job_id, 2);
    assert_eq!(rating2.score, 3);
    assert_eq!(rating2.comment, String::from_str(&env, "Good job."));
}

#[test]
fn test_get_average_rating_calculation() {
    let env = Env::default();
    let contract_id = env.register_contract(None, Contract);
    let client = ContractClient::new(&env, &contract_id);
    
    // Create test addresses
    let rater1 = Address::generate(&env);
    let rater2 = Address::generate(&env);
    let rater3 = Address::generate(&env);
    let target = Address::generate(&env);
    
    // Mock authorization
    env.mock_all_auths();
    
    // Submit ratings from different raters
    client.rate_user(&rater1, &target, &1, &5_i32, &String::from_str(&env, "Excellent!")).unwrap();
    client.rate_user(&rater2, &target, &2, &3_i32, &String::from_str(&env, "Good job.")).unwrap();
    client.rate_user(&rater3, &target, &3, &4_i32, &String::from_str(&env, "Very good!")).unwrap();
    
    // Calculate average: (5 + 3 + 4) / 3 = 4
    let avg_rating = client.get_average_rating(&target).unwrap();
    assert_eq!(avg_rating, 4_i32);
}

#[test]
fn test_get_average_rating_no_ratings() {
    let env = Env::default();
    let contract_id = env.register_contract(None, Contract);
    let client = ContractClient::new(&env, &contract_id);
    
    // Create test address
    let target = Address::generate(&env);
    
    // Get average rating for a user with no ratings
    let avg_rating = client.get_average_rating(&target).unwrap();
    
    // Should return 0 when no ratings exist
    assert_eq!(avg_rating, 0_i32);
}
