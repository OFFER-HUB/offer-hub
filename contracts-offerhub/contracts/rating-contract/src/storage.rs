use soroban_sdk::{Address, Env, Vec, BytesN, Bytes};
use crate::RatingData;

/// Save a rating to storage
pub fn save_rating(env: &Env, rating: &RatingData) {
    let key = create_rating_key(env, &rating.rater, rating.job_id);
    env.storage().persistent().set(&key, rating);
}

/// Check if a rating already exists for a specific rater and job
pub fn rating_exists(env: &Env, rater: &Address, job_id: u32) -> bool {
    let key = create_rating_key(env, rater, job_id);
    env.storage().persistent().has(&key)
}

/// Get all ratings for a user
pub fn get_user_ratings(env: &Env, target: &Address) -> Vec<RatingData> {
    let user_key = create_user_key(env, target);
    env.storage().persistent().get(&user_key).unwrap_or_else(|| Vec::new(env))
}

/// Save the list of ratings for a user
pub fn save_user_ratings(env: &Env, target: &Address, ratings: &Vec<RatingData>) {
    let user_key = create_user_key(env, target);
    env.storage().persistent().set(&user_key, ratings);
}

/// Create a unique key for a rating
fn create_rating_key(env: &Env, rater: &Address, job_id: u32) -> BytesN<32> {
    // Create a simple key from the data we have available
    let mut data = Bytes::new(env);
    data.extend_from_slice(b"RATING_");
    
    // Convert job_id to bytes and add to data
    data.extend_from_slice(&job_id.to_be_bytes());
    
    // Hash everything to create a unique key and convert to BytesN<32>
    env.crypto().sha256(&data).into()
}

/// Create a unique key for a user's ratings
fn create_user_key(env: &Env, target: &Address) -> BytesN<32> {
    // Create a simple key with a prefix
    let mut data = Bytes::new(env);
    data.extend_from_slice(b"USER_RATINGS_");
    
    // Hash everything to create a unique key and convert to BytesN<32>
    env.crypto().sha256(&data).into()
}
