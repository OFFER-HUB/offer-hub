# User Registry Contract Documentation

## Overview

The User Registry Contract is a comprehensive user management system for the Offer Hub platform that handles user verification, blacklisting, and profile management. It serves as the foundational identity layer for all users interacting with the platform's smart contracts.

## Architecture

The contract implements a sophisticated verification system with multiple levels of user authentication and access controls:

```
┌─────────────────────┐    ┌──────────────────────┐
│   Admin/Moderators  │────│   User Registry      │
└─────────────────────┘    └──────────────────────┘
           │                           │
           ▼                           ▼
┌─────────────────────┐    ┌──────────────────────┐
│  Access Control     │    │  User Profiles       │
│  • Admin Management │    │  • Verification Data │
│  • Moderator Roles  │    │  • Blacklist Status  │
│  • Authorization    │    │  • Profile Metadata  │
└─────────────────────┘    └──────────────────────┘
```

## Features

### ✅ Core Features

- **Multi-level verification system** (Basic, Premium, Enterprise)
- **Admin and moderator role management**
- **Blacklist functionality** for malicious users
- **Profile metadata management**
- **Bulk operations** for administrative efficiency
- **Legacy system compatibility**
- **Expiration-based verification**
- **Publication status management**

## Verification Levels

### 1. Basic Verification
- Standard platform access
- Manual admin approval required
- Basic profile features

### 2. Premium Verification  
- Enhanced platform features
- Priority support access
- Extended profile capabilities

### 3. Enterprise Verification
- Full platform access
- Custom features and support
- Business-grade functionality

## API Reference

### Initialization Functions

#### `initialize_admin(env: Env, admin: Address) -> Result<(), Error>`
Initializes the contract with an admin address.

**Parameters:**
- `admin`: Address of the initial admin

**Events Emitted:**
- `admin_initialized`

### User Verification Functions

#### `verify_user(env: Env, admin: Address, user: Address, level: VerificationLevel, expires_at: u64, metadata: String) -> Result<(), Error>`
Verifies a user with a specific verification level.

**Parameters:**
- `admin`: Admin or moderator address
- `user`: User address to verify
- `level`: Verification level (Basic, Premium, Enterprise)
- `expires_at`: Expiration timestamp (0 for no expiration)
- `metadata`: Additional verification metadata

**Authorization:** Admin or Moderator only

**Events Emitted:**
- `user_verified`

#### `is_verified(env: Env, user: Address) -> bool`
Checks if a user is currently verified and not blacklisted.

**Returns:** Boolean verification status

#### `unverify_user(env: Env, admin: Address, user: Address) -> Result<(), Error>`
Removes verification from a user.

**Authorization:** Admin or Moderator only

**Events Emitted:**
- `user_unverified`

### Blacklist Management

#### `blacklist_user(env: Env, admin: Address, user: Address) -> Result<(), Error>`
Adds a user to the blacklist.

**Authorization:** Admin or Moderator only
**Restrictions:** Cannot blacklist admin or moderators

**Events Emitted:**
- `user_blacklisted`

#### `unblacklist_user(env: Env, admin: Address, user: Address) -> Result<(), Error>`
Removes a user from the blacklist.

**Authorization:** Admin or Moderator only

**Events Emitted:**
- `user_unblacklisted`

#### `is_user_blacklisted(env: Env, user: Address) -> bool`
Checks if a user is blacklisted.

### Bulk Operations

#### `bulk_verify_users(env: Env, admin: Address, users: Vec<Address>, level: VerificationLevel, expires_at: u64, metadata: String) -> Result<(), Error>`
Verifies multiple users in a single transaction.

**Authorization:** Admin only

**Events Emitted:**
- `user_verified` (for each user)
- `bulk_verification_completed`

### Profile Management

#### `update_user_metadata(env: Env, caller: Address, user: Address, metadata: String) -> Result<(), Error>`
Updates user profile metadata.

**Authorization:** 
- User can update their own metadata
- Admin/Moderator can update any user's metadata

#### `get_user_status(env: Env, user: Address) -> UserStatus`
Returns comprehensive user status information.

**Returns:**
```rust
UserStatus {
    is_verified: bool,
    verification_level: VerificationLevel,
    is_blacklisted: bool,
    verification_expires_at: u64,
    is_expired: bool,
    publication_status: PublicationStatus,
    validation_count: u32,
}
```

### Access Control

#### `add_moderator(env: Env, admin: Address, moderator: Address) -> Result<(), Error>`
Adds a new moderator.

**Authorization:** Admin only

#### `remove_moderator(env: Env, admin: Address, moderator: Address) -> Result<(), Error>`
Removes a moderator.

**Authorization:** Admin only

#### `transfer_admin(env: Env, current_admin: Address, new_admin: Address) -> Result<(), Error>`
Transfers admin role to a new address.

**Authorization:** Current admin only

## Events

The contract emits the following events:

- `admin_initialized(admin: Address)`
- `user_registered(user: Address)`
- `user_verified(user: Address, level: VerificationLevel, expires_at: u64)`
- `user_unverified(user: Address)`
- `user_blacklisted(user: Address, admin: Address)`
- `user_unblacklisted(user: Address, admin: Address)`
- `verification_level_updated(user: Address, old_level: VerificationLevel, new_level: VerificationLevel)`
- `verification_renewed(user: Address, expires_at: u64)`
- `moderator_added(moderator: Address, admin: Address)`
- `moderator_removed(moderator: Address, admin: Address)`
- `admin_transferred(old_admin: Address, new_admin: Address)`
- `metadata_updated(user: Address)`
- `bulk_verification_completed(count: u32)`

## Storage Structures

### UserProfile
```rust
struct UserProfile {
    verification_level: VerificationLevel,
    verified_at: u64,
    expires_at: u64, // 0 means no expiration
    metadata: String,
    is_blacklisted: bool,
    publication_status: PublicationStatus,
    validations: Vec<ValidationData>,
}
```

### ValidationData
```rust
struct ValidationData {
    validator: Address,
    timestamp: u64,
    signature: String,
    metadata: String,
}
```

## Integration Examples

### Frontend Integration

#### Check User Verification Status
```typescript
const checkUserVerification = async (userAddress: string) => {
  const isVerified = await userRegistryContract.is_verified({
    user: userAddress
  });
  
  const userStatus = await userRegistryContract.get_user_status({
    user: userAddress
  });
  
  return {
    isVerified,
    level: userStatus.verification_level,
    isBlacklisted: userStatus.is_blacklisted,
    expiresAt: userStatus.verification_expires_at
  };
};
```

#### Verify a User (Admin Function)
```typescript
const verifyUser = async (
  adminAddress: string,
  userAddress: string,
  level: VerificationLevel,
  expiresAt: number,
  metadata: string
) => {
  const result = await userRegistryContract.verify_user({
    admin: adminAddress,
    user: userAddress,
    level: level,
    expires_at: expiresAt,
    metadata: metadata
  });
  
  return result;
};
```

#### Bulk Verify Users
```typescript
const bulkVerifyUsers = async (
  adminAddress: string,
  userAddresses: string[],
  level: VerificationLevel,
  metadata: string
) => {
  const result = await userRegistryContract.bulk_verify_users({
    admin: adminAddress,
    users: userAddresses,
    level: level,
    expires_at: 0, // No expiration
    metadata: metadata
  });
  
  return result;
};
```

## Security Considerations

1. **Authorization Controls**: All administrative functions require proper authentication
2. **Admin Protection**: Admins and moderators cannot be blacklisted
3. **Input Validation**: All user inputs are validated before processing
4. **Access Segregation**: Clear separation between admin, moderator, and user permissions
5. **Expiration Handling**: Automatic verification expiration checking
6. **Event Logging**: All critical actions are logged via events

## Testing

### Unit Tests
The contract includes comprehensive tests for:
- User verification and unverification
- Blacklist management
- Admin and moderator role management
- Bulk operations
- Profile metadata updates
- Authorization controls

### Test Examples
```rust
#[test]
fn test_user_verification() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    
    // Initialize contract
    UserRegistryContract::initialize_admin(env.clone(), admin.clone());
    
    // Verify user
    UserRegistryContract::verify_user(
        env.clone(),
        admin,
        user.clone(),
        VerificationLevel::Basic,
        0,
        String::from_str(&env, "test verification")
    ).unwrap();
    
    // Check verification status
    assert!(UserRegistryContract::is_verified(env, user));
}
```

## Deployment

### Contract Address
After deployment, update the contract address in your frontend configuration:

```typescript
const USER_REGISTRY_CONTRACT_ADDRESS = "CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
```

### Initialization Steps
1. Deploy the User Registry Contract
2. Call `initialize_admin` with the platform admin address
3. Add initial moderators using `add_moderator`
4. Configure frontend to use the deployed contract address

## Error Handling

The contract defines the following error types:

```rust
enum Error {
    Unauthorized = 1,
    AlreadyRegistered = 2,
    UserNotFound = 3,
    AlreadyBlacklisted = 4,
    NotBlacklisted = 5,
    InvalidVerificationLevel = 6,
    VerificationExpired = 7,
    NotInitialized = 8,
    AlreadyInitialized = 9,
    CannotBlacklistAdmin = 10,
    CannotBlacklistModerator = 11,
    ProfileNotPublished = 12,
    ProfileAlreadyPublished = 13,
    ValidationFailed = 14,
    InvalidValidationData = 15,
}
```

## Future Enhancements

### Planned Features
1. **Multi-signature verification** for high-value operations
2. **Reputation scoring integration** with other contracts
3. **Automated verification workflows** based on user behavior
4. **Cross-chain verification** for multi-chain support
5. **Privacy-preserving verification** options

### Performance Optimizations
1. **Pagination support** for bulk operations
2. **Caching mechanisms** for frequently accessed data
3. **Event indexing** for faster queries
4. **Storage optimization** for large-scale deployments

---

For technical support or questions about implementation, please refer to the main project documentation or create an issue in the project repository.