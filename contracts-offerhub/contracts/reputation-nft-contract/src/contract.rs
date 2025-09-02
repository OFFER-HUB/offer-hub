use crate::access::{
    add_minter as add_minter_impl, check_minter, check_owner, remove_minter as remove_minter_impl,
    transfer_admin as transfer_admin_impl,
};
use crate::events::{emit_achievement_minted, emit_burned, emit_minted, emit_transferred};
use crate::metadata::{get_metadata as get_token_metadata, store_metadata};
use crate::storage::{
    burn_token, get_achievement_stats, get_admin, get_leaderboard, get_token_owner,
    get_user_achievements, get_user_rank, index_user_achievement, is_minter, next_token_id,
    remove_user_achievement_index, save_admin, save_token_owner, token_exists,
    update_achievement_stats, update_leaderboard,
};
use crate::types::AchievementType;
use crate::{Error, Metadata, TokenId};
use soroban_sdk::symbol_short;
use soroban_sdk::{Address, Env, Map, String, Symbol, Vec};

pub struct ReputationNFTContract;

impl ReputationNFTContract {
    pub fn init(env: Env, admin: Address) -> Result<(), Error> {
        save_admin(&env, &admin);
        Ok(())
    }

    pub fn mint(
        env: Env,
        caller: Address,
        to: Address,
        token_id: TokenId,
        name: String,
        description: String,
        uri: String,
    ) -> Result<(), Error> {
        check_minter(&env, &caller)?;
        if token_exists(&env, &token_id) {
            return Err(Error::TokenAlreadyExists);
        }
        save_token_owner(&env, &token_id, &to);
        store_metadata(
            &env,
            &token_id,
            name,
            description,
            uri,
            Some(AchievementType::Standard),
        )?;
        // index achievement for user if this is an achievement token
        index_user_achievement(&env, &to, &token_id);
        update_achievement_stats(&env, &AchievementType::Standard);
        emit_minted(&env, &to, &token_id);
        Ok(())
    }

    pub fn mint_achv(
        env: Env,
        caller: Address,
        to: Address,
        nft_type: Symbol,
    ) -> Result<(), Error> {
        check_minter(&env, &caller)?;
        let token_id = next_token_id(&env);
        let (name, description, uri) = match &nft_type {
            s if *s == symbol_short!("tencontr") => (
                String::from_str(&env, "10 Completed Contracts"),
                String::from_str(&env, "Awarded for completing 10 contracts successfully."),
                String::from_str(&env, "ipfs://10-completed-contracts"),
            ),
            s if *s == symbol_short!("5stars5x") => (
                String::from_str(&env, "5 Stars 5 Times"),
                String::from_str(&env, "Awarded for receiving five 5-star reviews."),
                String::from_str(&env, "ipfs://5-stars-5-times"),
            ),
            s if *s == symbol_short!("toprated") => (
                String::from_str(&env, "Top Rated Freelancer"),
                String::from_str(&env, "Awarded for being a top-rated freelancer."),
                String::from_str(&env, "ipfs://top-rated-freelancer"),
            ),
            _ => (
                String::from_str(&env, "Achievement NFT"),
                String::from_str(&env, "Awarded for a special achievement."),
                String::from_str(&env, "ipfs://achievement-generic"),
            ),
        };
        save_token_owner(&env, &token_id, &to);
        store_metadata(
            &env,
            &token_id,
            name,
            description,
            uri,
            Some(AchievementType::ProjectMilestone),
        )?;
        index_user_achievement(&env, &to, &token_id);
        update_achievement_stats(&env, &AchievementType::ProjectMilestone);
        emit_achievement_minted(&env, &to, &nft_type, &token_id);
        Ok(())
    }

    pub fn transfer(env: Env, from: Address, to: Address, token_id: TokenId) -> Result<(), Error> {
        // Check if token exists and get owner
        let owner = get_token_owner(&env, &token_id)?;

        // Validate that from is the owner
        if owner != from {
            return Err(Error::Unauthorized);
        }

        // Check authorization from the owner
        check_owner(&env, &from)?;

        // Check if token is transferable based on achievement type
        let metadata = get_token_metadata(&env, &token_id)?;
        match metadata.achievement_type {
            AchievementType::Standard | AchievementType::CustomAchievement => {
                // These types can be transferred
            }
            _ => {
                // Other achievement types are non-transferable
                return Err(Error::NonTransferableToken);
            }
        }

        // Update ownership and achievements
        save_token_owner(&env, &token_id, &to);
        remove_user_achievement_index(&env, &from, &token_id);
        index_user_achievement(&env, &to, &token_id);

        // Update leaderboard for both users
        update_leaderboard(&env, &from);
        update_leaderboard(&env, &to);

        // Emit transferred event
        emit_transferred(&env, &from, &to, &token_id);

        Ok(())
    }

    pub fn get_owner(env: Env, token_id: TokenId) -> Result<Address, Error> {
        get_token_owner(&env, &token_id)
    }

    pub fn get_metadata(env: Env, token_id: TokenId) -> Result<Metadata, Error> {
        get_token_metadata(&env, &token_id)
    }

    pub fn add_minter(env: Env, caller: Address, minter: Address) -> Result<(), Error> {
        add_minter_impl(&env, &caller, &minter)
    }

    pub fn remove_minter(env: Env, caller: Address, minter: Address) -> Result<(), Error> {
        remove_minter_impl(&env, &caller, &minter)
    }

    pub fn is_minter(env: Env, address: Address) -> Result<bool, Error> {
        Ok(is_minter(&env, &address))
    }

    pub fn get_admin(env: Env) -> Result<Address, Error> {
        Ok(get_admin(&env))
    }

    pub fn transfer_admin(env: Env, caller: Address, new_admin: Address) -> Result<(), Error> {
        transfer_admin_impl(&env, &caller, &new_admin)
    }

    /// New rating-based achievement functions
    pub fn mint_rating_achievement(
        env: Env,
        caller: Address,
        to: Address,
        achievement_type: String,
        _rating_data: String,
    ) -> Result<(), Error> {
        check_minter(&env, &caller)?;

        let token_id = next_token_id(&env);

        // Since to_string() is not available in Soroban, we'll do direct string comparison
        let first_five_star = String::from_str(&env, "first_five_star");
        let ten_ratings = String::from_str(&env, "ten_ratings");
        let top_rated_professional = String::from_str(&env, "top_rated_professional");
        let rating_consistency = String::from_str(&env, "rating_consistency");

        let (name, description, uri) = if achievement_type == first_five_star {
            (
                String::from_str(&env, "First Five Star Rating"),
                String::from_str(&env, "Awarded for receiving first 5-star rating"),
                String::from_str(&env, "ipfs://first-five-star"),
            )
        } else if achievement_type == ten_ratings {
            (
                String::from_str(&env, "Ten Ratings Milestone"),
                String::from_str(&env, "Awarded for receiving 10 ratings"),
                String::from_str(&env, "ipfs://ten-ratings"),
            )
        } else if achievement_type == top_rated_professional {
            (
                String::from_str(&env, "Top Rated Professional"),
                String::from_str(&env, "Awarded for maintaining excellent ratings"),
                String::from_str(&env, "ipfs://top-rated-pro"),
            )
        } else if achievement_type == rating_consistency {
            (
                String::from_str(&env, "Consistency Master"),
                String::from_str(&env, "Awarded for consistent high-quality ratings"),
                String::from_str(&env, "ipfs://consistency-master"),
            )
        } else {
            (
                String::from_str(&env, "Rating Achievement"),
                String::from_str(&env, "Special rating-based achievement"),
                String::from_str(&env, "ipfs://rating-achievement"),
            )
        };

        save_token_owner(&env, &token_id, &to);
        store_metadata(
            &env,
            &token_id,
            name,
            description,
            uri,
            Some(AchievementType::RatingMilestone),
        )?;

        // Index by user for easy retrieval and update statistics
        index_user_achievement(&env, &to, &token_id);
        update_achievement_stats(&env, &AchievementType::RatingMilestone);

        emit_achievement_minted(&env, &to, &Symbol::new(&env, "achievement"), &token_id);
        Ok(())
    }

    pub fn get_user_achievements(env: Env, _user: Address) -> Result<Vec<TokenId>, Error> {
        Ok(get_user_achievements(&env, &_user))
    }

    pub fn burn(env: Env, caller: Address, token_id: TokenId) -> Result<(), Error> {
        // Only admin or minter can burn
        check_minter(&env, &caller)?;
        // get owner to remove index
        let owner = get_token_owner(&env, &token_id)?;
        remove_user_achievement_index(&env, &owner, &token_id);
        burn_token(&env, &token_id);
        emit_burned(&env, &token_id, &owner);
        Ok(())
    }

    pub fn batch_mint(
        env: Env,
        caller: Address,
        tos: Vec<Address>,
        names: Vec<String>,
        descriptions: Vec<String>,
        uris: Vec<String>,
    ) -> Result<(), Error> {
        check_minter(&env, &caller)?;
        let len = tos.len();
        if names.len() != len || descriptions.len() != len || uris.len() != len {
            return Err(Error::Unauthorized);
        }
        let mut i = 0u32;
        while i < len {
            let to = tos.get(i).ok_or(Error::TokenDoesNotExist)?;
            let name = names.get(i).ok_or(Error::TokenDoesNotExist)?;
            let description = descriptions.get(i).ok_or(Error::TokenDoesNotExist)?;
            let uri = uris.get(i).ok_or(Error::TokenDoesNotExist)?;
            let token_id = next_token_id(&env);
            save_token_owner(&env, &token_id, &to);
            store_metadata(
                &env,
                &token_id,
                name,
                description,
                uri,
                Some(AchievementType::Standard),
            )?;
            index_user_achievement(&env, &to, &token_id);
            update_achievement_stats(&env, &AchievementType::Standard);
            emit_minted(&env, &to, &token_id);
            i += 1;
        }
        // Optionally emit a batch event - build simple owners/token_ids lists is expensive, skip for now
        Ok(())
    }

    pub fn update_reputation_score(
        env: Env,
        caller: Address,
        user: Address,
        rating_average: u32,
        total_ratings: u32,
    ) -> Result<(), Error> {
        check_minter(&env, &caller)?;

        // Store reputation score data
        Self::store_reputation_score(&env, &user, rating_average, total_ratings);

        // Check for new achievements based on updated scores
        Self::check_rating_achievements(&env, &user, rating_average, total_ratings)?;

        // Update leaderboard
        update_leaderboard(&env, &user);

        Ok(())
    }

    // Achievement statistics and leaderboard functions
    pub fn get_achievement_statistics(env: Env) -> Map<AchievementType, u32> {
        get_achievement_stats(&env)
    }

    pub fn get_achievement_leaderboard(env: Env) -> Map<Address, u32> {
        get_leaderboard(&env)
    }

    pub fn get_user_achievement_rank(env: Env, user: Address) -> u32 {
        get_user_rank(&env, &user)
    }

    // Helper functions
    // index_user_achievement is provided by storage helpers

    fn store_reputation_score(env: &Env, user: &Address, rating_average: u32, total_ratings: u32) {
        // Store the user's current reputation score
        let reputation_data = (rating_average, total_ratings, env.ledger().timestamp());
        let reputation_key = (String::from_str(env, "user_reputation"), user);
        env.storage()
            .persistent()
            .set(&reputation_key, &reputation_data);
    }

    fn check_rating_achievements(
        env: &Env,
        user: &Address,
        rating_average: u32,
        total_ratings: u32,
    ) -> Result<(), Error> {
        // Auto-award achievements based on rating milestones
        if total_ratings == 10 && rating_average >= 400 {
            // Award 10 ratings milestone
            let token_id = next_token_id(env);
            Self::mint_milestone_nft(env, user, &token_id, "ten_excellent")?;
        }

        if rating_average >= 480 && total_ratings >= 20 {
            // Award top-rated professional
            let token_id = next_token_id(env);
            Self::mint_milestone_nft(env, user, &token_id, "top_rated_pro")?;
        }

        if total_ratings >= 50 && rating_average >= 450 {
            // Award veteran achievement
            let token_id = next_token_id(env);
            Self::mint_milestone_nft(env, user, &token_id, "veteran_pro")?;
        }

        Ok(())
    }

    fn mint_milestone_nft(
        env: &Env,
        user: &Address,
        token_id: &TokenId,
        milestone_type: &str,
    ) -> Result<(), Error> {
        let (name, description, uri) = match milestone_type {
            "ten_excellent" => (
                String::from_str(env, "Excellence Milestone"),
                String::from_str(env, "Awarded for 10+ excellent ratings"),
                String::from_str(env, "ipfs://excellence-milestone"),
            ),
            "top_rated_pro" => (
                String::from_str(env, "Top Rated Professional"),
                String::from_str(env, "Awarded for exceptional rating performance"),
                String::from_str(env, "ipfs://top-rated-professional"),
            ),
            "veteran_pro" => (
                String::from_str(env, "Veteran Professional"),
                String::from_str(env, "Awarded for long-term excellent performance"),
                String::from_str(env, "ipfs://veteran-professional"),
            ),
            _ => return Ok(()), // Skip unknown types
        };

        save_token_owner(env, token_id, user);
        store_metadata(
            env,
            token_id,
            name,
            description,
            uri,
            Some(AchievementType::RatingMilestone),
        )?;
        // Index the achievement and update statistics
        index_user_achievement(env, user, token_id);
        update_achievement_stats(env, &AchievementType::RatingMilestone);
        emit_minted(env, user, token_id);

        Ok(())
    }
}
