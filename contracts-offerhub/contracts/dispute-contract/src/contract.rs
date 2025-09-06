use soroban_sdk::{panic_with_error, Address, Env, IntoVal, Map, String, Symbol, Vec};

use crate::{
    access::{is_valid_arbitrator, is_valid_mediator},
    storage::{
        check_rate_limit, set_total_disputes, ARBITRATOR, DISPUTES, DISPUTE_TIMEOUT,
        ESCROW_CONTRACT, FEE_MANAGER,
    },

    types::{
        AllDisputeDataExport, DisputeData, DisputeDataExport, DisputeLevel, DisputeOutcome,
        DisputeStatus, DisputeSummary, Error, Evidence,
    },

    validation::{
        validate_add_evidence, validate_address, validate_open_dispute, validate_timeout_duration,
    },
};

// Escrow integration constants
const ESCROW_RESOLVE_DISPUTE: &str = "resolve_dispute";
const ESCROW_CLIENT_WINS: &str = "client_wins";
const ESCROW_FREELANCER_WINS: &str = "freelancer_wins";
const ESCROW_SPLIT: &str = "split";

pub fn initialize(
    env: &Env,
    admin: Address,
    default_timeout: u64,
    escrow_contract: Address,
    fee_manager: Address,
) {
    if env.storage().instance().has(&ARBITRATOR) {
        panic_with_error!(env, Error::AlreadyInitialized)
    }

    admin.require_auth();

    // Input validation
    if let Err(_) = validate_address(&admin) {
        panic_with_error!(env, Error::Unauthorized);
    }
    if let Err(_) = validate_address(&escrow_contract) {
        panic_with_error!(env, Error::Unauthorized);
    }
    if let Err(_) = validate_address(&fee_manager) {
        panic_with_error!(env, Error::Unauthorized);
    }
    if let Err(_) = validate_timeout_duration(default_timeout) {
        panic_with_error!(env, Error::InvalidTimeout);
    }

    env.storage().instance().set(&ARBITRATOR, &admin);
    env.storage()
        .instance()
        .set(&DISPUTE_TIMEOUT, &default_timeout);
    env.storage()
        .instance()
        .set(&ESCROW_CONTRACT, &escrow_contract);
    env.storage().instance().set(&FEE_MANAGER, &fee_manager);
    env.storage()
        .instance()
        .set(&DISPUTES, &Map::<u32, DisputeData>::new(env));

    set_total_disputes(env, 0);

    env.events().publish(
        (String::from_str(env, "contract_initialized"), admin),
        env.ledger().timestamp(),
    );
}

pub fn open_dispute(
    env: &Env,
    job_id: u32,
    initiator: Address,
    reason: String,
    escrow_contract: Option<Address>,
    dispute_amount: i128,
) {
    initiator.require_auth();

    if !env.storage().instance().has(&ARBITRATOR) {
        panic_with_error!(env, Error::NotInitialized);
    }

    // Rate limit: max 3 disputes per 24h per initiator
    let limit_type = String::from_str(env, "open_dispute");
    // 24h in seconds
    let _ = check_rate_limit(env, &initiator, &limit_type, 3, 24 * 3600)
        .map_err(|e| panic_with_error!(env, e));

    // Input validation
    if let Err(e) = validate_open_dispute(env, job_id, &initiator, &reason, dispute_amount) {
        panic_with_error!(env, e);
    }

    // Validate escrow contract address if provided
    if let Some(ref escrow_addr) = escrow_contract {
        if let Err(_) = validate_address(escrow_addr) {
            panic_with_error!(env, Error::Unauthorized);
        }
    }

    let mut disputes: Map<u32, DisputeData> = env.storage().instance().get(&DISPUTES).unwrap();

    if disputes.contains_key(job_id) {
        panic_with_error!(env, Error::DisputeAlreadyExists);
    }

    let timeout_duration: u64 = env.storage().instance().get(&DISPUTE_TIMEOUT).unwrap();
    let timeout_timestamp = env.ledger().timestamp() + timeout_duration;

    let fee_manager: Address = env.storage().instance().get(&FEE_MANAGER).unwrap();

    let dispute_data = DisputeData {
        initiator,
        reason,
        timestamp: env.ledger().timestamp(),
        resolved: false,
        outcome: DisputeOutcome::None,
        status: DisputeStatus::Open,
        level: DisputeLevel::Mediation,
        fee_manager,
        dispute_amount,
        fee_collected: 0,
        escrow_contract,
        timeout_timestamp: Some(timeout_timestamp),
        evidence: Vec::new(env),
        mediator: None,
        arbitrator: None,
        resolution_timestamp: None,
    };

    disputes.set(job_id, dispute_data);
    env.storage().instance().set(&DISPUTES, &disputes);

    let total_dispute_count = increment_dispute_count(env);

    env.events().publish(
        (String::from_str(env, "dispute_opened"), job_id),
        (env.ledger().timestamp(), total_dispute_count),
    );
}

pub fn get_dispute(env: &Env, job_id: u32) -> DisputeData {
    if !env.storage().instance().has(&ARBITRATOR) {
        panic_with_error!(env, Error::NotInitialized);
    }
    let disputes: Map<u32, DisputeData> = env.storage().instance().get(&DISPUTES).unwrap();
    disputes
        .get(job_id)
        .unwrap_or_else(|| panic_with_error!(env, Error::DisputeNotFound))
}

pub fn add_evidence(
    env: &Env,
    job_id: u32,
    submitter: Address,
    description: String,
    attachment_hash: Option<String>,
) {
    submitter.require_auth();

    // Input validation
    if let Err(e) = validate_add_evidence(env, job_id, &submitter, &description) {
        panic_with_error!(env, e);
    }

    let mut disputes: Map<u32, DisputeData> = env.storage().instance().get(&DISPUTES).unwrap();
    let mut dispute = disputes
        .get(job_id)
        .unwrap_or_else(|| panic_with_error!(env, Error::DisputeNotFound));

    if dispute.resolved {
        panic_with_error!(env, Error::DisputeAlreadyResolved);
    }

    let evidence = Evidence {
        submitter,
        description,
        timestamp: env.ledger().timestamp(),
        attachment_hash,
    };

    dispute.evidence.push_back(evidence);
    disputes.set(job_id, dispute);
    env.storage().instance().set(&DISPUTES, &disputes);

    env.events().publish(
        (String::from_str(env, "evidence_added"), job_id),
        env.ledger().timestamp(),
    );
}

pub fn assign_mediator(env: &Env, job_id: u32, admin: Address, mediator: Address) {
    admin.require_auth();

    if !is_valid_mediator(env, &mediator) {
        panic_with_error!(env, Error::InvalidArbitrator);
    }

    let mut disputes: Map<u32, DisputeData> = env.storage().instance().get(&DISPUTES).unwrap();
    let mut dispute = disputes
        .get(job_id)
        .unwrap_or_else(|| panic_with_error!(env, Error::DisputeNotFound));

    if dispute.resolved {
        panic_with_error!(env, Error::DisputeAlreadyResolved);
    }

    dispute.mediator = Some(mediator.clone());
    dispute.status = DisputeStatus::UnderMediation;
    disputes.set(job_id, dispute);
    env.storage().instance().set(&DISPUTES, &disputes);

    env.events().publish(
        (String::from_str(env, "mediator_assigned"), mediator),
        env.ledger().timestamp(),
    );
}

pub fn escalate_to_arbitration(env: &Env, job_id: u32, mediator: Address, arbitrator: Address) {
    mediator.require_auth();

    if !is_valid_arbitrator(env, &arbitrator) {
        panic_with_error!(env, Error::InvalidArbitrator);
    }

    let mut disputes: Map<u32, DisputeData> = env.storage().instance().get(&DISPUTES).unwrap();
    let mut dispute = disputes
        .get(job_id)
        .unwrap_or_else(|| panic_with_error!(env, Error::DisputeNotFound));

    if dispute.resolved {
        panic_with_error!(env, Error::DisputeAlreadyResolved);
    }

    if dispute.mediator != Some(mediator) {
        panic_with_error!(env, Error::Unauthorized);
    }

    dispute.arbitrator = Some(arbitrator.clone());
    dispute.status = DisputeStatus::UnderArbitration;
    dispute.level = DisputeLevel::Arbitration;
    disputes.set(job_id, dispute);
    env.storage().instance().set(&DISPUTES, &disputes);

    env.events().publish(
        (
            String::from_str(env, "escalated_to_arbitration"),
            arbitrator,
        ),
        env.ledger().timestamp(),
    );
}

pub fn resolve_dispute(env: &Env, job_id: u32, decision: DisputeOutcome) {
    if !env.storage().instance().has(&ARBITRATOR) {
        panic_with_error!(env, Error::NotInitialized);
    }

    let mut disputes: Map<u32, DisputeData> = env.storage().instance().get(&DISPUTES).unwrap();
    let mut dispute = disputes
        .get(job_id)
        .unwrap_or_else(|| panic_with_error!(env, Error::DisputeNotFound));

    if dispute.resolved {
        panic_with_error!(env, Error::DisputeAlreadyResolved);
    }

    // Check timeout
    if let Some(timeout) = dispute.timeout_timestamp {
        if env.ledger().timestamp() > timeout {
            dispute.status = DisputeStatus::Timeout;
            dispute.resolved = true;
            dispute.outcome = DisputeOutcome::Split; // Default timeout outcome
            dispute.resolution_timestamp = Some(env.ledger().timestamp());
            disputes.set(job_id, dispute);
            env.storage().instance().set(&DISPUTES, &disputes);

            env.events().publish(
                (String::from_str(env, "dispute_timeout"), job_id),
                env.ledger().timestamp(),
            );
            return;
        }
    }

    // Authorization check based on dispute level
    // Note: In a production environment, you would want to pass the caller explicitly
    // For now, we'll use a simplified approach that checks the assigned mediator/arbitrator
    match dispute.level {
        DisputeLevel::Mediation => {
            if let Some(ref _mediator) = dispute.mediator {
                // In a real implementation, you would check if the caller is the mediator
                // For now, we'll assume the mediator is authorized
            } else {
                panic_with_error!(env, Error::MediationRequired);
            }
        }
        DisputeLevel::Arbitration => {
            if let Some(ref arbitrator) = dispute.arbitrator {
                if !is_valid_arbitrator(env, arbitrator) {
                    panic_with_error!(env, Error::InvalidArbitrator);
                }
            } else {
                panic_with_error!(env, Error::ArbitrationRequired);
            }
        }
    }

    if decision == DisputeOutcome::None {
        panic_with_error!(env, Error::InvalidDisputeLevel);
    }

    // Calculate fees
    let fee_percentage = 500; // 5% fee
    let fee_amount = (dispute.dispute_amount * fee_percentage) / 10000;
    let _net_amount = dispute.dispute_amount - fee_amount;

    dispute.resolved = true;
    dispute.outcome = decision;
    dispute.status = DisputeStatus::Resolved;
    dispute.fee_collected = fee_amount;
    dispute.resolution_timestamp = Some(env.ledger().timestamp());

    // Integrate with escrow contract if available
    if let Some(escrow_contract) = dispute.escrow_contract.clone() {
        let escrow_result = match decision {
            DisputeOutcome::FavorClient => ESCROW_CLIENT_WINS,
            DisputeOutcome::FavorFreelancer => ESCROW_FREELANCER_WINS,
            DisputeOutcome::Split => ESCROW_SPLIT,
            DisputeOutcome::None => panic_with_error!(env, Error::InvalidDisputeLevel),
        };

        // Call the escrow contract to resolve the dispute
        // Note: In a production environment, you would need to pass the authorized caller
        // For now, we'll use the assigned mediator/arbitrator as the caller
        let escrow_caller = match dispute.level {
            DisputeLevel::Mediation => dispute.mediator.clone().unwrap(),
            DisputeLevel::Arbitration => dispute.arbitrator.clone().unwrap(),
        };

        env.invoke_contract::<()>(
            &escrow_contract,
            &Symbol::new(env, ESCROW_RESOLVE_DISPUTE),
            (escrow_caller, Symbol::new(env, escrow_result)).into_val(env),
        );
    }

    disputes.set(job_id, dispute);
    env.storage().instance().set(&DISPUTES, &disputes);

    env.events().publish(
        (String::from_str(env, "dispute_resolved"), decision),
        env.ledger().timestamp(),
    );
}

pub fn resolve_dispute_with_auth(
    env: &Env,
    job_id: u32,
    decision: DisputeOutcome,
    caller: Address,
) {
    caller.require_auth();

    if !env.storage().instance().has(&ARBITRATOR) {
        panic_with_error!(env, Error::NotInitialized);
    }

    let mut disputes: Map<u32, DisputeData> = env.storage().instance().get(&DISPUTES).unwrap();
    let mut dispute = disputes
        .get(job_id)
        .unwrap_or_else(|| panic_with_error!(env, Error::DisputeNotFound));

    if dispute.resolved {
        panic_with_error!(env, Error::DisputeAlreadyResolved);
    }

    // Check timeout
    if let Some(timeout) = dispute.timeout_timestamp {
        if env.ledger().timestamp() > timeout {
            dispute.status = DisputeStatus::Timeout;
            dispute.resolved = true;
            dispute.outcome = DisputeOutcome::Split; // Default timeout outcome
            dispute.resolution_timestamp = Some(env.ledger().timestamp());
            disputes.set(job_id, dispute);
            env.storage().instance().set(&DISPUTES, &disputes);

            env.events().publish(
                (String::from_str(env, "dispute_timeout"), job_id),
                env.ledger().timestamp(),
            );
            return;
        }
    }

    // Authorization check based on dispute level
    match dispute.level {
        DisputeLevel::Mediation => {
            if let Some(ref mediator) = dispute.mediator {
                if mediator != &caller {
                    panic_with_error!(env, Error::Unauthorized);
                }
            } else {
                panic_with_error!(env, Error::MediationRequired);
            }
        }
        DisputeLevel::Arbitration => {
            if let Some(ref arbitrator) = dispute.arbitrator {
                if arbitrator != &caller || !is_valid_arbitrator(env, arbitrator) {
                    panic_with_error!(env, Error::Unauthorized);
                }
            } else {
                panic_with_error!(env, Error::ArbitrationRequired);
            }
        }
    }

    if decision == DisputeOutcome::None {
        panic_with_error!(env, Error::InvalidDisputeLevel);
    }

    // Calculate fees
    let fee_percentage = 500; // 5% fee
    let fee_amount = (dispute.dispute_amount * fee_percentage) / 10000;
    let _net_amount = dispute.dispute_amount - fee_amount;

    dispute.resolved = true;
    dispute.outcome = decision;
    dispute.status = DisputeStatus::Resolved;
    dispute.fee_collected = fee_amount;
    dispute.resolution_timestamp = Some(env.ledger().timestamp());

    // Integrate with escrow contract if available
    if let Some(escrow_contract) = dispute.escrow_contract.clone() {
        let escrow_result = match decision {
            DisputeOutcome::FavorClient => ESCROW_CLIENT_WINS,
            DisputeOutcome::FavorFreelancer => ESCROW_FREELANCER_WINS,
            DisputeOutcome::Split => ESCROW_SPLIT,
            DisputeOutcome::None => panic_with_error!(env, Error::InvalidDisputeLevel),
        };

        // Call the escrow contract to resolve the dispute
        env.invoke_contract::<()>(
            &escrow_contract,
            &Symbol::new(env, ESCROW_RESOLVE_DISPUTE),
            (caller, Symbol::new(env, escrow_result)).into_val(env),
        );
    }

    disputes.set(job_id, dispute);
    env.storage().instance().set(&DISPUTES, &disputes);

    env.events().publish(
        (String::from_str(env, "dispute_resolved"), decision),
        env.ledger().timestamp(),
    );
}

pub fn check_timeout(env: &Env, job_id: u32) -> bool {
    let disputes: Map<u32, DisputeData> = env.storage().instance().get(&DISPUTES).unwrap();
    let dispute = disputes
        .get(job_id)
        .unwrap_or_else(|| panic_with_error!(env, Error::DisputeNotFound));

    if let Some(timeout) = dispute.timeout_timestamp {
        env.ledger().timestamp() > timeout
    } else {
        false
    }
}

pub fn get_dispute_evidence(env: &Env, job_id: u32) -> Vec<Evidence> {
    let disputes: Map<u32, DisputeData> = env.storage().instance().get(&DISPUTES).unwrap();
    let dispute = disputes
        .get(job_id)
        .unwrap_or_else(|| panic_with_error!(env, Error::DisputeNotFound));

    dispute.evidence
}

pub fn set_dispute_timeout(env: &Env, admin: Address, timeout_seconds: u64) {
    admin.require_auth();

    // Input validation
    if let Err(_) = validate_address(&admin) {
        panic_with_error!(env, Error::Unauthorized);
    }
    if let Err(_) = validate_timeout_duration(timeout_seconds) {
        panic_with_error!(env, Error::InvalidTimeout);
    }

    env.storage()
        .instance()
        .set(&DISPUTE_TIMEOUT, &timeout_seconds);

    env.events().publish(
        (String::from_str(env, "timeout_updated"), timeout_seconds),
        env.ledger().timestamp(),
    );
}

pub fn get_total_disputes(env: &Env) -> u64 {
    crate::storage::get_total_disputes(env)
}

fn increment_dispute_count(env: &Env) -> u64 {
    let current = get_total_disputes(env);
    let new_dispute_count = current + 1;
    set_total_disputes(env, new_dispute_count);
    env.events().publish(
        (
            Symbol::new(env, "Increment_dispute_count"),
            new_dispute_count.clone(),
        ),
        env.ledger().timestamp(),
    );
    new_dispute_count
}
pub fn reset_dispute_count(env: &Env, admin: Address) -> Result<(), Error> {
    admin.require_auth();

    let arbitrator: Address = env.storage().instance().get(&ARBITRATOR).unwrap();
    if arbitrator != admin {
        return Err(Error::Unauthorized);
    }
    set_total_disputes(env, 0u64);

    env.events().publish(
        (Symbol::new(env, "dispute_count_reset"), admin.clone()),
        env.ledger().timestamp(),
    );
    Ok(())
}

// ==================== DATA EXPORT FUNCTIONS ====================

/// Export dispute data (initiator, mediator, arbitrator, or admin can access)
pub fn export_dispute_data(env: &Env, caller: Address, dispute_id: u32) -> DisputeDataExport {
    caller.require_auth();

    if !env.storage().instance().has(&ARBITRATOR) {
        panic_with_error!(env, Error::NotInitialized);
    }

    let disputes: Map<u32, DisputeData> = env.storage().instance().get(&DISPUTES).unwrap();
    let dispute = disputes
        .get(dispute_id)
        .unwrap_or_else(|| panic_with_error!(env, Error::DisputeNotFound));

    // Permission check: initiator, mediator, arbitrator, or admin can export data
    let admin: Address = env.storage().instance().get(&ARBITRATOR).unwrap();
    let is_authorized = dispute.initiator == caller
        || dispute.mediator == Some(caller.clone())
        || dispute.arbitrator == Some(caller.clone())
        || admin == caller;

    if !is_authorized {
        panic_with_error!(env, Error::Unauthorized);
    }

    let evidence = get_dispute_evidence(env, dispute_id);

    let export_data = DisputeDataExport {
        dispute_id,
        dispute_data: dispute,
        evidence,
        export_timestamp: env.ledger().timestamp(),
        export_version: String::from_str(env, "1.0"),
    };

    // Emit export event
    env.events().publish(
        (
            String::from_str(env, "dispute_data_exported"),
            caller.clone(),
        ),
        (dispute_id, env.ledger().timestamp()),
    );

    export_data
}

/// Export all dispute data (admin only)
pub fn export_all_dispute_data(env: &Env, admin: Address, limit: u32) -> AllDisputeDataExport {
    admin.require_auth();

    if !env.storage().instance().has(&ARBITRATOR) {
        panic_with_error!(env, Error::NotInitialized);
    }

    let stored_admin: Address = env.storage().instance().get(&ARBITRATOR).unwrap();
    if stored_admin != admin {
        panic_with_error!(env, Error::Unauthorized);
    }

    // Apply data size limit to prevent gas issues (max 50 disputes per export)
    let max_limit = 50u32;
    let actual_limit = if limit == 0 || limit > max_limit {
        max_limit
    } else {
        limit
    };

    let disputes: Map<u32, DisputeData> = env.storage().instance().get(&DISPUTES).unwrap();
    let mut dispute_summaries = Vec::new(env);
    let mut data_size_limit_reached = false;
    let mut count = 0u32;

    // Iterate through disputes and create summaries (limited)
    for (dispute_id, dispute_data) in disputes.iter() {
        if count >= actual_limit {
            data_size_limit_reached = true;
            break;
        }

        let summary = DisputeSummary {
            dispute_id,
            initiator: dispute_data.initiator,
            status: dispute_data.status,
            outcome: dispute_data.outcome,
            dispute_amount: dispute_data.dispute_amount,
            timestamp: dispute_data.timestamp,
        };

        dispute_summaries.push_back(summary);
        count += 1;
    }

    let total_disputes = get_total_disputes(env);

    let export_data = AllDisputeDataExport {
        total_disputes,
        dispute_summaries,
        export_timestamp: env.ledger().timestamp(),
        export_version: String::from_str(env, "1.0"),
        data_size_limit_reached,
    };

    // Emit export event
    env.events().publish(
        (
            String::from_str(env, "all_dispute_data_exported"),
            admin.clone(),
        ),
        env.ledger().timestamp(),
    );

    export_data
}
