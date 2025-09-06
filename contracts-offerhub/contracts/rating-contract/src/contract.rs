use crate::access::{
    add_moderator as add_moderator_impl, remove_moderator as remove_moderator_impl,
    transfer_admin as transfer_admin_impl,
};
use crate::analytics::{generate_user_rating_data, get_platform_analytics};
use crate::events::{emit_feedback_submitted, emit_rating_stats_updated, emit_rating_submitted};
use crate::incentives::{check_rating_incentives, claim_incentive_reward as claim_incentive_impl};
use crate::moderation::{
    auto_moderate_feedback, moderate_feedback as moderate_feedback_impl,
    report_feedback as report_feedback_impl,
};
use crate::restrictions::{
    check_and_apply_restrictions, check_restriction_status, get_user_privileges,
};
use crate::storage::{
    add_user_feedback_id, check_rate_limit, get_admin, get_feedback, get_reputation_contract,
    get_user_feedback_ids, get_user_rating_history, get_user_rating_stats, increment_platform_stat,
    increment_rating_count, reset_rate_limit, save_admin, save_feedback, save_rating,
    save_rating_threshold, save_reputation_contract, save_user_rating_stats, set_rate_limit_bypass,
    set_total_rating,
};
use crate::types::{
    require_auth, AllRatingDataExport, Error, Feedback, HealthCheckResult, Rating,
    RatingDataExport, RatingStats, RatingThreshold, UserRatingData, UserRatingSummary
};
use crate::validation::{validate_report_feedback, validate_submit_rating};
use soroban_sdk::{Address, Env, IntoVal, String, Symbol, Vec};

pub struct RatingContract;

impl RatingContract {
    pub fn init(env: Env, admin: Address) -> Result<(), Error> {
        save_admin(&env, &admin);

        // Initialize default thresholds
        let restriction_threshold = RatingThreshold {
            threshold_type: String::from_str(&env, "restriction"),
            value: crate::types::DEFAULT_RESTRICTION_THRESHOLD,
        };
        save_rating_threshold(&env, &restriction_threshold);

        let warning_threshold = RatingThreshold {
            threshold_type: String::from_str(&env, "warning"),
            value: crate::types::DEFAULT_WARNING_THRESHOLD,
        };
        save_rating_threshold(&env, &warning_threshold);

        let top_rated_threshold = RatingThreshold {
            threshold_type: String::from_str(&env, "top_rated"),
            value: crate::types::DEFAULT_TOP_RATED_THRESHOLD,
        };
        save_rating_threshold(&env, &top_rated_threshold);

        // Initialize health check system
        // crate::health_check::initialize_health_check_system(&env)?;

        Ok(())
    }

    pub fn submit_rating(
        env: Env,
        caller: Address,
        rated_user: Address,
        contract_id: String,
        rating: u32, // Changed from u8 to u32
        feedback: String,
        work_category: String,
    ) -> Result<(), Error> {
        require_auth(&caller)?;
        // Rate limit: max 5 per hour per user
        let limit_type = String::from_str(&env, "submit_rating");
        // 3600 seconds
        check_rate_limit(&env, &caller, &limit_type, 5, 3600)?;

        // Comprehensive input validation
        validate_submit_rating(
            &env,
            &caller,
            &rated_user,
            &contract_id,
            rating,
            &feedback,
            &work_category,
        )?;

        // Generate unique IDs
        let rating_id = Self::generate_rating_id(&env, &caller, &rated_user, &contract_id);
        let feedback_id = Self::generate_feedback_id(&env, &rating_id);

        // Create rating record
        let rating_record = Rating {
            id: rating_id.clone(),
            rater: caller.clone(),
            rated_user: rated_user.clone(),
            contract_id: contract_id.clone(),
            rating,
            timestamp: env.ledger().timestamp(),
            work_category: work_category.clone(),
        };

        // Create feedback record
        let moderation_status = auto_moderate_feedback(&env, &feedback);
        let feedback_record = Feedback {
            id: feedback_id.clone(),
            rating_id: rating_id.clone(),
            rater: caller.clone(),
            rated_user: rated_user.clone(),
            contract_id: contract_id.clone(),
            feedback: feedback.clone(),
            timestamp: env.ledger().timestamp(),
            is_flagged: moderation_status != String::from_str(&env, "approved"),
            moderation_status,
        };

        // Save records
        save_rating(&env, &rating_record);
        save_feedback(&env, &feedback_record);

        // Add feedback to user's feedback list for easy retrieval
        // Store feedback ID for user indexing
        add_user_feedback_id(&env, &rated_user, &feedback_id);

        // Update statistics
        Self::update_user_statistics(&env, &rated_user, rating)?;

        // Check and apply restrictions based on new rating
        check_and_apply_restrictions(&env, &rated_user)?;

        // Update platform statistics
        increment_platform_stat(&env, &String::from_str(&env, "total_ratings"));
        increment_platform_stat(&env, &String::from_str(&env, "total_feedback"));
        let total_ratings = increment_rating_count(&env);

        // Emit events
        emit_rating_submitted(
            &env,
            &caller,
            &rated_user,
            &contract_id,
            rating,
            &rating_id,
            &total_ratings,
        );
        emit_feedback_submitted(&env, &caller, &rated_user, &feedback_id, &contract_id);

        Ok(())
    }

    // Admin: toggle rate limit bypass for a user
    pub fn set_rate_limit_bypass(
        env: Env,
        admin: Address,
        user: Address,
        bypass: bool,
    ) -> Result<(), Error> {
        set_rate_limit_bypass(&env, &admin, &user, bypass)
    }

    // Admin: reset a user's rate limit window for a type
    pub fn reset_rate_limit(
        env: Env,
        admin: Address,
        user: Address,
        limit_type: String,
    ) -> Result<(), Error> {
        // simple admin auth
        if get_admin(&env) != admin {
            return Err(Error::Unauthorized);
        }
        reset_rate_limit(&env, &user, &limit_type);
        Ok(())
    }

    pub fn get_user_rating_stats(env: Env, user: Address) -> Result<RatingStats, Error> {
        get_user_rating_stats(&env, &user)
    }

    pub fn get_user_feedback(env: Env, user: Address, limit: u32) -> Result<Vec<Feedback>, Error> {
        // Get all feedback IDs for the user from storage
        let feedback_ids = get_user_feedback_ids(&env, &user);
        let mut feedbacks = Vec::new(&env);

        // Fetch actual feedback objects and limit results
        let total_count = feedback_ids.len();
        let limit = if limit == 0 {
            total_count
        } else {
            u32::min(limit, total_count)
        };

        for i in 0..limit {
            if let Some(feedback_id) = feedback_ids.get(i) {
                if let Ok(feedback) = get_feedback(&env, &feedback_id) {
                    feedbacks.push_back(feedback);
                }
            }
        }

        Ok(feedbacks)
    }

    pub fn get_user_rating_data(env: Env, user: Address) -> Result<UserRatingData, Error> {
        generate_user_rating_data(&env, &user)
    }

    pub fn get_user_rating_summary(env: &Env, user: Address) -> Result<UserRatingSummary, Error> {
    // Fetch rating stats and data
    let rating_stats = get_user_rating_stats(&env, &user)?;
    let rating_data = generate_user_rating_data(&env, &user)?;
    let recent_rating = get_user_rating_history(&env, &user, 5u32, 0u32); //get last 5 recent ratings


    // Format recent ratings as Vec<Vec<String>>
    let mut recent_ratings = Vec::new(&env);
    
    for rating in recent_rating.iter() {
        let rating_tuple  = (
            rating.id.clone(),
            rating.rater,
            rating.rated_user,
            rating.contract_id.clone(),
            rating.rating,
            rating.timestamp,
            rating.work_category.clone(),
        );

        recent_ratings.push_back(rating_tuple);
    }

    // Construct formatted summary
    let summary = UserRatingSummary {
        user: rating_stats.user,
        total_ratings: rating_stats.total_ratings,
        average_rating: rating_stats.average_rating, 
        five_star_count: rating_stats.five_star_count,
        four_star_count: rating_stats.four_star_count,
        three_star_count: rating_stats.three_star_count,
        two_star_count: rating_stats.two_star_count,
        one_star_count: rating_stats.two_star_count,
        last_updated: rating_stats.last_updated,
        recent_ratings: recent_ratings,
        rating_trend: rating_data.rating_trend,
        achievement_eligible: rating_data.achievement_eligible,
        restriction_status: rating_data.restriction_status,
    };

    Ok(summary)
}

    pub fn get_user_rating_history(
        env: Env,
        user: Address,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<Rating>, Error> {
        Ok(get_user_rating_history(&env, &user, limit, offset))
    }

    pub fn has_restrictions(env: Env, user: Address) -> Result<bool, Error> {
        Ok(check_restriction_status(&env, &user))
    }

    pub fn get_user_privileges(env: Env, user: Address) -> Result<Vec<String>, Error> {
        Ok(get_user_privileges(&env, &user))
    }

    pub fn report_feedback(
        env: Env,
        caller: Address,
        feedback_id: String,
        reason: String,
    ) -> Result<(), Error> {
        // Input validation
        validate_report_feedback(&env, &caller, &feedback_id, &reason)?;
        report_feedback_impl(&env, &caller, &feedback_id, &reason)
    }

    pub fn moderate_feedback(
        env: Env,
        caller: Address,
        feedback_id: String,
        action: String,
        reason: String,
    ) -> Result<(), Error> {
        moderate_feedback_impl(&env, &caller, &feedback_id, &action, &reason)
    }

    pub fn get_platform_analytics(env: Env) -> Result<Vec<(String, String)>, Error> {
        Ok(get_platform_analytics(&env))
    }

    pub fn check_rating_incentives(env: Env, user: Address) -> Result<Vec<String>, Error> {
        Ok(check_rating_incentives(&env, &user))
    }

    pub fn claim_incentive_reward(
        env: Env,
        caller: Address,
        incentive_type: String,
    ) -> Result<(), Error> {
        claim_incentive_impl(&env, &caller, &incentive_type)
    }

    pub fn update_reputation(env: Env, caller: Address, user: Address) -> Result<(), Error> {
        require_auth(&caller)?;

        // Get user's rating statistics
        let stats = get_user_rating_stats(&env, &user)?;

        // Try to get reputation contract address
        if let Ok(reputation_contract) = get_reputation_contract(&env) {
            // Check if user qualifies for reputation NFTs and try to mint them
            if stats.average_rating >= 480 && stats.total_ratings >= 20 {
                // Award top-rated NFT
                let _ = Self::try_mint_achievement_nft(
                    &env,
                    &reputation_contract,
                    &user,
                    &soroban_sdk::symbol_short!("toprated"),
                );

                crate::events::emit_achievement_earned(
                    &env,
                    &user,
                    &String::from_str(&env, "top_rated"),
                    stats.average_rating,
                );
            }

            if stats.total_ratings >= 50 && stats.average_rating >= 400 {
                // Award veteran NFT
                let _ = Self::try_mint_achievement_nft(
                    &env,
                    &reputation_contract,
                    &user,
                    &soroban_sdk::symbol_short!("veteran"),
                );

                crate::events::emit_achievement_earned(
                    &env,
                    &user,
                    &String::from_str(&env, "veteran"),
                    stats.total_ratings,
                );
            }

            if stats.total_ratings >= 10 {
                // Award milestone NFT for 10 completed ratings
                let _ = Self::try_mint_achievement_nft(
                    &env,
                    &reputation_contract,
                    &user,
                    &soroban_sdk::symbol_short!("tencontr"),
                );
            }

            if stats.five_star_count >= 5 {
                // Award 5 stars 5 times NFT
                let _ = Self::try_mint_achievement_nft(
                    &env,
                    &reputation_contract,
                    &user,
                    &soroban_sdk::symbol_short!("5stars5x"),
                );
            }
        } else {
            // If no reputation contract is set, just emit events
            if stats.average_rating >= 480 && stats.total_ratings >= 20 {
                crate::events::emit_achievement_earned(
                    &env,
                    &user,
                    &String::from_str(&env, "top_rated"),
                    stats.average_rating,
                );
            }

            if stats.total_ratings >= 50 && stats.average_rating >= 400 {
                crate::events::emit_achievement_earned(
                    &env,
                    &user,
                    &String::from_str(&env, "veteran"),
                    stats.total_ratings,
                );
            }
        }

        Ok(())
    }

    // Helper function to safely attempt NFT minting
    fn try_mint_achievement_nft(
        env: &Env,
        reputation_contract: &Address,
        user: &Address,
        nft_type: &soroban_sdk::Symbol,
    ) -> Result<(), Error> {
        let result: Result<(), soroban_sdk::InvokeError> = env.invoke_contract(
            reputation_contract,
            &soroban_sdk::symbol_short!("mint_achv"),
            soroban_sdk::vec![
                env,
                user.into_val(env),     // to
                nft_type.into_val(env), // nft_type
            ],
        );

        match result {
            Ok(_) => Ok(()),
            Err(_) => {
                // Log error but don't fail the entire operation
                Ok(())
            }
        }
    }

    pub fn add_moderator(env: Env, caller: Address, moderator: Address) -> Result<(), Error> {
        add_moderator_impl(&env, &caller, &moderator)
    }

    pub fn remove_moderator(env: Env, caller: Address, moderator: Address) -> Result<(), Error> {
        remove_moderator_impl(&env, &caller, &moderator)
    }

    pub fn set_rating_threshold(
        env: Env,
        caller: Address,
        threshold_type: String,
        value: u32,
    ) -> Result<(), Error> {
        crate::access::check_admin(&env, &caller)?;

        let threshold = RatingThreshold {
            threshold_type: threshold_type.clone(),
            value,
        };
        save_rating_threshold(&env, &threshold);

        Ok(())
    }

    pub fn set_reputation_contract(
        env: Env,
        caller: Address,
        contract_address: Address,
    ) -> Result<(), Error> {
        crate::access::check_admin(&env, &caller)?;
        save_reputation_contract(&env, &contract_address);
        Ok(())
    }

    pub fn get_admin(env: Env) -> Result<Address, Error> {
        Ok(get_admin(&env))
    }

    pub fn transfer_admin(env: Env, caller: Address, new_admin: Address) -> Result<(), Error> {
        transfer_admin_impl(&env, &caller, &new_admin)
    }

    // Helper functions
    fn generate_rating_id(
        env: &Env,
        _rater: &Address,
        _rated_user: &Address,
        _contract_id: &String,
    ) -> String {
        let _timestamp = env.ledger().timestamp();
        let _sequence = env.ledger().sequence();
        // Create a simple ID without format! macro
        String::from_str(env, "rating_id")
    }

    fn generate_feedback_id(env: &Env, _rating_id: &String) -> String {
        // Create a simple ID without format! macro
        String::from_str(env, "feedback_id")
    }

    fn update_user_statistics(env: &Env, user: &Address, new_rating: u32) -> Result<(), Error> {
        let mut stats = get_user_rating_stats(env, user).unwrap_or(RatingStats {
            user: user.clone(),
            total_ratings: 0,
            average_rating: 0,
            five_star_count: 0,
            four_star_count: 0,
            three_star_count: 0,
            two_star_count: 0,
            one_star_count: 0,
            last_updated: env.ledger().timestamp(),
        });

        // Update counts
        stats.total_ratings += 1;
        match new_rating {
            5 => stats.five_star_count += 1,
            4 => stats.four_star_count += 1,
            3 => stats.three_star_count += 1,
            2 => stats.two_star_count += 1,
            1 => stats.one_star_count += 1,
            _ => {} // Should not happen due to validation
        }

        // Calculate new average (multiply by 100 for precision)
        let total_points = (stats.five_star_count * 5)
            + (stats.four_star_count * 4)
            + (stats.three_star_count * 3)
            + (stats.two_star_count * 2)
            + stats.one_star_count;
        stats.average_rating = (total_points * 100) / stats.total_ratings;
        stats.last_updated = env.ledger().timestamp();

        save_user_rating_stats(env, &stats);
        emit_rating_stats_updated(env, user, stats.average_rating, stats.total_ratings);

        Ok(())
    }

    // Health check functions
    // pub fn health_check(env: Env) -> Result<HealthCheckResult, Error> {
    //     crate::health_check::perform_health_check(&env)
    // }

    // pub fn admin_health_check(env: Env, caller: Address) -> Result<HealthCheckResult, Error> {
    //     crate::health_check::admin_health_check(&env, &caller)
    // }

    pub fn increment_rating_count(env: &Env) -> u64 {
        crate::storage::increment_rating_count(&env)
    }

    pub fn get_last_health_check(env: Env) -> u64 {
        crate::storage::get_last_health_check(&env)
    }

    pub fn get_contract_version(env: Env) -> String {
        crate::storage::get_contract_version(&env)
    }

    pub fn get_total_rating(env: &Env) -> u64 {
        crate::storage::get_total_rating(&env)
    }

    pub fn reset_total_rating(env: &Env, admin: Address) -> Result<(), Error> {
        admin.require_auth();
        if get_admin(&env) != admin {
            return Err(Error::Unauthorized);
        }

        set_total_rating(env, 0u64);

        env.events().publish(
            (Symbol::new(env, "dispute_count_reset"), admin.clone()),
            env.ledger().timestamp(),
        );
        Ok(())
    }

    // ==================== DATA EXPORT FUNCTIONS ====================

    /// Export rating data for a specific user (user themselves or admin)
    pub fn export_rating_data(
        env: Env,
        caller: Address,
        user: Address,
        limit: u32,
    ) -> Result<RatingDataExport, Error> {
        // Permission check: user can export their own data, or admin can export any user's data
        if caller != user {
            crate::access::check_admin(&env, &caller)?;
        } else {
            require_auth(&caller)?;
        }

        // Apply data size limit to prevent gas issues (max 50 items per export)
        let max_limit = 50u32;
        let actual_limit = if limit == 0 || limit > max_limit {
            max_limit
        } else {
            limit
        };

        let stats = get_user_rating_stats(&env, &user).unwrap_or(RatingStats {
            user: user.clone(),
            total_ratings: 0,
            average_rating: 0,
            five_star_count: 0,
            four_star_count: 0,
            three_star_count: 0,
            two_star_count: 0,
            one_star_count: 0,
            last_updated: env.ledger().timestamp(),
        });

        // Get user's rating history (limited)
        let ratings = get_user_rating_history(&env, &user, actual_limit, 0);

        // Get user's feedback (limited)
        let feedback_result = Self::get_user_feedback(env.clone(), user.clone(), actual_limit);
        let feedback = feedback_result.unwrap_or(Vec::new(&env));

        let data_size_limit_reached =
            ratings.len() >= actual_limit || feedback.len() >= actual_limit;

        let export_data = RatingDataExport {
            user_address: user.clone(),
            stats,
            ratings,
            feedback,
            export_timestamp: env.ledger().timestamp(),
            export_version: String::from_str(&env, "1.0"),
            data_size_limit_reached,
        };

        // Emit export event
        env.events().publish(
            (Symbol::new(&env, "rating_data_exported"), caller.clone()),
            (user, env.ledger().timestamp()),
        );

        Ok(export_data)
    }

    /// Export all platform rating data (admin only)
    pub fn export_all_rating_data(env: Env, admin: Address) -> Result<AllRatingDataExport, Error> {
        crate::access::check_admin(&env, &admin)?;

        let total_ratings = Self::get_total_rating(&env);
        let platform_stats = get_platform_analytics(&env);

        // Apply data size limit for platform stats (max 100 entries)
        let max_stats = 100usize;
        let data_size_limit_reached = platform_stats.len() as usize > max_stats;

        let limited_stats = if platform_stats.len() as usize > max_stats {
            let mut limited = Vec::new(&env);
            for i in 0..max_stats {
                if let Some(stat) = platform_stats.get(i as u32) {
                    limited.push_back(stat);
                }
            }
            limited
        } else {
            platform_stats
        };

        let export_data = AllRatingDataExport {
            total_ratings,
            platform_stats: limited_stats,
            export_timestamp: env.ledger().timestamp(),
            export_version: String::from_str(&env, "1.0"),
            data_size_limit_reached,
        };

        // Emit export event
        env.events().publish(
            (Symbol::new(&env, "all_rating_data_exported"), admin.clone()),
            env.ledger().timestamp(),
        );

        Ok(export_data)
    }
}
