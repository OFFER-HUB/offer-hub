#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Address, String, Vec};

mod access;
mod events;
mod rating;
mod storage;
mod types;
mod test;

pub use crate::rating::RatingContract;
pub use types::RatingData;
pub use types::Error;

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    /// Rate a user for a specific job
    /// 
    /// # Arguments
    /// * `rater` - Address of the user giving the rating
    /// * `target` - Address of the user being rated
    /// * `job_id` - ID of the job for which the rating is being given
    /// * `score` - Rating score (1-5)
    /// * `comment` - Optional comment for the rating
    pub fn rate_user(
        env: Env,
        rater: Address,
        target: Address,
        job_id: u32,
        score: i32,
        comment: String,
    ) -> Result<(), Error> {
        RatingContract::rate_user(env, rater, target, job_id, score, comment)
    }
    
    /// Get all ratings for a specific user
    /// 
    /// # Arguments
    /// * `target` - Address of the user whose ratings to retrieve
    /// 
    /// # Returns
    /// * Vector of RatingData objects
    pub fn get_ratings(env: Env, target: Address) -> Result<Vec<RatingData>, Error> {
        RatingContract::get_ratings(env, target)
    }
    
    /// Calculate the average rating for a user
    /// 
    /// # Arguments
    /// * `target` - Address of the user whose average rating to calculate
    /// 
    /// # Returns
    /// * Average rating (0 if no ratings)
    pub fn get_average_rating(env: Env, target: Address) -> Result<i32, Error> {
        RatingContract::get_average_rating(env, target)
    }
}
