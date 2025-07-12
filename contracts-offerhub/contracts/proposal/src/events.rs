use soroban_sdk::{Address, Env, Symbol};

pub fn emit_proposal_submitted(
    env: &Env,
    freelancer: &Address,
    job_id: &u32,
    proposed_price: &u64,
    timestamp: &u64,
) {
    env.events().publish(
        (Symbol::new(env, "SUBMIT"), Symbol::new(env, "PROPOSAL")),
        (freelancer, job_id.clone(), proposed_price.clone(), timestamp.clone()),
    );
}

pub fn emit_proposal_removed(
    env: &Env,
    freelancer: &Address,
    job_id: &u32,
) {
    env.events().publish(
        (Symbol::new(env, "REMOVE"), Symbol::new(env, "PROPOSAL")),
        (freelancer, job_id.clone(), env.ledger().timestamp()),
    );
}

pub fn _emit_contract_initialized(
    env: &Env,
    admin: &Address,
    freelancer_registry: &Address,
) {
    env.events().publish(
        (Symbol::new(env, "INIT"), Symbol::new(env, "CONTRACT")),
        (admin, freelancer_registry),
    );
}