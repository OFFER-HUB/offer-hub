#![cfg(test)]

use super::*;
use crate::{ProposalContract, ProposalContractClient};
use soroban_sdk::{
    testutils::{Address as _, MockAuth, MockAuthInvoke},
    Address, Env, IntoVal, String,
};

#[contract]
pub struct MockFreelancerRegistry;

#[contractimpl]
impl MockFreelancerRegistry {
    pub fn is_registered(_env: Env, _freelancer: Address) -> bool {
        true 
    }
}

fn setup_contract<'a>() -> (Env, ProposalContractClient<'a>, Address) {
    let env = Env::default();
    
    let registry_id = env.register(MockFreelancerRegistry, ());
    
    let contract_id = env.register(ProposalContract, ());
    let client = ProposalContractClient::new(&env, &contract_id);
    
    (env, client, registry_id)
}

#[test]
fn test_initialize_contract() {
    let (env, client, registry_id) = setup_contract();
    
    let admin = Address::generate(&env);
    
    env.mock_auths(&[MockAuth {
        address: &admin,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "initialize",
            args: (admin.clone(), registry_id.clone()).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    
    let result = client.try_initialize(&admin, &registry_id);
    assert!(result.is_ok());
}

#[test]
fn test_submit_proposal_success() {
    let (env, client, registry_id) = setup_contract();
    
    let admin = Address::generate(&env);
    let freelancer = Address::generate(&env);
    
    env.mock_auths(&[MockAuth {
        address: &admin,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "initialize",
            args: (admin.clone(), registry_id.clone()).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    client.initialize(&admin, &registry_id);
    
    let job_id = 1u32;
    let message = String::from_str(&env, "I can complete this project efficiently");
    let proposed_price = 1500u64;
    
    env.mock_auths(&[MockAuth {
        address: &freelancer,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "submit_proposal",
            args: (freelancer.clone(), job_id, message.clone(), proposed_price).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    
    let result = client.try_submit_proposal(&freelancer, &job_id, &message, &proposed_price);
    assert!(result.is_ok());
    
    let stored_proposal = client.get_proposal(&job_id, &freelancer);
    assert!(stored_proposal.is_some());
    
    let proposal = stored_proposal.unwrap();
    assert_eq!(proposal.freelancer, freelancer);
    assert_eq!(proposal.message, message);
    assert_eq!(proposal.proposed_price, proposed_price);
    
    assert_eq!(client.get_proposal_count(&job_id), 1);
}

#[test]
fn test_submit_proposal_invalid_input() {
    let (env, client, registry_id) = setup_contract();
    
    let admin = Address::generate(&env);
    let freelancer = Address::generate(&env);
    
    env.mock_auths(&[MockAuth {
        address: &admin,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "initialize",
            args: (admin.clone(), registry_id.clone()).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    client.initialize(&admin, &registry_id);
    
    let job_id = 1u32;
    let empty_message = String::from_str(&env, "");
    let proposed_price = 1000u64;
    
    env.mock_auths(&[MockAuth {
        address: &freelancer,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "submit_proposal",
            args: (freelancer.clone(), job_id, empty_message.clone(), proposed_price).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    
    let result = client.try_submit_proposal(&freelancer, &job_id, &empty_message, &proposed_price);
    assert_eq!(result, Err(Ok(ProposalError::InvalidInput)));
}

#[test]
fn test_submit_duplicate_proposal() {
    let (env, client, registry_id) = setup_contract();
    
    let admin = Address::generate(&env);
    let freelancer = Address::generate(&env);
    
    env.mock_auths(&[MockAuth {
        address: &admin,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "initialize",
            args: (admin.clone(), registry_id.clone()).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    client.initialize(&admin, &registry_id);
    
    let job_id = 1u32;
    let message = String::from_str(&env, "My proposal");
    let proposed_price = 1000u64;
    
    env.mock_auths(&[MockAuth {
        address: &freelancer,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "submit_proposal",
            args: (freelancer.clone(), job_id, message.clone(), proposed_price).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    client.submit_proposal(&freelancer, &job_id, &message, &proposed_price);

    env.mock_auths(&[MockAuth {
        address: &freelancer,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "submit_proposal",
            args: (freelancer.clone(), job_id, message.clone(), proposed_price).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    
    let result = client.try_submit_proposal(&freelancer, &job_id, &message, &proposed_price);
    assert_eq!(result, Err(Ok(ProposalError::DuplicateProposal)));
}

#[test]
fn test_get_proposals_for_job() {
    let (env, client, registry_id) = setup_contract();
    
    let admin = Address::generate(&env);
    let freelancer1 = Address::generate(&env);
    let freelancer2 = Address::generate(&env);
    
    env.mock_auths(&[MockAuth {
        address: &admin,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "initialize",
            args: (admin.clone(), registry_id.clone()).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    client.initialize(&admin, &registry_id);
    
    let job_id = 1u32;
    let message1 = String::from_str(&env, "Proposal from freelancer 1");
    let message2 = String::from_str(&env, "Proposal from freelancer 2");
    let price1 = 1000u64;
    let price2 = 1200u64;
    
    env.mock_auths(&[
        MockAuth {
            address: &freelancer1,
            invoke: &MockAuthInvoke {
                contract: &client.address,
                fn_name: "submit_proposal",
                args: (freelancer1.clone(), job_id, message1.clone(), price1).into_val(&env),
                sub_invokes: &[],
            },
        },
        MockAuth {
            address: &freelancer2,
            invoke: &MockAuthInvoke {
                contract: &client.address,
                fn_name: "submit_proposal",
                args: (freelancer2.clone(), job_id, message2.clone(), price2).into_val(&env),
                sub_invokes: &[],
            },
        },
    ]);
    
    client.submit_proposal(&freelancer1, &job_id, &message1, &price1);
    client.submit_proposal(&freelancer2, &job_id, &message2, &price2);
    
    let proposals = client.get_proposals_for_job(&job_id);
    assert_eq!(proposals.len(), 2);
    assert_eq!(client.get_proposal_count(&job_id), 2);
    
    let mut found_freelancer1 = false;
    let mut found_freelancer2 = false;
    
    for i in 0..proposals.len() {
        let proposal = proposals.get(i).unwrap();
        if proposal.freelancer == freelancer1 {
            found_freelancer1 = true;
        }
        if proposal.freelancer == freelancer2 {
            found_freelancer2 = true;
        }
    }
    
    assert!(found_freelancer1);
    assert!(found_freelancer2);
}

#[test]
fn test_get_individual_proposal() {
    let (env, client, registry_id) = setup_contract();
    
    let admin = Address::generate(&env);
    let freelancer = Address::generate(&env);
    
    env.mock_auths(&[MockAuth {
        address: &admin,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "initialize",
            args: (admin.clone(), registry_id.clone()).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    client.initialize(&admin, &registry_id);
    
    let job_id = 1u32;
    let message = String::from_str(&env, "My detailed proposal");
    let proposed_price = 1500u64;
    
    env.mock_auths(&[MockAuth {
        address: &freelancer,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "submit_proposal",
            args: (freelancer.clone(), job_id, message.clone(), proposed_price).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    client.submit_proposal(&freelancer, &job_id, &message, &proposed_price);
    
    let proposal = client.get_proposal(&job_id, &freelancer);
    assert!(proposal.is_some());
    
    let proposal_data = proposal.unwrap();
    assert_eq!(proposal_data.freelancer, freelancer);
    assert_eq!(proposal_data.message, message);
    assert_eq!(proposal_data.proposed_price, proposed_price);
    
    let other_freelancer = Address::generate(&env);
    let no_proposal = client.get_proposal(&job_id, &other_freelancer);
    assert!(no_proposal.is_none());
}

#[test]
fn test_remove_proposal() {
    let (env, client, registry_id) = setup_contract();
    
    let admin = Address::generate(&env);
    let freelancer = Address::generate(&env);
    
    env.mock_auths(&[MockAuth {
        address: &admin,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "initialize",
            args: (admin.clone(), registry_id.clone()).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    client.initialize(&admin, &registry_id);
    
    let job_id = 1u32;
    let message = String::from_str(&env, "Test proposal");
    let proposed_price = 1000u64;
    
    env.mock_auths(&[MockAuth {
        address: &freelancer,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "submit_proposal",
            args: (freelancer.clone(), job_id, message.clone(), proposed_price).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    client.submit_proposal(&freelancer, &job_id, &message, &proposed_price);
    
    assert!(client.get_proposal(&job_id, &freelancer).is_some());
    assert_eq!(client.get_proposal_count(&job_id), 1);
    
    env.mock_auths(&[MockAuth {
        address: &admin,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "remove_proposal",
            args: (admin.clone(), job_id, freelancer.clone()).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    
    let result = client.try_remove_proposal(&admin, &job_id, &freelancer);
    assert!(result.is_ok());
    
    assert!(client.get_proposal(&job_id, &freelancer).is_none());
    assert_eq!(client.get_proposal_count(&job_id), 0);
}

#[test]
fn test_get_proposals_for_nonexistent_job() {
    let (env, client, registry_id) = setup_contract();
    
    let admin = Address::generate(&env);
    
    env.mock_auths(&[MockAuth {
        address: &admin,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "initialize",
            args: (admin.clone(), registry_id.clone()).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    client.initialize(&admin, &registry_id);
    
    let job_id = 999u32;
    let proposals = client.get_proposals_for_job(&job_id);
    assert_eq!(proposals.len(), 0);
    assert_eq!(client.get_proposal_count(&job_id), 0);
}

#[test]
fn test_initialize_already_initialized() {
    let (env, client, registry_id) = setup_contract();
    
    let admin = Address::generate(&env);
    
    env.mock_auths(&[MockAuth {
        address: &admin,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "initialize",
            args: (admin.clone(), registry_id.clone()).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    client.initialize(&admin, &registry_id);
    
    env.mock_auths(&[MockAuth {
        address: &admin,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "initialize",
            args: (admin.clone(), registry_id.clone()).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    
    let result = client.try_initialize(&admin, &registry_id);
    assert_eq!(result, Err(Ok(ProposalError::AlreadyInitialized)));
}