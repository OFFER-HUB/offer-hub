# Dispute Resolution Contract Documentation

## Overview

The Dispute Resolution Contract provides a comprehensive mediation and arbitration system for resolving conflicts between clients and freelancers on the Offer Hub platform. It implements a two-tier dispute resolution process with escalation capabilities, evidence management, and automated integration with escrow contracts.

## Architecture

The dispute system implements a structured resolution process with multiple resolution levels:

```
┌─────────────────────┐    ┌──────────────────────┐
│   Dispute Creation  │────│   Evidence System    │
└─────────────────────┘    └──────────────────────┘
           │                           │
           ▼                           ▼
┌─────────────────────┐    ┌──────────────────────┐
│   Mediation Level   │    │   Arbitration Level  │
│   • Mediator Assign │    │   • Arbitrator Assign│
│   • Settlement Nego │    │   • Final Resolution │
│   • Escalation      │    │   • Escrow Integration│
└─────────────────────┘    └──────────────────────┘
           │                           │
           ▼                           ▼
┌─────────────────────┐    ┌──────────────────────┐
│   Timeout System    │    │   Fee Management     │
│   • Auto-Resolution │    │   • Dispute Fees     │
│   • Circuit Breaker │    │   • Cost Allocation  │
│   • Time Limits     │    │   • Payment Processing│
└─────────────────────┘    └──────────────────────┘
```

## Features

### ✅ Core Features

- **Two-tier dispute resolution** (Mediation → Arbitration)
- **Evidence submission system** with file attachment support
- **Timeout-based auto-resolution** to prevent infinite disputes
- **Escrow contract integration** for automated fund release
- **Comprehensive fee management** with dispute cost tracking
- **Mediator and arbitrator management** system
- **Circuit breaker protection** against system abuse

## Dispute Resolution Levels

### 1. Mediation Level
- **Initial dispute handling** with assigned mediators
- **Settlement negotiation** between parties
- **Evidence collection** and review
- **Escalation option** to arbitration if needed

### 2. Arbitration Level
- **Final dispute resolution** with designated arbitrators
- **Binding decisions** with automated enforcement
- **Direct escrow integration** for fund release
- **Higher authority** for complex disputes

## API Reference

### Initialization

#### `initialize(env: Env, admin: Address, default_timeout: u64, escrow_contract: Address, fee_manager: Address)`
Initializes the dispute resolution system.

**Parameters:**
- `admin`: Platform administrator address
- `default_timeout`: Default timeout for dispute resolution (seconds)
- `escrow_contract`: Address of associated escrow contract
- `fee_manager`: Fee manager contract address

**Events Emitted:**
- `contract_initialized(admin, timestamp)`

### Dispute Management

#### `open_dispute(env: Env, job_id: u32, initiator: Address, reason: String, escrow_contract: Option<Address>, dispute_amount: i128)`
Creates a new dispute for a specific job or contract.

**Parameters:**
- `job_id`: Unique identifier for the disputed job
- `initiator`: Address of the party initiating the dispute
- `reason`: Detailed description of the dispute reason
- `escrow_contract`: Optional associated escrow contract address
- `dispute_amount`: Amount in dispute

**Preconditions:**
- No existing dispute for the same job ID
- Valid initiator authorization
- Valid dispute amount

**Events Emitted:**
- `dispute_opened(job_id, timestamp)`

#### `get_dispute(env: Env, job_id: u32) -> DisputeData`
Retrieves complete dispute information.

**Returns:**
```rust
DisputeData {
    initiator: Address,
    reason: String,
    timestamp: u64,
    resolved: bool,
    outcome: DisputeOutcome,
    status: DisputeStatus,
    level: DisputeLevel,
    fee_manager: Address,
    dispute_amount: i128,
    fee_collected: i128,
    escrow_contract: Option<Address>,
    timeout_timestamp: Option<u64>,
    evidence: Vec<Evidence>,
    mediator: Option<Address>,
    arbitrator: Option<Address>,
    resolution_timestamp: Option<u64>,
}
```

### Evidence Management

#### `add_evidence(env: Env, job_id: u32, submitter: Address, description: String, attachment_hash: Option<String>)`
Adds evidence to an active dispute.

**Parameters:**
- `job_id`: Dispute identifier
- `submitter`: Address submitting the evidence
- `description`: Evidence description
- `attachment_hash`: Optional hash of attached files (IPFS hash)

**Authorization:** Any party involved in the dispute

**Events Emitted:**
- `evidence_added(job_id, timestamp)`

#### `get_dispute_evidence(env: Env, job_id: u32) -> Vec<Evidence>`
Retrieves all evidence for a dispute.

**Returns:** Vector of evidence entries with submission details

### Mediation Process

#### `assign_mediator(env: Env, job_id: u32, admin: Address, mediator: Address)`
Assigns a mediator to handle the dispute.

**Authorization:** Admin or authorized platform moderator
**Validation:** Mediator must be registered in the system

**Events Emitted:**
- `mediator_assigned(mediator, timestamp)`

#### `escalate_to_arbitration(env: Env, job_id: u32, mediator: Address, arbitrator: Address)`
Escalates dispute from mediation to arbitration level.

**Authorization:** Assigned mediator only
**Validation:** Arbitrator must be registered and authorized

**Events Emitted:**
- `escalated_to_arbitration(arbitrator, timestamp)`

### Dispute Resolution

#### `resolve_dispute(env: Env, job_id: u32, decision: DisputeOutcome)`
Resolves a dispute with a final decision.

**Parameters:**
- `decision`: Resolution outcome (FavorClient, FavorFreelancer, Split)

**Authorization:** Assigned mediator or arbitrator based on dispute level

**Outcomes:**
- `FavorClient`: All disputed funds return to client
- `FavorFreelancer`: All disputed funds released to freelancer  
- `Split`: Disputed funds divided equally between parties

**Escrow Integration:** Automatically calls escrow contract to release funds according to decision

**Events Emitted:**
- `dispute_resolved(decision, timestamp)`

#### `resolve_dispute_with_auth(env: Env, job_id: u32, decision: DisputeOutcome, caller: Address)`
Explicit authorization version of dispute resolution.

**Authorization:** Explicit caller authorization required
**Additional Security:** Enhanced authorization checks

### Timeout Management

#### `check_timeout(env: Env, job_id: u32) -> bool`
Checks if a dispute has exceeded its timeout period.

**Returns:** Boolean indicating timeout status

#### `set_dispute_timeout(env: Env, admin: Address, timeout_seconds: u64)`
Updates the default timeout period for disputes.

**Authorization:** Admin only
**Purpose:** Administrative control over dispute timing

**Events Emitted:**
- `timeout_updated(timeout_seconds, timestamp)`

## Data Structures

### DisputeOutcome
```rust
enum DisputeOutcome {
    None,
    FavorClient,
    FavorFreelancer,
    Split,
}
```

### DisputeStatus
```rust
enum DisputeStatus {
    Open,
    UnderMediation,
    UnderArbitration,
    Resolved,
    Timeout,
}
```

### DisputeLevel
```rust
enum DisputeLevel {
    Mediation,
    Arbitration,
}
```

### Evidence
```rust
struct Evidence {
    submitter: Address,
    description: String,
    timestamp: u64,
    attachment_hash: Option<String>,
}
```

## Integration Examples

### Frontend Integration

#### Submit Dispute with Evidence
```typescript
const submitDispute = async (
  jobId: number,
  initiatorAddress: string,
  reason: string,
  amount: string,
  evidenceFiles: File[]
) => {
  // Upload evidence files to IPFS
  const evidenceHashes = await uploadToIPFS(evidenceFiles);
  
  // Open dispute
  await disputeContract.open_dispute({
    job_id: jobId,
    initiator: initiatorAddress,
    reason: reason,
    escrow_contract: null, // Optional
    dispute_amount: amount
  });
  
  // Add evidence
  for (let i = 0; i < evidenceFiles.length; i++) {
    await disputeContract.add_evidence({
      job_id: jobId,
      submitter: initiatorAddress,
      description: `Evidence file ${i + 1}: ${evidenceFiles[i].name}`,
      attachment_hash: evidenceHashes[i]
    });
  }
  
  return await disputeContract.get_dispute({ job_id: jobId });
};
```

#### Mediation Process
```typescript
const handleMediationProcess = async (
  jobId: number,
  adminAddress: string,
  mediatorAddress: string
) => {
  // Assign mediator
  await disputeContract.assign_mediator({
    job_id: jobId,
    admin: adminAddress,
    mediator: mediatorAddress
  });
  
  // Check dispute status
  const dispute = await disputeContract.get_dispute({ job_id: jobId });
  
  // If mediation fails, escalate to arbitration
  if (dispute.status === 'UnderMediation') {
    const arbitratorAddress = await selectArbitrator(dispute);
    
    await disputeContract.escalate_to_arbitration({
      job_id: jobId,
      mediator: mediatorAddress,
      arbitrator: arbitratorAddress
    });
  }
  
  return dispute;
};
```

#### Resolution Interface
```typescript
const resolveDispute = async (
  jobId: number,
  resolverAddress: string,
  decision: 'FavorClient' | 'FavorFreelancer' | 'Split'
) => {
  const dispute = await disputeContract.get_dispute({ job_id: jobId });
  
  // Verify resolver authority
  const isAuthorized = dispute.level === 'Mediation' 
    ? dispute.mediator === resolverAddress
    : dispute.arbitrator === resolverAddress;
    
  if (!isAuthorized) {
    throw new Error('Unauthorized to resolve this dispute');
  }
  
  // Resolve dispute
  await disputeContract.resolve_dispute_with_auth({
    job_id: jobId,
    decision: decision,
    caller: resolverAddress
  });
  
  // Get final dispute state
  return await disputeContract.get_dispute({ job_id: jobId });
};
```

### Backend Integration

#### Dispute Monitoring System
```typescript
const monitorDisputes = async () => {
  // Listen for new disputes
  disputeContract.events.dispute_opened.subscribe(async (event) => {
    const dispute = await disputeContract.get_dispute({
      job_id: event.job_id
    });
    
    // Notify relevant parties
    await notifyDisputeParties(dispute);
    
    // Auto-assign mediator based on dispute category
    const mediator = await selectMediatorForDispute(dispute);
    await disputeContract.assign_mediator({
      job_id: event.job_id,
      admin: PLATFORM_ADMIN_ADDRESS,
      mediator: mediator.address
    });
  });
  
  // Monitor resolution events
  disputeContract.events.dispute_resolved.subscribe(async (event) => {
    await updateProjectStatus(event.job_id, 'dispute_resolved');
    await notifyResolution(event.job_id, event.decision);
  });
  
  // Check for timeout disputes
  setInterval(async () => {
    const activeDisputes = await getActiveDisputes();
    
    for (const jobId of activeDisputes) {
      const isTimedOut = await disputeContract.check_timeout({
        job_id: jobId
      });
      
      if (isTimedOut) {
        // Trigger automatic resolution
        await handleTimeoutDispute(jobId);
      }
    }
  }, 3600000); // Check hourly
};
```

## Fee Management

### Dispute Fee Structure
- **Mediation Fee**: 5% of disputed amount
- **Arbitration Fee**: Additional 3% of disputed amount
- **Evidence Processing**: Flat fee per evidence submission
- **Timeout Penalty**: Additional fee for timeout resolutions

### Fee Calculation
```rust
let fee_percentage = 500; // 5% for mediation
let fee_amount = (dispute.dispute_amount * fee_percentage) / 10000;
let net_amount = dispute.dispute_amount - fee_amount;
```

## Security Considerations

1. **Authorization Validation**: Multi-level authorization checks for all operations
2. **Evidence Integrity**: IPFS hash verification for evidence attachments
3. **Timeout Protection**: Automatic resolution prevents infinite disputes
4. **Escalation Controls**: Proper authorization required for level escalation
5. **Fund Safety**: Direct escrow integration ensures secure fund handling
6. **Abuse Prevention**: Rate limiting and circuit breaker patterns

## Testing

### Comprehensive Test Suite
```rust
#[test]
fn test_complete_dispute_flow() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let mediator = Address::generate(&env);
    
    // Initialize contract
    DisputeContract::initialize(
        env.clone(),
        admin.clone(),
        86400, // 24 hour timeout
        Address::generate(&env), // escrow contract
        Address::generate(&env)  // fee manager
    );
    
    // Open dispute
    DisputeContract::open_dispute(
        env.clone(),
        1,
        client.clone(),
        String::from_str(&env, "Work not completed as agreed"),
        None,
        1000
    );
    
    // Add evidence
    DisputeContract::add_evidence(
        env.clone(),
        1,
        client.clone(),
        String::from_str(&env, "Screenshots of incomplete work"),
        Some(String::from_str(&env, "QmHash123"))
    );
    
    // Assign mediator and resolve
    DisputeContract::assign_mediator(env.clone(), 1, admin, mediator.clone());
    DisputeContract::resolve_dispute(env.clone(), 1, DisputeOutcome::Split);
    
    let dispute = DisputeContract::get_dispute(env, 1);
    assert_eq!(dispute.resolved, true);
    assert_eq!(dispute.outcome, DisputeOutcome::Split);
}
```

## Error Handling

```rust
enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    DisputeNotFound = 4,
    DisputeAlreadyExists = 5,
    DisputeAlreadyResolved = 6,
    InvalidArbitrator = 7,
    InvalidDisputeLevel = 8,
    MediationRequired = 9,
    ArbitrationRequired = 10,
    InvalidTimeout = 11,
}
```

## Performance Considerations

1. **Gas Optimization**: Efficient storage patterns and minimal external calls
2. **Batch Evidence**: Support for multiple evidence submissions
3. **Event Indexing**: Comprehensive events for off-chain tracking
4. **Timeout Automation**: Automated cleanup of expired disputes

## Future Enhancements

### Planned Features
1. **AI-assisted dispute categorization** for auto-routing
2. **Anonymous arbitrator selection** for bias prevention
3. **Reputation scoring** for mediators and arbitrators
4. **Cross-chain dispute resolution** support
5. **Insurance integration** for high-value disputes

### Integration Improvements
1. **Oracle integration** for external evidence verification
2. **Decentralized storage** for evidence permanence
3. **Multi-signature resolution** for complex cases
4. **Governance voting** for dispute rule changes

---

For technical support or questions about implementation, please refer to the main project documentation or create an issue in the project repository.