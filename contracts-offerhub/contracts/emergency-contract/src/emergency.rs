use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, vec, Address, Env, Symbol,
    Vec,
};

// Emergency contract types
#[contracttype]
pub struct EmergencyState {
    pub is_paused: bool,
    pub emergency_admin: Address,
    pub circuit_breaker_threshold: u32,
    pub suspicious_activity_count: u32,
    pub emergency_fund: u128,
    pub emergency_contacts: Vec<Address>,
    pub last_emergency_check: u64,
}

#[contracttype]
pub struct EmergencyAction {
    pub action_type: Symbol,
    pub timestamp: u64,
    pub admin_address: Address,
    pub description: Symbol,
}

#[contracttype]
pub struct RecoveryRequest {
    pub request_id: u32,
    pub user_address: Address,
    pub amount: u128,
    pub reason: Symbol,
    pub status: Symbol,
    pub timestamp: u64,
}

// Emergency action types
const EMERGENCY_PAUSE: Symbol = symbol_short!("PAUSE");
const EMERGENCY_UNPAUSE: Symbol = symbol_short!("UNPAUSE");
const CIRCUIT_BREAKER: Symbol = symbol_short!("CIRCUIT");

const EMERGENCY_WITHDRAWAL: Symbol = symbol_short!("WITHDRAW");

// Status constants
const STATUS_PENDING: Symbol = symbol_short!("PENDING");
const STATUS_APPROVED: Symbol = symbol_short!("APPROVED");

// Error types
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum EmergencyError {
    ContractPaused = 1,
    UnauthorizedAccess = 2,
    InvalidEmergencyAction = 3,
    RecoveryRequestNotFound = 4,
    InsufficientEmergencyFunds = 5,
    CircuitBreakerTriggered = 6,
}

// Emergency contract implementation
#[contract]
pub struct EmergencyContract;

#[contractimpl]
impl EmergencyContract {
    // Initialize emergency contract
    pub fn initialize(env: &Env, admin: Address) {
        let emergency_state = EmergencyState {
            is_paused: false,
            emergency_admin: admin.clone(),
            circuit_breaker_threshold: 10,
            suspicious_activity_count: 0,
            emergency_fund: 0,
            emergency_contacts: vec![env, admin],
            last_emergency_check: env.ledger().timestamp(),
        };

        env.storage()
            .instance()
            .set(&symbol_short!("STATE"), &emergency_state);
    }

    // Emergency pause functionality
    pub fn emergency_pause(env: &Env) {
        Self::check_admin_authorization(env);

        let mut state: EmergencyState = env
            .storage()
            .instance()
            .get(&symbol_short!("STATE"))
            .unwrap_or_else(|| env.panic_with_error(EmergencyError::InvalidEmergencyAction));

        state.is_paused = true;
        env.storage()
            .instance()
            .set(&symbol_short!("STATE"), &state);

        // Log emergency action
        Self::log_emergency_action(env, EMERGENCY_PAUSE, symbol_short!("PAUSED"));
    }

    // Emergency unpause functionality
    pub fn emergency_unpause(env: &Env) {
        Self::check_admin_authorization(env);

        let mut state: EmergencyState = env
            .storage()
            .instance()
            .get(&symbol_short!("STATE"))
            .unwrap_or_else(|| env.panic_with_error(EmergencyError::InvalidEmergencyAction));

        state.is_paused = false;
        env.storage()
            .instance()
            .set(&symbol_short!("STATE"), &state);

        // Log emergency action
        Self::log_emergency_action(env, EMERGENCY_UNPAUSE, symbol_short!("UNPAUSED"));
    }

    // Check if contract is paused
    pub fn is_paused(env: &Env) -> bool {
        let state: EmergencyState = env
            .storage()
            .instance()
            .get(&symbol_short!("STATE"))
            .unwrap_or_else(|| env.panic_with_error(EmergencyError::InvalidEmergencyAction));

        state.is_paused
    }

    // Circuit breaker pattern for suspicious activity
    pub fn trigger_circuit_breaker(env: &Env) {
        let mut state: EmergencyState = env
            .storage()
            .instance()
            .get(&symbol_short!("STATE"))
            .unwrap_or_else(|| env.panic_with_error(EmergencyError::InvalidEmergencyAction));

        state.suspicious_activity_count += 1;

        if state.suspicious_activity_count >= state.circuit_breaker_threshold {
            state.is_paused = true;
            Self::log_emergency_action(env, CIRCUIT_BREAKER, symbol_short!("TRIGGERED"));
        }

        env.storage()
            .instance()
            .set(&symbol_short!("STATE"), &state);
    }

    // Reset circuit breaker
    pub fn reset_circuit_breaker(env: &Env) {
        Self::check_admin_authorization(env);

        let mut state: EmergencyState = env
            .storage()
            .instance()
            .get(&symbol_short!("STATE"))
            .unwrap_or_else(|| env.panic_with_error(EmergencyError::InvalidEmergencyAction));

        state.suspicious_activity_count = 0;
        env.storage()
            .instance()
            .set(&symbol_short!("STATE"), &state);
    }

    // Create recovery request for stuck funds
    pub fn create_recovery_request(
        env: &Env,
        user_address: Address,
        amount: u128,
        reason: Symbol,
    ) -> u32 {
        Self::check_contract_not_paused(env);

        let mut recovery_requests: Vec<RecoveryRequest> = env
            .storage()
            .instance()
            .get(&symbol_short!("REQUESTS"))
            .unwrap_or_else(|| vec![env]);

        let request_id = recovery_requests.len() as u32 + 1;
        let recovery_request = RecoveryRequest {
            request_id,
            user_address : user_address.clone(),
            amount,
            reason : reason.clone(),
            status: STATUS_PENDING,
            timestamp: env.ledger().timestamp(),
        };

        recovery_requests.push_back(recovery_request);

        env.storage().instance().set(&symbol_short!("REQUESTS"), &recovery_requests);
        
        env.events().publish((Symbol::new(env, "created_recovery_req") , request_id.clone()), (user_address ,amount , reason ,env.ledger().timestamp()));

        request_id
    }

    // Approve recovery request
    pub fn approve_recovery_request(env: &Env, request_id: u32) {
        Self::check_admin_authorization(env);

        let mut recovery_requests: Vec<RecoveryRequest> = env
            .storage()
            .instance()
            .get(&symbol_short!("REQUESTS"))
            .unwrap_or_else(|| env.panic_with_error(EmergencyError::RecoveryRequestNotFound));

        for i in 0..recovery_requests.len() {
            let mut request = recovery_requests.get(i).unwrap();
            if request.request_id == request_id {
                request.status = STATUS_APPROVED;
                recovery_requests.set(i, request);
                break;
            }
        }

        
        env.storage().instance().set(&symbol_short!("REQUESTS"), &recovery_requests);
        env.events().publish((Symbol::new(env , "approve_recovery_request") , request_id), env.ledger().timestamp());

    }

    // Emergency fund withdrawal
    pub fn emergency_fund_withdrawal(env: &Env, amount: u128, _recipient: Address) {
        Self::check_admin_authorization(env);

        let mut state: EmergencyState = env
            .storage()
            .instance()
            .get(&symbol_short!("STATE"))
            .unwrap_or_else(|| env.panic_with_error(EmergencyError::InvalidEmergencyAction));

        if state.emergency_fund < amount {
            env.panic_with_error(EmergencyError::InsufficientEmergencyFunds);
        }

        state.emergency_fund -= amount;
        env.storage()
            .instance()
            .set(&symbol_short!("STATE"), &state);

        // Log emergency action

        Self::log_emergency_action(
            env,
            EMERGENCY_WITHDRAWAL,
            symbol_short!("WITHDRAW")
        );
        env.events().publish((Symbol::new(env , "emegency_fund_withdrawal"), ), (_recipient , amount , env.ledger().timestamp()));

    }

    // Add emergency contact
    pub fn add_emergency_contact(env: &Env, contact: Address) {
        Self::check_admin_authorization(env);

        let mut state: EmergencyState = env
            .storage()
            .instance()
            .get(&symbol_short!("STATE"))
            .unwrap_or_else(|| env.panic_with_error(EmergencyError::InvalidEmergencyAction));

        
        state.emergency_contacts.push_back(contact.clone());
        env.storage().instance().set(&symbol_short!("STATE"), &state);
        env.events().publish((Symbol::new(env ,"added_emergency_contract"), contact ), env.ledger().timestamp());

    }

    // Get emergency state
    pub fn get_emergency_state(env: &Env) -> EmergencyState {
        env.storage()
            .instance()
            .get(&symbol_short!("STATE"))
            .unwrap_or_else(|| env.panic_with_error(EmergencyError::InvalidEmergencyAction))
    }

    // Helper functions
    fn check_admin_authorization(env: &Env) {
        let state: EmergencyState = env
            .storage()
            .instance()
            .get(&symbol_short!("STATE"))
            .unwrap_or_else(|| env.panic_with_error(EmergencyError::InvalidEmergencyAction));

        if env.current_contract_address() != state.emergency_admin {
            env.panic_with_error(EmergencyError::UnauthorizedAccess);
        }
    }

    fn check_contract_not_paused(env: &Env) {
        let state: EmergencyState = env
            .storage()
            .instance()
            .get(&symbol_short!("STATE"))
            .unwrap_or_else(|| env.panic_with_error(EmergencyError::InvalidEmergencyAction));

        if state.is_paused {
            env.panic_with_error(EmergencyError::ContractPaused);
        }
    }

    fn log_emergency_action(env: &Env, action_type: Symbol, description: Symbol) {
        let mut actions: Vec<EmergencyAction> = env
            .storage()
            .instance()
            .get(&symbol_short!("ACTIONS"))
            .unwrap_or_else(|| vec![env]);

        let action = EmergencyAction {
            action_type,
            timestamp: env.ledger().timestamp(),
            admin_address: env.current_contract_address(),
            description,
        };

        actions.push_back(action);
        env.storage()
            .instance()
            .set(&symbol_short!("ACTIONS"), &actions);
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{symbol_short, testutils::Address as _, vec, Address, Env};

    #[test]
    fn test_emergency_initialization() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let contract_id = env.register_contract(None, EmergencyContract);

        // Initialize through the contract
        env.as_contract(&contract_id, || {
            EmergencyContract::initialize(&env, admin.clone());
        });

        // Get state through the contract
        let state = env.as_contract(&contract_id, || {
            EmergencyContract::get_emergency_state(&env)
        });
        assert_eq!(state.emergency_admin, admin);
        assert_eq!(state.is_paused, false);
    }

    #[test]
    fn test_emergency_pause() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let contract_id = env.register_contract(None, EmergencyContract);

        // Initialize through the contract
        env.as_contract(&contract_id, || {
            EmergencyContract::initialize(&env, admin.clone());
        });

        // Set current contract as admin for testing through contract context
        env.as_contract(&contract_id, || {
            env.storage().instance().set(
                &symbol_short!("STATE"),
                &EmergencyState {
                    is_paused: false,
                    emergency_admin: env.current_contract_address(),
                    circuit_breaker_threshold: 10,
                    suspicious_activity_count: 0,
                    emergency_fund: 0,
                    emergency_contacts: vec![&env, admin],
                    last_emergency_check: env.ledger().timestamp(),
                },
            );
        });

        // Call emergency_pause through the contract
        env.as_contract(&contract_id, || {
            EmergencyContract::emergency_pause(&env);
        });

        // Get state through the contract
        let state = env.as_contract(&contract_id, || {
            EmergencyContract::get_emergency_state(&env)
        });
        assert_eq!(state.is_paused, true);
    }

    #[test]
    fn test_circuit_breaker() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let contract_id = env.register_contract(None, EmergencyContract);

        // Initialize through the contract
        env.as_contract(&contract_id, || {
            EmergencyContract::initialize(&env, admin.clone());
        });

        // Set current contract as admin for testing through contract context
        env.as_contract(&contract_id, || {
            env.storage().instance().set(
                &symbol_short!("STATE"),
                &EmergencyState {
                    is_paused: false,
                    emergency_admin: env.current_contract_address(),
                    circuit_breaker_threshold: 3,
                    suspicious_activity_count: 0,
                    emergency_fund: 0,
                    emergency_contacts: vec![&env, admin],
                    last_emergency_check: env.ledger().timestamp(),
                },
            );
        });

        // Trigger circuit breaker multiple times through contract context
        env.as_contract(&contract_id, || {
            EmergencyContract::trigger_circuit_breaker(&env);
        });
        env.as_contract(&contract_id, || {
            EmergencyContract::trigger_circuit_breaker(&env);
        });
        env.as_contract(&contract_id, || {
            EmergencyContract::trigger_circuit_breaker(&env);
        });

        // Get state through the contract
        let state = env.as_contract(&contract_id, || {
            EmergencyContract::get_emergency_state(&env)
        });
        assert_eq!(state.is_paused, true);
    }
}
