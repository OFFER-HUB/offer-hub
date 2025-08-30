# Publication Contract Documentation

## Overview

The Publication Contract manages the on-chain publishing of services and projects on the Offer Hub platform. It provides a decentralized registry for all service and project publications with data validation, user-specific counters, and event emission for off-chain indexing.

## Architecture

```
┌─────────────────────┐    ┌──────────────────────┐
│   User Publications │────│   Data Validation    │
└─────────────────────┘    └──────────────────────┘
           │                           │
           ▼                           ▼
┌─────────────────────┐    ┌──────────────────────┐
│  Publication Storage│    │   Event System       │
│  • Service Posts    │    │  • Creation Events   │
│  • Project Posts    │    │  • Off-chain Sync    │
│  • User Counters    │    │  • Indexing Support  │
└─────────────────────┘    └──────────────────────┘
```

## API Reference

### Publishing Functions

#### `publish(env: Env, user: Address, publication_type: Symbol, title: String, category: String, amount: i128, timestamp: u64) -> Result<u32, ContractError>`
Publishes a new service or project on-chain.

**Parameters:**
- `user`: Publisher address
- `publication_type`: "service" or "project"
- `title`: Publication title
- `category`: Category classification
- `amount`: Associated payment amount
- `timestamp`: Publication timestamp

**Returns:** Unique publication ID for the user

**Validation:**
- Title length requirements
- Amount positivity
- Category validation
- User authorization

### Query Functions

#### `get_publication(env: Env, user: Address, id: u32) -> Option<PublicationData>`
Retrieves a specific publication.

**Returns:**
```rust
PublicationData {
    publication_type: Symbol,
    title: String,
    category: String,
    amount: i128,
    timestamp: u64,
}
```

## Integration Examples

### Publish Service
```typescript
const publishService = async (
  userAddress: string,
  serviceData: {
    title: string,
    category: string,
    price: string,
    description: string
  }
) => {
  const publicationId = await publicationContract.publish({
    user: userAddress,
    publication_type: 'service',
    title: serviceData.title,
    category: serviceData.category,
    amount: serviceData.price,
    timestamp: Math.floor(Date.now() / 1000)
  });
  
  // Store detailed data off-chain with reference to on-chain publication
  await storeServiceDetails({
    publicationId,
    description: serviceData.description,
    userAddress
  });
  
  return publicationId;
};
```

### Event Monitoring
```typescript
// Listen for publication events
publicationContract.events.publication_created.subscribe((event) => {
  console.log(`New ${event.publication_type} published by ${event.user}`);
  
  // Trigger off-chain indexing
  indexPublication({
    userId: event.user,
    publicationId: event.id,
    type: event.publication_type
  });
});
```

## Data Flow

1. **User submits publication** → Contract validates data
2. **On-chain storage** → Publication stored with unique ID
3. **Event emission** → Off-chain services notified
4. **Database sync** → Detailed data stored off-chain with reference

## Security Considerations

1. **User authorization** required for all publications
2. **Input validation** for all data fields
3. **Rate limiting** through gas costs
4. **Data integrity** with immutable on-chain records

---

For complete implementation details, see the full contract code and validation logic.