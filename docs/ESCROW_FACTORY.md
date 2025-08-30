# Escrow Factory Contract Documentation

## Overview

The Escrow Factory Contract is a deployment and management system that creates and manages multiple escrow contracts for the Offer Hub platform. It provides batch operations, standardized deployment, and centralized management of escrow contracts, enabling efficient scaling of the platform's payment infrastructure.

## Architecture

The factory pattern provides centralized escrow management with batch operation capabilities:

```
┌─────────────────────┐    ┌──────────────────────┐
│   Escrow Factory    │────│   WASM Management    │
└─────────────────────┘    └──────────────────────┘
           │                           │
           ▼                           ▼
┌─────────────────────┐    ┌──────────────────────┐
│  Escrow Deployment  │    │   Batch Operations   │
│  • Contract Deploy  │    │   • Multi-Deposit    │
│  • Initialization   │    │   • Multi-Release    │
│  • Address Mapping  │    │   • Multi-Dispute    │
└─────────────────────┘    └──────────────────────┘
           │                           │
           ▼                           ▼
┌─────────────────────┐    ┌──────────────────────┐
│   Escrow Contract   │    │   Archive System     │
│   Instance #1       │    │   • Status Tracking  │
└─────────────────────┘    │   • Archive Mapping  │
┌─────────────────────┐    │   • Cleanup Utils    │
│   Escrow Contract   │    └──────────────────────┘
│   Instance #2       │
└─────────────────────┘
```

## Features

### ✅ Core Features

- **Standardized escrow deployment** from WASM bytecode
- **Batch operations** for multiple escrow contracts
- **Centralized contract management** with ID mapping
- **Archive system** for completed contracts
- **Milestone batch management** across multiple contracts
- **Status monitoring** for deployed contracts
- **Efficient resource management** with configurable batch limits

## API Reference

### WASM Management

#### `upload_escrow_wasm(env: Env, wasm_hash: BytesN<32>)`
Uploads the escrow contract WASM bytecode for deployment.

**Parameters:**
- `wasm_hash`: Hash of the compiled escrow contract WASM

**Authorization:** Contract deployer
**Purpose:** Stores WASM for creating new escrow instances

### Escrow Deployment

#### `deploy_new_escrow(env: Env, create_params: EscrowCreateParams) -> Address`
Deploys a new escrow contract instance.

**Parameters:**
```rust
EscrowCreateParams {
    client: Address,
    freelancer: Address,
    amount: i128,
    fee_manager: Address,
    salt: BytesN<32>,
}
```

**Returns:** Address of the deployed escrow contract

**Validation:**
- Amount must be positive
- Client and freelancer addresses must be different
- WASM must be uploaded

**Process:**
1. Validates input parameters
2. Deploys contract from stored WASM
3. Initializes with provided parameters
4. Assigns unique escrow ID
5. Stores address mapping

### Batch Operations

#### `batch_deploy(env: Env, params: Vec<EscrowCreateParams>) -> Vec<Address>`
Deploys multiple escrow contracts in a single transaction.

**Parameters:**
- `params`: Vector of escrow creation parameters (max 100)

**Returns:** Vector of deployed contract addresses

**Limitations:**
- Maximum batch size: 100 contracts
- All parameters must be valid

#### `batch_deposit_funds(env: Env, escrow_ids: Vec<u32>, client: Address)`
Deposits funds into multiple escrow contracts.

**Authorization:** Client address must match all escrows
**Preconditions:** All escrows must be in initialized state

#### `batch_release_funds(env: Env, escrow_ids: Vec<u32>, freelancer: Address)`
Releases funds from multiple escrow contracts.

**Authorization:** Freelancer address must match all escrows
**Preconditions:** All escrows must be in funded state

#### `batch_create_disputes(env: Env, escrow_ids: Vec<u32>, caller: Address)`
Creates disputes for multiple escrow contracts.

**Authorization:** Caller must be client or freelancer in all escrows
**Preconditions:** All escrows must be in funded state

#### `batch_resolve_disputes(env: Env, caller: Address, dispute_params: Vec<DisputeParams>)`
Resolves disputes for multiple escrow contracts.

**Parameters:**
```rust
DisputeParams {
    escrow_id: u32,
    result: Symbol, // "client_wins", "freelancer_wins", "split"
}
```

**Authorization:** Caller must be authorized arbitrator

### Milestone Batch Operations

#### `batch_add_milestones(env: Env, milestone_create_params: Vec<MilestoneCreateParams>, client: Address) -> Vec<MilestoneCreateResult>`
Creates milestones across multiple escrow contracts.

**Parameters:**
```rust
MilestoneCreateParams {
    escrow_id: u32,
    desc: String,
    amount: i128,
}
```

**Returns:**
```rust
MilestoneCreateResult {
    escrow_id: u32,
    milestone_id: u32,
}
```

#### `batch_approve_milestones(env: Env, milestone_params: Vec<MilestoneParams>, client: Address)`
Approves milestones across multiple escrow contracts.

#### `batch_release_milestones(env: Env, milestone_params: Vec<MilestoneParams>, freelancer: Address)`
Releases milestone payments across multiple escrow contracts.

**Parameters:**
```rust
MilestoneParams {
    escrow_id: u32,
    milestone_id: u32,
}
```

### Management Functions

#### `batch_archive_escrows(env: Env, escrow_ids: Vec<u32>) -> Vec<u32>`
Archives completed escrow contracts for cleanup.

**Returns:** Vector of successfully archived escrow IDs
**Criteria:** Only escrows with "Released" status can be archived

#### `batch_check_escrow_status(env: Env, escrow_ids: Vec<u32>) -> Vec<EscrowStatus>`
Checks the status of multiple escrow contracts.

**Returns:** Vector of escrow statuses in same order as input IDs

#### `batch_get_escrow_information(env: Env, escrow_ids: Vec<u32>) -> Vec<EscrowData>`
Retrieves complete data for multiple escrow contracts.

**Returns:** Vector of complete escrow data structures

### Query Functions

#### `get_escrow_id_by_address(env: Env, escrow_address: Address) -> Option<u32>`
Finds the escrow ID for a given contract address.

#### `is_archived(env: Env, escrow_id: Option<u32>, escrow_address: Option<Address>) -> bool`
Checks if an escrow contract has been archived.

## Data Structures

### EscrowCreateParams
```rust
struct EscrowCreateParams {
    client: Address,
    freelancer: Address,
    amount: i128,
    fee_manager: Address,
    salt: BytesN<32>,
}
```

### MilestoneCreateParams
```rust
struct MilestoneCreateParams {
    escrow_id: u32,
    desc: String,
    amount: i128,
}
```

### DisputeParams
```rust
struct DisputeParams {
    escrow_id: u32,
    result: Symbol,
}
```

## Integration Examples

### Frontend Integration

#### Deploy Multiple Escrows
```typescript
const deployMultipleEscrows = async (
  projects: Array<{
    clientAddress: string,
    freelancerAddress: string,
    amount: string,
    feeManagerAddress: string
  }>
) => {
  const createParams = projects.map(project => ({
    client: project.clientAddress,
    freelancer: project.freelancerAddress,
    amount: project.amount,
    fee_manager: project.feeManagerAddress,
    salt: generateRandomSalt()
  }));
  
  const deployedAddresses = await escrowFactory.batch_deploy({
    params: createParams
  });
  
  return deployedAddresses;
};
```

#### Batch Fund Multiple Escrows
```typescript
const batchFundEscrows = async (
  escrowIds: number[],
  clientAddress: string
) => {
  await escrowFactory.batch_deposit_funds({
    escrow_ids: escrowIds,
    client: clientAddress
  });
  
  // Check status of all escrows
  const statuses = await escrowFactory.batch_check_escrow_status({
    escrow_ids: escrowIds
  });
  
  return statuses;
};
```

#### Milestone Management Across Projects
```typescript
const batchManageMilestones = async (
  clientAddress: string,
  milestones: Array<{
    escrowId: number,
    description: string,
    amount: string
  }>
) => {
  // Create milestones
  const createParams = milestones.map(m => ({
    escrow_id: m.escrowId,
    desc: m.description,
    amount: m.amount
  }));
  
  const results = await escrowFactory.batch_add_milestones({
    milestone_create_params: createParams,
    client: clientAddress
  });
  
  // Approve all milestones
  const approveParams = results.map(r => ({
    escrow_id: r.escrow_id,
    milestone_id: r.milestone_id
  }));
  
  await escrowFactory.batch_approve_milestones({
    milestone_params: approveParams,
    client: clientAddress
  });
  
  return results;
};
```

### Backend Integration

#### Monitor Factory Operations
```typescript
const monitorFactoryOperations = async () => {
  // Track escrow deployments
  const deployedEscrows = new Map<string, number>();
  
  // Monitor batch operations
  const batchOperations = {
    deposits: 0,
    releases: 0,
    disputes: 0,
    milestones: 0
  };
  
  // Periodic status check for all active escrows
  setInterval(async () => {
    const activeEscrowIds = Array.from(deployedEscrows.values());
    
    if (activeEscrowIds.length > 0) {
      const statuses = await escrowFactory.batch_check_escrow_status({
        escrow_ids: activeEscrowIds
      });
      
      // Update database with current statuses
      await updateEscrowStatuses(activeEscrowIds, statuses);
      
      // Archive completed escrows
      const completedIds = activeEscrowIds.filter((id, index) => 
        statuses[index] === 'Released'
      );
      
      if (completedIds.length > 0) {
        await escrowFactory.batch_archive_escrows({
          escrow_ids: completedIds
        });
      }
    }
  }, 60000); // Check every minute
};
```

#### Bulk Project Setup
```typescript
const bulkProjectSetup = async (
  projects: ProjectSetupData[]
) => {
  const BATCH_SIZE = 50; // Stay within gas limits
  const results = [];
  
  for (let i = 0; i < projects.length; i += BATCH_SIZE) {
    const batch = projects.slice(i, i + BATCH_SIZE);
    
    // Deploy escrows
    const createParams = batch.map(p => ({
      client: p.clientAddress,
      freelancer: p.freelancerAddress,
      amount: p.totalAmount,
      fee_manager: FEE_MANAGER_ADDRESS,
      salt: generateSalt()
    }));
    
    const addresses = await escrowFactory.batch_deploy({
      params: createParams
    });
    
    // Create milestones
    const milestoneParams = [];
    batch.forEach((project, index) => {
      project.milestones.forEach(milestone => {
        milestoneParams.push({
          escrow_id: i + index + 1,
          desc: milestone.description,
          amount: milestone.amount
        });
      });
    });
    
    const milestoneResults = await escrowFactory.batch_add_milestones({
      milestone_create_params: milestoneParams,
      client: batch[0].clientAddress
    });
    
    results.push({
      escrowAddresses: addresses,
      milestones: milestoneResults
    });
  }
  
  return results;
};
```

## Security Considerations

1. **Batch Size Limits**: Maximum 100 operations per batch to prevent gas issues
2. **Authorization Validation**: All batch operations validate caller permissions
3. **Parameter Validation**: Input validation for all deployment parameters
4. **State Consistency**: Atomic operations ensure consistent state across batches
5. **Archive Safety**: Only completed contracts can be archived
6. **WASM Security**: WASM bytecode validation before deployment

## Performance Optimizations

### Gas Efficiency
- Batch operations reduce transaction costs by up to 80%
- Efficient storage patterns minimize gas consumption
- Archive system prevents storage bloat

### Scalability Features
- Configurable batch sizes for different operation types
- Lazy loading of escrow data for large deployments
- Archive system for historical data management

## Error Handling

```rust
enum Error {
    WasmKeyError = 1,
    InvalidAmountSet = 2,
    AddressesShouldNotMatch = 3,
    BatchSizeExceeded = 4,
    EscrowIdNotFoundError = 5,
    EscrowInfoNotSet = 6,
}
```

## Testing

### Unit Tests
```rust
#[test]
fn test_batch_deployment() {
    let env = Env::default();
    let factory = EscrowFactory::new(&env);
    
    // Upload WASM
    factory.upload_escrow_wasm(ESCROW_WASM_HASH);
    
    // Create deployment parameters
    let params = vec![
        EscrowCreateParams {
            client: Address::generate(&env),
            freelancer: Address::generate(&env),
            amount: 1000,
            fee_manager: Address::generate(&env),
            salt: BytesN::random(&env),
        },
        // ... more params
    ];
    
    // Deploy batch
    let addresses = factory.batch_deploy(params);
    assert_eq!(addresses.len(), 2);
}
```

### Integration Tests
- End-to-end batch operation workflows
- Cross-contract interaction testing
- Archive system validation
- Performance benchmarking

## Deployment

### Factory Deployment Steps
1. Deploy Escrow Factory contract
2. Upload escrow contract WASM bytecode
3. Configure batch size limits
4. Initialize address mapping storage
5. Set up monitoring and archival processes

### Configuration
```typescript
const FACTORY_CONFIG = {
  maxBatchSize: 100,
  escrowWasmHash: "HASH_OF_COMPILED_ESCROW_CONTRACT",
  feeManagerAddress: "FEE_MANAGER_CONTRACT_ADDRESS",
  archiveThreshold: 1000 // Archive after 1000 completed escrows
};
```

## Monitoring and Analytics

### Key Metrics
- Total escrows deployed
- Batch operation success rates
- Average gas consumption per operation
- Archive efficiency rates
- Contract utilization patterns

### Dashboard Integration
```typescript
const getFactoryMetrics = async () => {
  const totalDeployed = await getEscrowCount();
  const archivedCount = await getArchivedCount();
  const activeCount = totalDeployed - archivedCount;
  
  return {
    totalDeployed,
    activeContracts: activeCount,
    archivedContracts: archivedCount,
    utilizationRate: (activeCount / totalDeployed) * 100
  };
};
```

## Future Enhancements

### Planned Features
1. **Dynamic WASM updates** for escrow contract upgrades
2. **Cross-chain factory deployment** for multi-chain support
3. **Automated archive policies** based on configurable criteria
4. **Factory governance** for parameter updates
5. **Resource pooling** for gas optimization

### Integration Roadmap
1. **Template system** for different escrow types
2. **Factory clustering** for horizontal scaling
3. **AI-driven batch optimization** for gas efficiency
4. **Regulatory compliance** modules for different jurisdictions

---

For technical support or questions about implementation, please refer to the main project documentation or create an issue in the project repository.