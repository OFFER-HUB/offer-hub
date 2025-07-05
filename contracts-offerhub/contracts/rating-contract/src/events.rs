use soroban_sdk::{Address, Env, Symbol, symbol_short};

/// Event topics for the Rating Contract
pub(crate) const RATING_SUB: Symbol = symbol_short!("RATINGSUB");

/// Emit an event when a rating is submitted
pub fn emit_rating_submitted(env: &Env, rater: &Address, target: &Address, job_id: u32, score: i32) {
    env.events()
        .publish((RATING_SUB, rater, target), (job_id, score));
}
