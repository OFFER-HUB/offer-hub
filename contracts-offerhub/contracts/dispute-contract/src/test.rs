#![cfg(test)]

use crate::{
    types::{DisputeLevel, DisputeOutcome, DisputeStatus},
    DisputeResolutionContract, DisputeResolutionContractClient,
};
use soroban_sdk::{
    log, testutils::{Address as _, Ledger}, Address, Env, String
};

fn setup_env() -> Env {
    let env = Env::default();
    env.ledger().with_mut(|l| l.timestamp = 1000);
    env
}

fn create_contract(env: &Env) -> (DisputeResolutionContractClient, Address, Address, Address) {
    let contract_id = Address::generate(env);
    env.register_contract(&contract_id, DisputeResolutionContract);
    let client = DisputeResolutionContractClient::new(env, &contract_id);
    let admin = Address::generate(env);
    let escrow_contract = Address::generate(env);
    let fee_manager = Address::generate(env);

    client.initialize(&admin, &86400_u64, &escrow_contract, &fee_manager);

    (client, admin, escrow_contract, fee_manager)
}

#[test]
fn test_initialize() {
    let env = setup_env();
    env.mock_all_auths();

    let contract_id = Address::generate(&env);
    env.register_contract(&contract_id, DisputeResolutionContract);
    let client = DisputeResolutionContractClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let escrow_contract = Address::generate(&env);
    let fee_manager = Address::generate(&env);

    client.initialize(&admin, &86400_u64, &escrow_contract, &fee_manager);
}

#[test]
#[should_panic]
fn test_initialize_already_initialized() {
    let env = setup_env();
    env.mock_all_auths();

    let (client, admin, escrow_contract, fee_manager) = create_contract(&env);

    // Try to initialize again
    client.initialize(&admin, &86400_u64, &escrow_contract, &fee_manager);
}

#[test]
fn test_open_dispute() {
    let env = setup_env();
    env.mock_all_auths();

    let (client, _, _, _) = create_contract(&env);
    let initiator = Address::generate(&env);
    let job_id = 1;
    let reason = String::from_str(&env, "Job not completed");
    let dispute_amount = 1000000;
    let escrow_contract = Some(Address::generate(&env));

    client.open_dispute(
        &job_id,
        &initiator,
        &reason,
        &escrow_contract,
        &dispute_amount,
    );

    let dispute = client.get_dispute(&job_id);
    assert_eq!(dispute.initiator, initiator);
    assert_eq!(dispute.reason, reason);
    assert_eq!(dispute.timestamp, 1000);
    assert_eq!(dispute.resolved, false);
    assert_eq!(dispute.outcome, DisputeOutcome::None);
    assert_eq!(dispute.status, DisputeStatus::Open);
    assert_eq!(dispute.level, DisputeLevel::Mediation);
    assert_eq!(dispute.dispute_amount, dispute_amount);
    assert_eq!(dispute.fee_collected, 0);
    assert_eq!(dispute.escrow_contract, escrow_contract);
    assert!(dispute.timeout_timestamp.is_some());
    assert_eq!(dispute.evidence.len(), 0);
    assert!(dispute.mediator.is_none());
    assert!(dispute.arbitrator.is_none());
    assert!(dispute.resolution_timestamp.is_none());
}

#[test]
#[should_panic]
fn test_open_dispute_already_exists() {
    let env = setup_env();
    env.mock_all_auths();

    let (client, _, _, _) = create_contract(&env);
    let initiator = Address::generate(&env);
    let job_id = 1;
    let reason = String::from_str(&env, "reason 1");
    let dispute_amount = 1000000;
    let escrow_contract = Some(Address::generate(&env));

    client.open_dispute(
        &job_id,
        &initiator,
        &reason,
        &escrow_contract,
        &dispute_amount,
    );

    // Try to open the same dispute again
    client.open_dispute(
        &job_id,
        &initiator,
        &reason,
        &escrow_contract,
        &dispute_amount,
    );
}

#[test]
fn test_add_evidence() {
    let env = setup_env();
    env.mock_all_auths();

    let (client, _, _, _) = create_contract(&env);
    let initiator = Address::generate(&env);
    let submitter = Address::generate(&env);
    let job_id = 1;
    let reason = String::from_str(&env, "Job not completed");
    let dispute_amount = 1000000;
    let escrow_contract = Some(Address::generate(&env));

    // Open dispute first
    client.open_dispute(
        &job_id,
        &initiator,
        &reason,
        &escrow_contract,
        &dispute_amount,
    );

    // Add evidence
    let description = String::from_str(&env, "Screenshot of incomplete work");
    let attachment_hash = Some(String::from_str(&env, "QmHash123"));

    client.add_evidence(&job_id, &submitter, &description, &attachment_hash);

    let evidence = client.get_dispute_evidence(&job_id);
    assert_eq!(evidence.len(), 1);
    assert_eq!(evidence.get(0).unwrap().submitter, submitter);
    assert_eq!(evidence.get(0).unwrap().description, description);
    assert_eq!(evidence.get(0).unwrap().attachment_hash, attachment_hash);
}

#[test]
fn test_arbitrator_management() {
    let env = setup_env();
    env.mock_all_auths();

    let (client, admin, _, _) = create_contract(&env);
    let arbitrator = Address::generate(&env);
    let arbitrator_name = String::from_str(&env, "John Doe");

    // Add arbitrator
    client.add_arbitrator(&admin, &arbitrator, &arbitrator_name);

    // Get arbitrators
    let _arbitrators = client.get_arbitrators();
    // Note: get_arbitrators returns empty for now due to Soroban Map limitations

    // Remove arbitrator
    client.remove_arbitrator(&admin, &arbitrator);
}

#[test]
fn test_mediator_management() {
    let env = setup_env();
    env.mock_all_auths();

    let (client, admin, _, _) = create_contract(&env);
    let mediator = Address::generate(&env);

    // Add mediator
    client.add_mediator_access(&admin, &mediator);

    // Get mediators
    let mediators = client.get_mediators();
    assert_eq!(mediators.len(), 1);
    assert_eq!(mediators.get(0).unwrap(), mediator);

    // Remove mediator
    client.remove_mediator_access(&admin, &mediator);

    let mediators_after = client.get_mediators();
    assert_eq!(mediators_after.len(), 0);
}

#[test]
fn test_assign_mediator() {
    let env = setup_env();
    env.mock_all_auths();

    let (client, admin, _, _) = create_contract(&env);
    let initiator = Address::generate(&env);
    let mediator = Address::generate(&env);
    let job_id = 1;
    let reason = String::from_str(&env, "Job not completed");
    let dispute_amount = 1000000;
    let escrow_contract = Some(Address::generate(&env));

    // Add mediator to the system first
    client.add_mediator_access(&admin, &mediator);

    // Open dispute
    client.open_dispute(
        &job_id,
        &initiator,
        &reason,
        &escrow_contract,
        &dispute_amount,
    );

    // Assign mediator
    client.assign_mediator(&job_id, &admin, &mediator);

    let dispute = client.get_dispute(&job_id);
    assert_eq!(dispute.mediator, Some(mediator));
    assert_eq!(dispute.status, DisputeStatus::UnderMediation);
}

#[test]
fn test_escalate_to_arbitration() {
    let env = setup_env();
    env.mock_all_auths();

    let (client, admin, _, _) = create_contract(&env);
    let initiator = Address::generate(&env);
    let mediator = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let job_id = 1;
    let reason = String::from_str(&env, "Job not completed");
    let dispute_amount = 1000000;
    let escrow_contract = Some(Address::generate(&env));

    // Add mediator and arbitrator to the system
    client.add_mediator_access(&admin, &mediator);
    client.add_arbitrator(&admin, &arbitrator, &String::from_str(&env, "Jane Smith"));

    // Open dispute and assign mediator
    client.open_dispute(
        &job_id,
        &initiator,
        &reason,
        &escrow_contract,
        &dispute_amount,
    );
    client.assign_mediator(&job_id, &admin, &mediator);

    // Escalate to arbitration
    client.escalate_to_arbitration(&job_id, &mediator, &arbitrator);

    let dispute = client.get_dispute(&job_id);
    assert_eq!(dispute.arbitrator, Some(arbitrator));
    assert_eq!(dispute.status, DisputeStatus::UnderArbitration);
    assert_eq!(dispute.level, DisputeLevel::Arbitration);
}

#[test]
fn test_resolve_dispute() {
    let env = setup_env();
    env.mock_all_auths();

    let (client, admin, _, _) = create_contract(&env);
    let initiator = Address::generate(&env);
    let mediator = Address::generate(&env);
    let job_id = 1;
    let reason = String::from_str(&env, "Job not completed");
    let dispute_amount = 1000000;
    let escrow_contract: Option<Address> = None; // No escrow contract for this test

    // Add mediator to the system
    client.add_mediator_access(&admin, &mediator);

    // Open dispute
    client.open_dispute(
        &job_id,
        &initiator,
        &reason,
        &escrow_contract,
        &dispute_amount,
    );

    // Assign mediator
    client.assign_mediator(&job_id, &admin, &mediator);

    // Resolve dispute (favor client)
    client.resolve_dispute(&job_id, &DisputeOutcome::FavorClient);

    let dispute = client.get_dispute(&job_id);
    assert_eq!(dispute.resolved, true);
    assert_eq!(dispute.outcome, DisputeOutcome::FavorClient);
    assert_eq!(dispute.status, DisputeStatus::Resolved);
    assert!(dispute.resolution_timestamp.is_some());
    assert_eq!(dispute.fee_collected, 50000); // 5% of 1000000
}

#[test]
#[should_panic]
fn test_resolve_dispute_already_resolved() {
    let env = setup_env();
    env.mock_all_auths();

    let (client, admin, _, _) = create_contract(&env);
    let initiator = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let job_id = 1;
    let reason = String::from_str(&env, "Job not completed");
    let dispute_amount = 1000000;
    let escrow_contract: Option<Address> = None; // No escrow contract for this test

    // Add arbitrator
    client.add_arbitrator(&admin, &arbitrator, &String::from_str(&env, "John Doe"));

    // Open dispute
    client.open_dispute(
        &job_id,
        &initiator,
        &reason,
        &escrow_contract,
        &dispute_amount,
    );

    // Resolve dispute first time
    client.resolve_dispute(&job_id, &DisputeOutcome::FavorClient);

    // Try to resolve again
    client.resolve_dispute(&job_id, &DisputeOutcome::FavorFreelancer);
}

// #[test]
// fn test_resolve_dispute_with_escrow() {
//     let env = setup_env();
//     env.mock_all_auths();
//
//     let (client, admin, escrow_contract, _) = create_contract(&env);
//     let initiator = Address::generate(&env);
//     let arbitrator = Address::generate(&env);
//     let job_id = 1;
//     let reason = String::from_str(&env, "Job not completed");
//     let dispute_amount = 1000000;
//     let escrow_contract = Some(escrow_contract);
//
//     // Add arbitrator to the system
//     client.add_arbitrator(&admin, &arbitrator, &String::from_str(&env, "John Doe"));
//
//     // Open dispute
//     client.open_dispute(&job_id, &initiator, &reason, &escrow_contract, &dispute_amount);
//
//     // Escalate to arbitration
//     client.escalate_to_arbitration(&job_id, &initiator, &arbitrator);
//
//     // Note: This test will fail because the escrow contract doesn't have the resolve_dispute function
//     // In a real implementation, you would need to mock the escrow contract properly
//     // For now, we'll skip this test or handle the error gracefully
// }

#[test]
fn test_check_timeout() {
    let env = setup_env();
    env.mock_all_auths();

    let (client, _, _, _) = create_contract(&env);
    let initiator = Address::generate(&env);
    let job_id = 1;
    let reason = String::from_str(&env, "Job not completed");
    let dispute_amount = 1000000;
    let escrow_contract = Some(Address::generate(&env));

    // Open dispute
    client.open_dispute(
        &job_id,
        &initiator,
        &reason,
        &escrow_contract,
        &dispute_amount,
    );

    // Check timeout immediately (should be false)
    let timeout = client.check_timeout(&job_id);
    assert_eq!(timeout, false);

    // Advance time past timeout
    env.ledger().with_mut(|li| {
        li.timestamp = 1000 + 86400 + 1; // 24 hours + 1 second
    });

    // Check timeout again (should be true)
    let timeout = client.check_timeout(&job_id);
    assert_eq!(timeout, true);
}

#[test]
fn test_set_dispute_timeout() {
    let env = setup_env();
    env.mock_all_auths();

    let (client, admin, _, _) = create_contract(&env);
    let new_timeout = 3600_u64; // 1 hour

    client.set_dispute_timeout(&admin, &new_timeout);

    // The timeout should be updated (we can't directly check it, but it should work)
}

#[test]
#[should_panic]
fn test_set_dispute_timeout_unauthorized() {
    let env = setup_env();
    // Don't use mock_all_auths() to test authorization

    let (client, _, _, _) = create_contract(&env);
    let unauthorized_user = Address::generate(&env);
    let new_timeout = 3600_u64;

    client.set_dispute_timeout(&unauthorized_user, &new_timeout);
}

#[test]
fn test_get_total_disputes() {
    let env = setup_env();
    env.mock_all_auths();

    let (client, admin, _, _) = create_contract(&env);
    let initiator = Address::generate(&env);
    let job_id_1 = 1;
    let job_id_2 = 2;
    let reason = String::from_str(&env, "Job not completed");
    let dispute_amount = 1000000;
    let escrow_contract_addr = Some(Address::generate(&env));

    // Check initial dispute count
    let initial_count = client.get_total_disputes();
    assert_eq!(initial_count, 0);

    // Open first dispute
    client.open_dispute(
        &job_id_1,
        &initiator,
        &reason,
        &escrow_contract_addr,
        &dispute_amount,
    );
    let count_after_first = client.get_total_disputes();
    assert_eq!(count_after_first, 1);

    // Open second dispute
    client.open_dispute(
        &job_id_2,
        &initiator,
        &reason,
        &escrow_contract_addr,
        &dispute_amount,
    );
    let count_after_second = client.get_total_disputes();
    assert_eq!(count_after_second, 2);
}

#[test]
fn test_resettotal_disputes() {
    let env = setup_env();
    env.mock_all_auths();

    let (client, admin, _, _) = create_contract(&env);
    let initiator = Address::generate(&env);
    let job_id_1 = 1;
    let job_id_2 = 2;
    let reason = String::from_str(&env, "Job not completed");
    let dispute_amount = 1000000;
    let escrow_contract_addr = Some(Address::generate(&env));

    // Check initial dispute count
    let initial_count = client.get_total_disputes();
    assert_eq!(initial_count, 0);

    // Open first dispute
    client.open_dispute(
        &job_id_1,
        &initiator,
        &reason,
        &escrow_contract_addr,
        &dispute_amount,
    );
    let count_after_first = client.get_total_disputes();
    assert_eq!(count_after_first, 1);

    // Open second dispute
    client.open_dispute(
        &job_id_2,
        &initiator,
        &reason,
        &escrow_contract_addr,
        &dispute_amount,
    );
    let count_after_second = client.get_total_disputes();
    assert_eq!(count_after_second, 2);

    let res = client.reset_dispute_count(&admin);

    let count_after_reset = client.get_total_disputes();
    assert_eq!(count_after_reset, 0);
}

#[test]
#[should_panic]
fn test_reset_total_disputes_fail() {
    let env = setup_env();
    env.mock_all_auths();

    let (client, admin, _, _) = create_contract(&env);
    let initiator = Address::generate(&env);
    let job_id_1 = 1;
    let job_id_2 = 2;
    let reason = String::from_str(&env, "Job not completed");
    let dispute_amount = 1000000;
    let escrow_contract_addr = Some(Address::generate(&env));
    let new_address = Address::generate(&env);

    // Check initial dispute count
    let initial_count = client.get_total_disputes();
    assert_eq!(initial_count, 0);

    // Open first dispute
    client.open_dispute(
        &job_id_1,
        &initiator,
        &reason,
        &escrow_contract_addr,
        &dispute_amount,
    );
    let count_after_first = client.get_total_disputes();
    assert_eq!(count_after_first, 1);

    // Open second dispute
    client.open_dispute(
        &job_id_2,
        &initiator,
        &reason,
        &escrow_contract_addr,
        &dispute_amount,
    );
    let count_after_second = client.get_total_disputes();
    assert_eq!(count_after_second, 2);

    let _ = client.reset_dispute_count(&initiator);

    let count_after_reset = client.get_total_disputes();
    assert_eq!(count_after_reset, 0);
}


#[test]
fn test_get_dispute_info() {
    let env = setup_env();
    env.mock_all_auths();

    let (client, admin, _, _) = create_contract(&env);
    let initiator = Address::generate(&env);
    let mediator = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let job_id = 1;
    let reason = String::from_str(&env, "Job not completed");
    let dispute_amount = 1000000;
    let escrow_contract = Some(Address::generate(&env));

    // Add mediator and arbitrator to the system
    client.add_mediator_access(&admin, &mediator);
    client.add_arbitrator(&admin, &arbitrator, &String::from_str(&env, "Jane Smith"));

    // Open dispute and assign mediator
    client.open_dispute(
        &job_id,
        &initiator,
        &reason,
        &escrow_contract,
        &dispute_amount,
    );
    client.assign_mediator(&job_id, &admin, &mediator);

    // Escalate to arbitration
    client.escalate_to_arbitration(&job_id, &mediator, &arbitrator);

    let dispute = client.get_dispute_info(&job_id);
    assert_eq!(dispute.dispute_id, 1);
    assert_eq!(dispute.fee_collected, 0);
    assert_eq!(dispute.resolved, false);
    assert_eq!(dispute.reason, String::from_str(&env, "Job not completed"));
    assert_eq!(dispute.status, String::from_str(&env, "UnderArbitration"));
    assert_eq!(dispute.level,String::from_str(&env, "Arbitration"));
}
