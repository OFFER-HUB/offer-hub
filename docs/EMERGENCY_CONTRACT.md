# Emergency Contract Documentation

## Overview

The Emergency Contract provides critical safety mechanisms and crisis management capabilities for the Offer Hub platform. It implements emergency pause functionality, circuit breaker patterns, fund recovery systems, and automated protection against platform-wide issues or security threats.

## Architecture

The emergency system provides multiple layers of protection and recovery mechanisms:

```
┌─────────────────────┐    ┌──────────────────────┐
│  Emergency Admin    │────│   Circuit Breaker    │
└─────────────────────┘    └──────────────────────┘
           │                           │
           ▼                           ▼
┌─────────────────────┐    ┌──────────────────────┐
│   Pause System      │    │   Recovery System    │
│   • Global Pause    │    │   • Fund Recovery    │
│   • State Control   │    │   • Request Approval │
│   • Access Control  │    │   • Emergency Funds  │
└─────────────────────┘    └──────────────────────┘
           │                           │
           ▼                           ▼
┌─────────────────────┐    ┌──────────────────────┐
│  Monitoring System  │    │   Contact Network    │
│  • Activity Counter │    │   • Emergency Alerts │
│  • Threat Detection │    │   • Multi-Contact    │
│  • Auto-Response    │    │   • Response Team    │
└─────────────────────┘    └──────────────────────┘
```

## Features

### ✅ Core Features

- **Emergency pause/unpause** functionality for platform-wide safety
- **Circuit breaker protection** against suspicious activity
- **Fund recovery system** for stuck or disputed funds
- **Emergency contact network** for crisis communication
- **Automated threat response** with configurable thresholds
- **Administrative controls** with proper authorization
- **Audit trail** for all emergency actions

## API Reference

### Initialization

#### `initialize(env: Env, admin: Address)`
Initializes the emergency contract with administrative controls.

**Parameters:**
- `admin`: Emergency administrator address

**Initial State:**
- Contract unpaused
- Circuit breaker threshold: 10 incidents
- Empty emergency fund
- Admin as primary emergency contact

### Emergency Controls

#### `emergency_pause(env: Env)`
Immediately pauses all platform operations.

**Authorization:** Emergency admin only
**Use Cases:**
- Security breach detected
- Critical vulnerability discovered
- System-wide malfunction
- Regulatory requirement

**Effects:**
- Blocks all user operations
- Preserves existing state
- Enables investigation mode

#### `emergency_unpause(env: Env)`
Resumes normal platform operations.

**Authorization:** Emergency admin only
**Preconditions:** 
- Issue resolved and verified
- System integrity confirmed
- Safety measures implemented

#### `is_paused(env: Env) -> bool`
Checks current platform pause status.

**Returns:** Boolean indicating if platform is paused
**Usage:** Called by other contracts before operations

### Circuit Breaker System

#### `trigger_circuit_breaker(env: Env)`
Increments suspicious activity counter and auto-pauses if threshold exceeded.

**Automatic Triggers:**
- Multiple failed transactions
- Unusual spending patterns  
- Repeated authorization failures
- Abnormal contract interactions

**Threshold Behavior:**
- Configurable incident threshold (default: 10)
- Automatic pause when threshold reached
- Admin notification on circuit activation

#### `reset_circuit_breaker(env: Env)`
Resets the circuit breaker counter to zero.

**Authorization:** Emergency admin only
**Use Cases:**
- False positive incidents resolved
- System maintenance completed
- Threshold recalibration

### Fund Recovery System

#### `create_recovery_request(env: Env, user_address: Address, amount: u128, reason: Symbol) -> u32`
Creates a request to recover stuck or disputed funds.

**Parameters:**
- `user_address`: Address of user requesting recovery
- `amount`: Amount to recover
- `reason`: Recovery reason code

**Returns:** Unique request ID for tracking

**Common Reasons:**
- `STUCK_FUNDS`: Funds locked in failed transaction
- `DISPUTE_TIMEOUT`: Dispute resolution exceeded time limit
- `CONTRACT_ERROR`: Smart contract malfunction
- `USER_ERROR`: User operational mistake

#### `approve_recovery_request(env: Env, request_id: u32)`
Approves a fund recovery request for processing.

**Authorization:** Emergency admin only
**Process:**
1. Validates request legitimacy
2. Verifies fund availability
3. Marks request as approved
4. Enables fund withdrawal

#### `emergency_fund_withdrawal(env: Env, amount: u128, recipient: Address)`
Withdraws emergency funds for crisis resolution.

**Authorization:** Emergency admin only
**Safeguards:**
- Amount validation against available funds
- Recipient address verification
- Action logging for audit trail

### Emergency Contacts

#### `add_emergency_contact(env: Env, contact: Address)`
Adds a new emergency contact to the response network.

**Authorization:** Emergency admin only
**Purpose:** 
- Crisis communication network
- Backup administrative access
- Multi-party emergency response

#### `get_emergency_state(env: Env) -> EmergencyState`
Returns complete emergency system state.

**Returns:**
```rust
EmergencyState {
    is_paused: bool,
    emergency_admin: Address,
    circuit_breaker_threshold: u32,
    suspicious_activity_count: u32,
    emergency_fund: u128,
    emergency_contacts: Vec<Address>,
    last_emergency_check: u64,
}
```

## Data Structures

### EmergencyState
```rust
struct EmergencyState {
    is_paused: bool,
    emergency_admin: Address,
    circuit_breaker_threshold: u32,
    suspicious_activity_count: u32,
    emergency_fund: u128,
    emergency_contacts: Vec<Address>,
    last_emergency_check: u64,
}
```

### RecoveryRequest
```rust
struct RecoveryRequest {
    request_id: u32,
    user_address: Address,
    amount: u128,
    reason: Symbol,
    status: Symbol, // PENDING, APPROVED
    timestamp: u64,
}
```

### EmergencyAction
```rust
struct EmergencyAction {
    action_type: Symbol,
    timestamp: u64,
    admin_address: Address,
    description: Symbol,
}
```

## Integration Examples

### Frontend Integration

#### Emergency Status Monitoring
```typescript
const monitorEmergencyStatus = async () => {
  const state = await emergencyContract.get_emergency_state();
  
  if (state.is_paused) {
    // Show maintenance mode UI
    showEmergencyUI({
      message: "Platform temporarily paused for maintenance",
      contactInfo: state.emergency_contacts,
      lastCheck: state.last_emergency_check
    });
    
    // Disable all transaction buttons
    disableTransactionUI();
  }
  
  // Monitor circuit breaker status
  const threshold = state.circuit_breaker_threshold;
  const current = state.suspicious_activity_count;
  
  if (current >= threshold * 0.8) {
    showWarning("Platform may enter emergency mode due to unusual activity");
  }
};
```

#### Recovery Request Interface
```typescript
const submitRecoveryRequest = async (
  userAddress: string,
  amount: string,
  reason: 'STUCK_FUNDS' | 'DISPUTE_TIMEOUT' | 'CONTRACT_ERROR',
  evidence: string[]
) => {
  // Create recovery request
  const requestId = await emergencyContract.create_recovery_request({
    user_address: userAddress,
    amount: amount,
    reason: reason
  });
  
  // Upload supporting evidence
  const evidenceHashes = await uploadEvidenceToIPFS(evidence);
  
  // Track request status
  return {
    requestId,
    status: 'PENDING',
    evidenceHashes,
    submittedAt: Date.now()
  };
};
```

### Backend Integration

#### Emergency Response System
```typescript
const emergencyResponseSystem = async () => {
  // Monitor for emergency triggers
  const monitorThreats = setInterval(async () => {
    const threatLevel = await assessThreatLevel();
    
    if (threatLevel > CRITICAL_THRESHOLD) {
      // Auto-trigger emergency pause
      await emergencyContract.emergency_pause();
      
      // Alert emergency contacts
      const state = await emergencyContract.get_emergency_state();
      await alertEmergencyContacts(state.emergency_contacts, {
        type: 'CRITICAL_THREAT',
        details: 'Automatic emergency pause triggered',
        timestamp: Date.now()
      });
    }
    
    // Check circuit breaker status
    const circuitBreakerStatus = await checkCircuitBreaker();
    if (circuitBreakerStatus.triggered) {
      await handleCircuitBreakerEvent(circuitBreakerStatus);
    }
  }, 60000); // Check every minute
  
  // Monitor recovery requests
  const processRecoveryRequests = setInterval(async () => {
    const pendingRequests = await getPendingRecoveryRequests();
    
    for (const request of pendingRequests) {
      const isValid = await validateRecoveryRequest(request);
      if (isValid) {
        await emergencyContract.approve_recovery_request({
          request_id: request.id
        });
        
        await notifyUser(request.user_address, {
          type: 'RECOVERY_APPROVED',
          requestId: request.id,
          amount: request.amount
        });
      }
    }
  }, 300000); // Check every 5 minutes
};
```

#### Admin Dashboard Integration
```typescript
const emergencyAdminDashboard = {
  async getSystemStatus() {
    const state = await emergencyContract.get_emergency_state();
    
    return {
      isPaused: state.is_paused,
      circuitBreakerStatus: {
        current: state.suspicious_activity_count,
        threshold: state.circuit_breaker_threshold,
        percentage: (state.suspicious_activity_count / state.circuit_breaker_threshold) * 100
      },
      emergencyFund: state.emergency_fund,
      contactCount: state.emergency_contacts.length,
      lastCheck: new Date(state.last_emergency_check * 1000)
    };
  },
  
  async handleEmergencyAction(action: 'PAUSE' | 'UNPAUSE' | 'RESET_CIRCUIT') {
    switch (action) {
      case 'PAUSE':
        await emergencyContract.emergency_pause();
        break;
      case 'UNPAUSE':
        await emergencyContract.emergency_unpause();
        break;
      case 'RESET_CIRCUIT':
        await emergencyContract.reset_circuit_breaker();
        break;
    }
    
    // Log action for audit
    await logEmergencyAction(action, {
      admin: ADMIN_ADDRESS,
      timestamp: Date.now()
    });
  }
};
```

## Security Considerations

1. **Admin Authorization**: All critical functions require emergency admin authentication
2. **Circuit Breaker Protection**: Automatic system protection against abuse
3. **Fund Safety**: Emergency funds secured with multi-layered access controls
4. **Audit Trail**: Complete logging of all emergency actions
5. **Contact Network**: Distributed emergency response capability
6. **State Consistency**: Atomic operations prevent inconsistent states

## Testing

### Comprehensive Test Suite
```rust
#[test]
fn test_emergency_pause_functionality() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let contract_id = env.register_contract(None, EmergencyContract);
    
    // Initialize
    env.as_contract(&contract_id, || {
        EmergencyContract::initialize(&env, admin.clone());
    });
    
    // Test pause
    env.as_contract(&contract_id, || {
        // Set admin authorization
        env.storage().instance().set(&symbol_short!("STATE"), &EmergencyState {
            is_paused: false,
            emergency_admin: env.current_contract_address(),
            circuit_breaker_threshold: 10,
            suspicious_activity_count: 0,
            emergency_fund: 0,
            emergency_contacts: vec![&env, admin],
            last_emergency_check: env.ledger().timestamp(),
        });
        
        EmergencyContract::emergency_pause(&env);
    });
    
    // Verify paused state
    let is_paused = env.as_contract(&contract_id, || {
        EmergencyContract::is_paused(&env)
    });
    assert_eq!(is_paused, true);
}

#[test]
fn test_circuit_breaker() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let contract_id = env.register_contract(None, EmergencyContract);
    
    // Initialize with low threshold
    env.as_contract(&contract_id, || {
        env.storage().instance().set(&symbol_short!("STATE"), &EmergencyState {
            is_paused: false,
            emergency_admin: env.current_contract_address(),
            circuit_breaker_threshold: 3,
            suspicious_activity_count: 0,
            emergency_fund: 0,
            emergency_contacts: vec![&env, admin],
            last_emergency_check: env.ledger().timestamp(),
        });
    });
    
    // Trigger circuit breaker
    for _ in 0..3 {
        env.as_contract(&contract_id, || {
            EmergencyContract::trigger_circuit_breaker(&env);
        });
    }
    
    // Verify auto-pause
    let state = env.as_contract(&contract_id, || {
        EmergencyContract::get_emergency_state(&env)
    });
    assert_eq!(state.is_paused, true);
}
```

## Error Handling

```rust
enum EmergencyError {
    ContractPaused = 1,
    UnauthorizedAccess = 2,
    InvalidEmergencyAction = 3,
    RecoveryRequestNotFound = 4,
    InsufficientEmergencyFunds = 5,
    CircuitBreakerTriggered = 6,
}
```

## Deployment and Configuration

### Initial Setup
```typescript
const deployEmergencyContract = async () => {
  // Deploy contract
  const emergencyContract = await deploy('EmergencyContract');
  
  // Initialize with admin
  await emergencyContract.initialize(EMERGENCY_ADMIN_ADDRESS);
  
  // Add emergency contacts
  const emergencyContacts = [
    PLATFORM_ADMIN_ADDRESS,
    TECHNICAL_LEAD_ADDRESS,
    SECURITY_OFFICER_ADDRESS
  ];
  
  for (const contact of emergencyContacts) {
    await emergencyContract.add_emergency_contact(contact);
  }
  
  return emergencyContract.address;
};
```

### Monitoring Integration
```typescript
const integrateMonitoring = async () => {
  // Set up alert system
  const alertSystem = new EmergencyAlertSystem({
    contracts: [EMERGENCY_CONTRACT_ADDRESS],
    notifications: {
      email: ADMIN_EMAIL,
      slack: EMERGENCY_SLACK_CHANNEL,
      sms: EMERGENCY_PHONE_NUMBERS
    }
  });
  
  // Monitor emergency events
  await alertSystem.monitorEvents([
    'emergency_pause',
    'circuit_breaker_triggered',
    'recovery_request_created'
  ]);
};
```

## Best Practices

1. **Regular Testing**: Conduct periodic emergency drills
2. **Response Documentation**: Maintain emergency response procedures
3. **Contact Management**: Keep emergency contact list current
4. **Fund Management**: Maintain adequate emergency fund reserves
5. **Monitoring**: Implement comprehensive system monitoring
6. **Communication**: Establish clear emergency communication protocols

## Future Enhancements

### Planned Features
1. **Multi-signature emergency controls** for enhanced security
2. **Automated threat detection** with AI/ML capabilities
3. **Cross-chain emergency coordination** for multi-chain deployments
4. **Governance integration** for community emergency decisions
5. **Insurance integration** for emergency fund replenishment

### Integration Improvements
1. **Oracle-based threat feeds** for external threat intelligence
2. **Decentralized emergency response** with validator networks
3. **Time-locked emergency actions** for additional security
4. **Emergency governance voting** for major decisions

---

For technical support or questions about implementation, please refer to the main project documentation or create an issue in the project repository.