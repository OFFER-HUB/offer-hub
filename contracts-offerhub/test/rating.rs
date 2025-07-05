#![cfg(test)]

use soroban_sdk::{testutils::Address as _, Address, Env, String};
use rating_contract::{RatingContract, RatingContractClient};

#[test]
fn test_rate_user_successfully() {
    let env = Env::default();
    let contract_id = env.register(RatingContract, ());
    let client = RatingContractClient::new(&env, &contract_id);
    
    // Create test addresses
    let rater = Address::generate(&env);
    let target = Address::generate(&env);
    
    // Set the invoker as the rater
    env.set_invoker(rater.clone());
    
    // Submit a rating
    let job_id = 1;
    let score = 4_u8;
    let comment = String::from_str(&env, "Great work!");
    
    client.rate_user(&target, &job_id, &score, &comment);
    
    // Verify the rating was stored
    let ratings = client.get_ratings(&target);
    assert_eq!(ratings.len(), 1);
    
    let rating = ratings.get(0).unwrap();
    assert_eq!(rating.rater, rater);
    assert_eq!(rating.job_id, job_id);
    assert_eq!(rating.score, score);
    assert_eq!(rating.comment, comment);
    
    // Check average rating
    let avg_rating = client.get_average_rating(&target);
    assert_eq!(avg_rating, score);
}

#[test]
#[should_panic(expected = "You have already rated this user for this job")]
fn test_duplicate_rating_fails() {
    let env = Env::default();
    let contract_id = env.register(RatingContract, ());
    let client = RatingContractClient::new(&env, &contract_id);
    
    // Create test addresses
    let rater = Address::generate(&env);
    let target = Address::generate(&env);
    
    // Set the invoker as the rater
    env.set_invoker(rater.clone());
    
    // Submit a rating
    let job_id = 1;
    let score = 4_u8;
    let comment = String::from_str(&env, "Great work!");
    
    // First rating should succeed
    client.rate_user(&target, &job_id, &score, &comment);
    
    // Second rating for the same job should fail
    client.rate_user(&target, &job_id, &score, &comment);
}

#[test]
#[should_panic(expected = "Score must be between 1 and 5")]
fn test_invalid_score_fails_too_low() {
    let env = Env::default();
    let contract_id = env.register(RatingContract, ());
    let client = RatingContractClient::new(&env, &contract_id);
    
    // Create test addresses
    let rater = Address::generate(&env);
    let target = Address::generate(&env);
    
    // Set the invoker as the rater
    env.set_invoker(rater.clone());
    
    // Submit a rating with an invalid score (0)
    let job_id = 1;
    let score = 0_u8; // Invalid score
    let comment = String::from_str(&env, "Great work!");
    
    client.rate_user(&target, &job_id, &score, &comment);
}

#[test]
#[should_panic(expected = "Score must be between 1 and 5")]
fn test_invalid_score_fails_too_high() {
    let env = Env::default();
    let contract_id = env.register(RatingContract, ());
    let client = RatingContractClient::new(&env, &contract_id);
    
    // Create test addresses
    let rater = Address::generate(&env);
    let target = Address::generate(&env);
    
    // Set the invoker as the rater
    env.set_invoker(rater.clone());
    
    // Submit a rating with an invalid score (6)
    let job_id = 1;
    let score = 6_u8; // Invalid score
    let comment = String::from_str(&env, "Great work!");
    
    client.rate_user(&target, &job_id, &score, &comment);
}

#[test]
fn test_get_ratings_list() {
    let env = Env::default();
    let contract_id = env.register(RatingContract, ());
    let client = RatingContractClient::new(&env, &contract_id);
    
    // Create test addresses
    let rater1 = Address::generate(&env);
    let rater2 = Address::generate(&env);
    let target = Address::generate(&env);
    
    // Submit ratings from different raters for different jobs
    env.set_invoker(rater1.clone());
    client.rate_user(&target, &1, &5_u8, &String::from_str(&env, "Excellent!"));
    
    env.set_invoker(rater2.clone());
    client.rate_user(&target, &2, &3_u8, &String::from_str(&env, "Good job."));
    
    // Get ratings for the target
    let ratings = client.get_ratings(&target);
    
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
    let contract_id = env.register(RatingContract, ());
    let client = RatingContractClient::new(&env, &contract_id);
    
    // Create test addresses
    let rater1 = Address::generate(&env);
    let rater2 = Address::generate(&env);
    let rater3 = Address::generate(&env);
    let target = Address::generate(&env);
    
    // Submit ratings from different raters
    env.set_invoker(rater1.clone());
    client.rate_user(&target, &1, &5_u8, &String::from_str(&env, "Excellent!"));
    
    env.set_invoker(rater2.clone());
    client.rate_user(&target, &2, &3_u8, &String::from_str(&env, "Good job."));
    
    env.set_invoker(rater3.clone());
    client.rate_user(&target, &3, &4_u8, &String::from_str(&env, "Very good!"));
    
    // Calculate average: (5 + 3 + 4) / 3 = 4
    let avg_rating = client.get_average_rating(&target);
    assert_eq!(avg_rating, 4_u8);
}

#[test]
fn test_get_average_rating_no_ratings() {
    let env = Env::default();
    let contract_id = env.register(RatingContract, ());
    let client = RatingContractClient::new(&env, &contract_id);
    
    // Create test address
    let target = Address::generate(&env);
    
    // Get average rating for a user with no ratings
    let avg_rating = client.get_average_rating(&target);
    
    // Should return 0 when no ratings exist
    assert_eq!(avg_rating, 0_u8);
}
