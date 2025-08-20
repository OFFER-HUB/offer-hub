use crate::types::{ADMIN, MINTER, TOKEN_METADATA, TOKEN_OWNER, USER_ACHIEVEMENTS, AchievementType, ACHIEVEMENT_LEADERBOARD, ACHIEVEMENT_STATS};
use crate::{Error, Metadata, TokenId};
use soroban_sdk::{Address, Bytes, BytesN, Env, Map, Vec};


pub fn save_token_owner(env: &Env, token_id: &TokenId, owner: &Address) {
    let key_bytes = create_token_key(env, TOKEN_OWNER, token_id);
    env.storage().persistent().set(&key_bytes, owner);
}

pub fn get_token_owner(env: &Env, token_id: &TokenId) -> Result<Address, Error> {
    let key_bytes = create_token_key(env, TOKEN_OWNER, token_id);
    if let Some(owner) = env
        .storage()
        .persistent()
        .get::<BytesN<32>, Address>(&key_bytes)
    {
        return Ok(owner);
    }
    Err(Error::TokenDoesNotExist)
}

pub fn token_exists(env: &Env, token_id: &TokenId) -> bool {
    let key_bytes = create_token_key(env, TOKEN_OWNER, token_id);
    env.storage().persistent().has(&key_bytes)
}

pub fn save_token_metadata(env: &Env, token_id: &TokenId, metadata: &Metadata) {
    let key_bytes = create_token_key(env, TOKEN_METADATA, token_id);
    env.storage().persistent().set(&key_bytes, metadata);
}

pub fn get_token_metadata(env: &Env, token_id: &TokenId) -> Result<Metadata, Error> {
    let key_bytes = create_token_key(env, TOKEN_METADATA, token_id);
    if let Some(metadata) = env
        .storage()
        .persistent()
        .get::<BytesN<32>, Metadata>(&key_bytes)
    {
        return Ok(metadata);
    }
    Err(Error::TokenDoesNotExist)
}
pub fn index_user_achievement(env: &Env, user: &Address, token_id: &TokenId) {
    let key = create_simple_key(env, USER_ACHIEVEMENTS);
    let mut map_data: Map<Address, Vec<TokenId>> = env
        .storage()
        .persistent()
        .get::<BytesN<32>, Map<Address, Vec<TokenId>>>(&key)
        .unwrap_or_else(|| Map::new(env));

    let mut list: Vec<TokenId> = map_data.get(user.clone()).unwrap_or_else(|| Vec::new(env));
    list.push_back(*token_id);
    map_data.set(user.clone(), list);
    env.storage().persistent().set(&key, &map_data);
}

pub fn remove_user_achievement_index(env: &Env, user: &Address, token_id: &TokenId) {
    let key = create_simple_key(env, USER_ACHIEVEMENTS);
    if let Some(mut map) = env
        .storage()
        .persistent()
        .get::<BytesN<32>, Map<Address, Vec<TokenId>>>(&key)
    {
        if let Some(list) = map.get(user.clone()) {
            let mut new_list: Vec<TokenId> = Vec::new(env);
            let mut i = 0u32;
            while i < list.len() {
                if let Some(v) = list.get(i) {
                    if v != *token_id {
                        new_list.push_back(v);
                    }
                }
                i += 1;
            }
            map.set(user.clone(), new_list);
            env.storage().persistent().set(&key, &map);
        }
    }
}

pub fn get_user_achievements(env: &Env, user: &Address) -> Vec<TokenId> {
    let key = create_simple_key(env, USER_ACHIEVEMENTS);
    if let Some(map) = env
        .storage()
        .persistent()
        .get::<BytesN<32>, Map<Address, Vec<TokenId>>>(&key)
    {
        return map.get(user.clone()).unwrap_or_else(|| Vec::new(env));
    }
    Vec::new(env)
}

pub fn burn_token(env: &Env, token_id: &TokenId) {
    let owner_key = create_token_key(env, TOKEN_OWNER, token_id);
    env.storage().persistent().remove(&owner_key);
    let meta_key = create_token_key(env, TOKEN_METADATA, token_id);
    env.storage().persistent().remove(&meta_key);
}

fn create_token_key(env: &Env, prefix: &[u8], token_id: &TokenId) -> BytesN<32> {
    let mut key_data = Bytes::new(env);
    key_data.extend_from_slice(prefix);
    key_data.extend_from_slice(&token_id.to_be_bytes());
    let hash = env.crypto().sha256(&key_data);
    BytesN::from_array(env, &hash.into())
}

pub fn save_admin(env: &Env, admin: &Address) {
    let key_bytes = create_simple_key(env, ADMIN);
    env.storage().persistent().set(&key_bytes, admin);
}

pub fn get_admin(env: &Env) -> Address {
    let key_bytes = create_simple_key(env, ADMIN);
    env.storage().persistent().get(&key_bytes).unwrap()
}

pub fn is_admin(env: &Env, address: &Address) -> bool {
    let admin = get_admin(env);
    &admin == address
}

pub fn add_minter(env: &Env, minter: &Address) {
    let key_bytes = create_simple_key(env, MINTER);
    let mut minters = get_minters(env);
    minters.set(minter.clone(), true);
    env.storage().persistent().set(&key_bytes, &minters);
}

pub fn remove_minter(env: &Env, minter: &Address) {
    let key_bytes = create_simple_key(env, MINTER);
    let mut minters = get_minters(env);
    minters.remove(minter.clone());
    env.storage().persistent().set(&key_bytes, &minters);
}

pub fn is_minter(env: &Env, address: &Address) -> bool {
    let minters = get_minters(env);
    minters.contains_key(address.clone())
}

fn get_minters(env: &Env) -> Map<Address, bool> {
    let key_bytes = create_simple_key(env, MINTER);
    env.storage()
        .persistent()
        .get(&key_bytes)
        .unwrap_or_else(|| Map::new(env))
}

fn create_simple_key(env: &Env, key_data: &[u8]) -> BytesN<32> {
    let mut key_bytes = Bytes::new(env);
    key_bytes.extend_from_slice(key_data);
    let hash = env.crypto().sha256(&key_bytes);
    BytesN::from_array(env, &hash.into())
}

const TOKEN_ID_COUNTER: &[u8] = &[4];

pub fn next_token_id(env: &Env) -> TokenId {
    let key_bytes = create_simple_key(env, TOKEN_ID_COUNTER);
    let mut counter: TokenId = env.storage().persistent().get(&key_bytes).unwrap_or(0);
    counter += 1;
    env.storage().persistent().set(&key_bytes, &counter);
    counter
}

// Achievement statistics functions
pub fn update_achievement_stats(env: &Env, achievement_type: &AchievementType) {
    let key = create_simple_key(env, ACHIEVEMENT_STATS);
    let mut stats = env.storage().persistent()
        .get::<BytesN<32>, Map<AchievementType, u32>>(&key)
        .unwrap_or_else(|| Map::new(env));
    
    let count = stats.get(achievement_type.clone()).unwrap_or(0);
    stats.set(achievement_type.clone(), count + 1);
    
    env.storage().persistent().set(&key, &stats);
}

pub fn get_achievement_stats(env: &Env) -> Map<AchievementType, u32> {
    let key = create_simple_key(env, ACHIEVEMENT_STATS);
    env.storage().persistent()
        .get(&key)
        .unwrap_or_else(|| Map::new(env))
}

// Leaderboard functions
pub fn update_leaderboard(env: &Env, user: &Address) {
    let key = create_simple_key(env, ACHIEVEMENT_LEADERBOARD);
    let mut leaderboard = env.storage().persistent()
        .get::<BytesN<32>, Map<Address, u32>>(&key)
        .unwrap_or_else(|| Map::new(env));
    
    let achievements = get_user_achievements(env, user);
    leaderboard.set(user.clone(), achievements.len() as u32);
    
    env.storage().persistent().set(&key, &leaderboard);
}

pub fn get_leaderboard(env: &Env) -> Map<Address, u32> {
    let key = create_simple_key(env, ACHIEVEMENT_LEADERBOARD);
    env.storage().persistent()
        .get(&key)
        .unwrap_or_else(|| Map::new(env))
}

pub fn get_user_rank(env: &Env, user: &Address) -> u32 {
    let leaderboard = get_leaderboard(env);
    let user_score = leaderboard.get(user.clone()).unwrap_or(0);
    
    let mut rank = 1;
    for (_, score) in leaderboard.iter() {
        if score > user_score {
            rank += 1;
        }
    }
    rank
}
