use soroban_sdk::{Address, Env, String, Vec};
use crate::{RatingData, Error};
use crate::storage::{save_rating, rating_exists, get_user_ratings, save_user_ratings};
use crate::events::emit_rating_submitted;
use crate::access::{check_auth, validate_score, validate_job_completion, validate_job_participants};

pub struct RatingContract;

impl RatingContract {
    /// Rate a user for a specific job
    pub fn rate_user(
        env: Env,
        rater: Address,
        target: Address,
        job_id: u32,
        score: i32,
        comment: String,
    ) -> Result<(), Error> {
        // Verify the caller is authorized
        check_auth(&env, &rater)?;
        
        // Validate score is between 1 and 5
        validate_score(score)?;
        
        // Check if job is completed
        validate_job_completion(&env, &job_id)?;
        
        // Validate that caller and target are participants in the job
        validate_job_participants(&env, &rater, &target, &job_id)?;
        
        // Check if this user has already rated the target for this job
        if rating_exists(&env, &target, job_id) {
            return Err(Error::DuplicateRating);
        }
        
        // Create the rating data
        let rating = RatingData {
            rater: rater.clone(),
            job_id,
            score,
            comment,
            timestamp: env.ledger().timestamp(),
        };
        
        // Store the rating
        save_rating(&env, &rating);
        
        // Add to the user's ratings list
        let mut user_ratings = get_user_ratings(&env, &target);
        user_ratings.push_back(rating);
        save_user_ratings(&env, &target, &user_ratings);
        
        // Emit event
        emit_rating_submitted(&env, &rater, &target, job_id, score);
        
        Ok(())
    }
    
    /// Get all ratings for a specific user
    pub fn get_ratings(env: Env, target: Address) -> Result<Vec<RatingData>, Error> {
        let ratings = get_user_ratings(&env, &target);
        Ok(ratings)
    }
    
    /// Calculate the average rating for a user
    pub fn get_average_rating(env: Env, target: Address) -> Result<i32, Error> {
        let ratings = get_user_ratings(&env, &target);
        
        if ratings.is_empty() {
            return Ok(0);
        }
        
        let mut total: i32 = 0;
        let mut count: i32 = 0;
        
        for rating in ratings.iter() {
            total += rating.score;
            count += 1;
        }
        
        if count == 0 {
            return Ok(0);
        }
        
        Ok(total / count)
    }
}
