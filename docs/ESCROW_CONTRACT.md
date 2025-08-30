# Escrow Contract Documentation

## Overview

The Escrow Contract is the core payment management system for the Offer Hub platform. It securely holds funds in escrow between clients and freelancers, managing the entire payment lifecycle from deposit to release, including milestone-based payments and dispute resolution integration.

## Architecture

The escrow contract implements a secure payment flow with milestone support and dispute integration:

```
┌─────────────────────┐    ┌──────────────────────┐
│      Client         │────│   Escrow Contract    │
└─────────────────────┘    └──────────────────────┘
           │                           │
           ▼                           ▼
┌─────────────────────┐    ┌──────────────────────┐
│   Fund Deposit      │    │   Milestone System   │
│   • Token Transfer  │    │   • Create Milestone │
│   • Status Update   │    │   • Approve Payment  │
│   • Event Emission  │    │   • Release Funds    │
└─────────────────────┘    └──────────────────────┘
           │                           │
           ▼                           ▼
┌─────────────────────┐    ┌──────────────────────┐
│    Freelancer       │    │   Dispute System     │
│   • Fund Release    │    │   • Dispute Creation │
│   • Fee Calculation │    │   • Arbitrator Role  │
│   • Event Tracking  │    │   • Resolution Logic │
└─────────────────────┘    └──────────────────────┘
```

## Features

### ✅ Core Features

- **Secure fund escrow** with token support
- **Milestone-based payments** for project management
- **Automatic fee calculation** and collection
- **Dispute resolution integration**
- **Auto-release functionality** with timeout mechanism
- **Comprehensive audit trail** through events
- **Multi-contract integration** with fee manager and dispute contracts

## Payment Flow States

### 1. Initialized
- Contract created but funds not yet deposited
- Initial state after contract deployment

### 2. Funded
- Client has deposited funds into escrow
- Ready for work completion and release

### 3. Released
- Funds released to freelancer
- Final state for successful completion

### 4. Disputed
- Dispute initiated by client or freelancer
- Awaiting arbitrator resolution

## API Reference

### Initialization Functions

#### `init_contract(env: Env, client: Address, freelancer: Address, amount: i128, fee_manager: Address)`
Basic contract initialization for simple escrow.

**Parameters:**
- `client`: Client address who will deposit funds
- `freelancer`: Freelancer address who will receive funds
- `amount`: Escrow amount in tokens
- `fee_manager`: Fee manager contract address

**Events Emitted:**
- Contract initialization events

#### `init_contract_full(env: Env, client: Address, freelancer: Address, arbitrator: Address, token: Address, amount: i128, timeout_secs: u64)`
Advanced contract initialization with full configuration.

**Parameters:**
- `client`: Client address
- `freelancer`: Freelancer address
- `arbitrator`: Designated arbitrator address
- `token`: Token contract address
- `amount`: Escrow amount
- `timeout_secs`: Auto-release timeout duration

### Fund Management

#### `deposit_funds(env: Env, client: Address)`
Deposits funds into the escrow contract.

**Authorization:** Client only
**Preconditions:** Contract must be initialized
**Token Transfer:** Transfers specified amount from client to contract

**Events Emitted:**
- `deposited_fund(client, amount, timestamp)`

#### `release_funds(env: Env, freelancer: Address)`
Releases escrowed funds to the freelancer.

**Authorization:** Freelancer only
**Preconditions:** Contract must be funded
**Fee Calculation:** Deducts 2.5% platform fee
**Token Transfer:** Transfers net amount to freelancer

**Events Emitted:**
- `released_fund(freelancer, gross_amount, net_amount, fee_collected, client, timestamp)`

#### `auto_release(env: Env)`
Automatically releases funds after timeout period expires.

**Preconditions:** 
- Contract funded
- Timeout period elapsed
- No active disputes

**Token Transfer:** Transfers full amount to freelancer

### Dispute Management

#### `dispute(env: Env, caller: Address)`
Initiates a dispute for the escrowed funds.

**Authorization:** Client or Freelancer only
**Preconditions:** Contract must be funded
**State Change:** Updates status to Disputed

**Events Emitted:**
- `escrow_disputed(caller, timestamp)`

#### `resolve_dispute(env: Env, caller: Address, result: Symbol)`
Resolves an active dispute with arbitrator decision.

**Authorization:** Designated arbitrator only
**Parameters:**
- `result`: Dispute resolution ("client_wins", "freelancer_wins", "split")

**Supported Results:**
- `client_wins`: Returns all funds to client
- `freelancer_wins`: Releases all funds to freelancer
- `split`: Divides funds 50/50 between parties

**Events Emitted:**
- `escrow_resolved(result, timestamp)`

### Milestone System

#### `add_milestone(env: Env, client: Address, desc: String, amount: i128) -> u32`
Creates a new milestone for the project.

**Authorization:** Client only
**Returns:** Milestone ID

**Parameters:**
- `desc`: Milestone description
- `amount`: Milestone payment amount

**Events Emitted:**
- `escrow_milestone_added(client, milestone_id, description, amount, timestamp)`

#### `approve_milestone(env: Env, client: Address, milestone_id: u32)`
Approves a milestone for payment release.

**Authorization:** Client only
**Preconditions:** Milestone must exist and not be approved

**Events Emitted:**
- `escrow_milestone_approved(client, milestone_id, timestamp)`

#### `release_milestone(env: Env, freelancer: Address, milestone_id: u32)`
Claims payment for an approved milestone.

**Authorization:** Freelancer only
**Preconditions:** Milestone must be approved and not released

**Events Emitted:**
- `escrow_milestone_released(freelancer, milestone_id, amount, timestamp)`

### Query Functions

#### `get_escrow_data(env: Env) -> EscrowData`
Returns complete escrow contract data.

**Returns:**
```rust
EscrowData {
    client: Address,
    freelancer: Address,
    arbitrator: Option<Address>,
    token: Option<Address>,
    amount: i128,
    status: EscrowStatus,
    dispute_result: u32,
    created_at: u64,
    funded_at: Option<u64>,
    released_at: Option<u64>,
    disputed_at: Option<u64>,
    resolved_at: Option<u64>,
    timeout_secs: Option<u64>,
    milestones: Vec<Milestone>,
    milestone_history: Vec<MilestoneHistory>,
    released_amount: i128,
    fee_manager: Address,
    fee_collected: i128,
    net_amount: i128,
}
```

#### `get_milestones(env: Env) -> Vec<Milestone>`
Returns all milestones for the contract.

#### `get_milestone_history(env: Env) -> Vec<MilestoneHistory>`
Returns complete milestone history with actions.

## Data Structures

### EscrowStatus
```rust
enum EscrowStatus {
    Initialized,
    Funded,
    Released,
    Disputed,
    Resolved,
}
```

### Milestone
```rust
struct Milestone {
    id: u32,
    description: String,
    amount: i128,
    approved: bool,
    released: bool,
    created_at: u64,
    approved_at: Option<u64>,
    released_at: Option<u64>,
}
```

### DisputeResult
```rust
enum DisputeResult {
    None = 0,
    ClientWins = 1,
    FreelancerWins = 2,
    Split = 3,
}
```

## Integration Examples

### Frontend Integration

#### Create and Fund Escrow
```typescript
const createAndFundEscrow = async (
  clientAddress: string,
  freelancerAddress: string,
  amount: string,
  tokenAddress: string
) => {
  // Initialize escrow contract
  await escrowContract.init_contract_full({
    client: clientAddress,
    freelancer: freelancerAddress,
    arbitrator: ARBITRATOR_ADDRESS,
    token: tokenAddress,
    amount: amount,
    timeout_secs: 2592000 // 30 days
  });
  
  // Deposit funds
  await escrowContract.deposit_funds({
    client: clientAddress
  });
  
  return await escrowContract.get_escrow_data();
};
```

#### Milestone Management
```typescript
const manageMilestones = async (
  clientAddress: string,
  freelancerAddress: string,
  milestones: Array<{description: string, amount: string}>
) => {
  const milestoneIds = [];
  
  // Create milestones
  for (const milestone of milestones) {
    const id = await escrowContract.add_milestone({
      client: clientAddress,
      desc: milestone.description,
      amount: milestone.amount
    });
    milestoneIds.push(id);
  }
  
  // Approve first milestone
  await escrowContract.approve_milestone({
    client: clientAddress,
    milestone_id: milestoneIds[0]
  });
  
  // Freelancer can now release first milestone
  await escrowContract.release_milestone({
    freelancer: freelancerAddress,
    milestone_id: milestoneIds[0]
  });
  
  return milestoneIds;
};
```

#### Dispute Handling
```typescript
const handleDispute = async (
  disputeInitiator: string,
  arbitratorAddress: string,
  resolution: 'client_wins' | 'freelancer_wins' | 'split'
) => {
  // Initiate dispute
  await escrowContract.dispute({
    caller: disputeInitiator
  });
  
  // Arbitrator resolves dispute
  await escrowContract.resolve_dispute({
    caller: arbitratorAddress,
    result: resolution
  });
  
  return await escrowContract.get_escrow_data();
};
```

### Backend Integration

#### Monitor Escrow Events
```typescript
const monitorEscrowEvents = async (escrowContractAddress: string) => {
  // Listen for fund deposits
  escrowContract.events.deposited_fund.subscribe((event) => {
    console.log(`Funds deposited: ${event.amount} by ${event.client}`);
    updateProjectStatus(event.client, 'funded');
  });
  
  // Listen for milestone releases
  escrowContract.events.escrow_milestone_released.subscribe((event) => {
    console.log(`Milestone ${event.milestone_id} released: ${event.amount}`);
    updateMilestoneStatus(event.milestone_id, 'completed');
  });
  
  // Listen for disputes
  escrowContract.events.escrow_disputed.subscribe((event) => {
    console.log(`Dispute initiated by ${event.caller}`);
    notifyArbitrators(escrowContractAddress);
  });
};
```

## Fee Calculation

The escrow contract implements a transparent fee system:

### Standard Fee Structure
- **Platform Fee**: 2.5% of transaction amount
- **Fee Calculation**: `(amount * 250) / 10000`
- **Net Amount**: `amount - fee_amount`

### Fee Integration
- Fees are automatically calculated during fund release
- Fee collection is tracked in escrow data
- Integration with fee manager contract for premium users

```rust
let fee_percentage = 250; // 2.5%
let fee_amount = (escrow_data.amount * fee_percentage) / 10000;
let net_amount = escrow_data.amount - fee_amount;
```

## Security Considerations

1. **Authorization Controls**: All functions require proper caller authentication
2. **State Validation**: Strict state transition validation prevents invalid operations
3. **Fund Safety**: Funds are only released under authorized conditions
4. **Dispute Protection**: Comprehensive dispute resolution prevents fund locks
5. **Timeout Safety**: Auto-release mechanism prevents indefinite fund holding
6. **Input Validation**: All user inputs are validated before processing
7. **Reentrancy Protection**: Contract design prevents reentrancy attacks

## Testing

### Unit Tests
The contract includes comprehensive tests for:
- Contract initialization and configuration
- Fund deposit and release mechanisms
- Milestone creation, approval, and release
- Dispute initiation and resolution
- Auto-release functionality
- Fee calculation accuracy
- Event emission verification

### Test Examples
```rust
#[test]
fn test_escrow_flow() {
    let env = Env::default();
    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let token = Address::generate(&env);
    
    // Initialize contract
    EscrowContract::init_contract_full(
        env.clone(),
        client.clone(),
        freelancer.clone(),
        Address::generate(&env), // arbitrator
        token,
        1000,
        3600 // 1 hour timeout
    );
    
    // Test deposit
    EscrowContract::deposit_funds(env.clone(), client);
    
    // Test release
    EscrowContract::release_funds(env.clone(), freelancer);
    
    let data = EscrowContract::get_escrow_data(env);
    assert_eq!(data.status, EscrowStatus::Released);
}
```

## Deployment

### Contract Address
After deployment, update the contract address in your frontend configuration:

```typescript
const ESCROW_CONTRACT_ADDRESS = "CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
```

### Factory Deployment
Escrow contracts are typically deployed through the Escrow Factory contract for standardization and management.

## Error Handling

```rust
enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    InvalidAmount = 4,
    InsufficientFunds = 5,
    InvalidStatus = 6,
    DisputeNotOpen = 7,
    InvalidDisputeResult = 8,
    MilestoneNotFound = 9,
}
```

## Performance Considerations

1. **Gas Optimization**: Efficient storage patterns and minimal external calls
2. **Batch Operations**: Milestone operations can be batched for efficiency
3. **Event Indexing**: Comprehensive event emission for off-chain indexing
4. **Storage Efficiency**: Optimized data structures for cost-effective storage

## Future Enhancements

### Planned Features
1. **Multi-token support** for diverse payment options
2. **Escrow templates** for common project types
3. **Automated milestone triggers** based on external conditions
4. **Insurance integration** for high-value contracts
5. **Cross-chain escrow** capabilities

### Integration Roadmap
1. **DeFi protocol integration** for yield generation on escrowed funds
2. **Oracle integration** for automated dispute resolution data
3. **Governance token integration** for platform decision making
4. **Layer 2 scaling** solutions for reduced transaction costs

---

For technical support or questions about implementation, please refer to the main project documentation or create an issue in the project repository.