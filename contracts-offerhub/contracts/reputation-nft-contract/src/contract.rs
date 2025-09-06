use crate::access::{
    add_minter as add_minter_impl, check_minter, check_owner, remove_minter as remove_minter_impl,
    transfer_admin as transfer_admin_impl,
};

use crate::events::{emit_minted, emit_transferred, emit_achievement_minted , emit_reputaion_contract_initiated};

use crate::metadata::{get_metadata as get_token_metadata, store_metadata};
use crate::storage::{
    get_admin, get_token_owner, is_minter, next_token_id, save_admin, save_token_owner,
    token_exists,
};
use crate::{Error, Metadata, TokenId};
use soroban_sdk::{symbol_short, Address, Env, String, Symbol, Vec};

pub struct ReputationNFTContract;

impl ReputationNFTContract {
    pub fn init(env: Env, admin: Address) -> Result<(), Error> {
        save_admin(&env, &admin);
       emit_reputaion_contract_initiated(&env, &admin);
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
        store_metadata(&env, &token_id, name, description, uri)?;
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
        store_metadata(&env, &token_id, name, description, uri)?;
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

        // Update ownership
        save_token_owner(&env, &token_id, &to);

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
        store_metadata(&env, &token_id, name, description, uri)?;

        // Index by user for easy retrieval
        Self::index_user_achievement(&env, &to, &token_id);

        emit_achievement_minted(&env, &to, &Symbol::new(&env, "achievement"), &token_id);
        Ok(())
    }

    pub fn get_user_achievements(env: Env, _user: Address) -> Result<Vec<TokenId>, Error> {
        // In production, this would retrieve all achievements for a user
        // For now, return empty vector - would need proper indexing implementation
        Ok(Vec::new(&env))
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

        Ok(())
    }

    // Helper functions
    fn index_user_achievement(_env: &Env, _user: &Address, _token_id: &TokenId) {
        // In production, maintain an index of user achievements
        // This would use a storage pattern like (USER_ACHIEVEMENTS, user, token_id) -> true
    }

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
        store_metadata(env, token_id, name, description, uri)?;
        emit_minted(env, user, token_id);

        Ok(())
    }
}
