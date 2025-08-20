use crate::storage::{get_token_metadata, save_token_metadata};
use crate::types::{Error, Metadata, TokenId, AchievementType};
use soroban_sdk::{Env, String};

pub fn store_metadata(
    env: &Env,
    token_id: &TokenId,
    name: String,
    description: String,
    uri: String,
    achievement_type: Option<AchievementType>,
) -> Result<(), Error> {
    let metadata = Metadata {
        name,
        description,
        uri,
        achievement_type: achievement_type.unwrap_or(AchievementType::Standard),
    };
    save_token_metadata(env, token_id, &metadata);
    Ok(())
}

pub fn get_metadata(env: &Env, token_id: &TokenId) -> Result<Metadata, Error> {
    get_token_metadata(env, token_id)
}
