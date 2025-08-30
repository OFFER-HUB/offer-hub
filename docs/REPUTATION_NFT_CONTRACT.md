# Reputation NFT Contract Documentation

## Overview

The Reputation NFT Contract manages achievement-based NFT minting for the Offer Hub platform. It creates non-fungible tokens that represent user achievements, milestones, and reputation levels, integrating with the rating system to automatically award NFTs based on performance metrics.

## Architecture

```
┌─────────────────────┐    ┌──────────────────────┐
│   Achievement System│────│   NFT Management     │
└─────────────────────┘    └──────────────────────┘
           │                           │
           ▼                           ▼
┌─────────────────────┐    ┌──────────────────────┐
│  Auto-Minting Logic │    │   Metadata Storage   │
│  • Rating Triggers  │    │  • Achievement Data  │
│  • Milestone Checks │    │  • IPFS Integration  │
│  • Batch Processing │    │  • Token Ownership   │
└─────────────────────┘    └──────────────────────┘
```

## API Reference

### Initialization

#### `init(env: Env, admin: Address) -> Result<(), Error>`
Initializes the NFT contract with an admin.

### NFT Management

#### `mint(env: Env, caller: Address, to: Address, token_id: TokenId, name: String, description: String, uri: String) -> Result<(), Error>`
Mints a new NFT with specified metadata.

#### `mint_achv(env: Env, caller: Address, to: Address, nft_type: Symbol) -> Result<(), Error>`
Mints predefined achievement NFTs.

**Achievement Types:**
- `tencontr`: 10 Completed Contracts
- `5stars5x`: 5 Stars 5 Times  
- `toprated`: Top Rated Freelancer

### Rating Integration

#### `mint_rating_achievement(env: Env, caller: Address, to: Address, achievement_type: String, rating_data: String) -> Result<(), Error>`
Mints rating-based achievement NFTs.

**Achievement Types:**
- `first_five_star`: First 5-star rating
- `ten_ratings`: 10+ ratings received
- `top_rated_professional`: 4.8+ average, 20+ ratings
- `rating_consistency`: Sustained high performance

#### `update_reputation_score(env: Env, caller: Address, user: Address, rating_average: u32, total_ratings: u32) -> Result<(), Error>`
Updates user reputation and triggers automatic achievement checks.

### Query Functions

#### `get_owner(env: Env, token_id: TokenId) -> Result<Address, Error>`
Returns the owner of a specific NFT.

#### `get_metadata(env: Env, token_id: TokenId) -> Result<Metadata, Error>`
Retrieves NFT metadata including name, description, and URI.

#### `get_user_achievements(env: Env, user: Address) -> Result<Vec<TokenId>, Error>`
Returns all achievement NFTs owned by a user.

## Integration Examples

### Auto-Award Achievement
```typescript
const checkAndAwardAchievements = async (userAddress: string, ratingData: any) => {
  // Update reputation score
  await reputationNFT.update_reputation_score({
    caller: MINTER_ADDRESS,
    user: userAddress,
    rating_average: ratingData.average * 100, // Convert to basis points
    total_ratings: ratingData.count
  });
  
  // Check for manual achievement awards
  if (ratingData.average >= 4.8 && ratingData.count >= 20) {
    await reputationNFT.mint_rating_achievement({
      caller: MINTER_ADDRESS,
      to: userAddress,
      achievement_type: "top_rated_professional",
      rating_data: JSON.stringify(ratingData)
    });
  }
};
```

### Display User Achievements
```typescript
const getUserAchievements = async (userAddress: string) => {
  const tokenIds = await reputationNFT.get_user_achievements({
    user: userAddress
  });
  
  const achievements = [];
  for (const tokenId of tokenIds) {
    const metadata = await reputationNFT.get_metadata({ token_id: tokenId });
    achievements.push({
      tokenId,
      name: metadata.name,
      description: metadata.description,
      image: metadata.uri
    });
  }
  
  return achievements;
};
```

## Achievement Criteria

### Automatic Awards
- **Excellence Milestone**: 10+ excellent ratings (4.0+)
- **Top Rated Professional**: 4.8+ average, 20+ ratings  
- **Veteran Professional**: 4.5+ average, 50+ ratings

### Manual Awards
- **First Five Star**: First 5-star rating received
- **Ten Ratings**: 10+ total ratings
- **Consistency Master**: Sustained performance metrics

## Data Structures

### Metadata
```rust
struct Metadata {
    name: String,
    description: String,
    uri: String,
}
```

## Security Considerations

1. **Minter authorization** for all NFT creation
2. **Token uniqueness** validation
3. **Ownership verification** for transfers
4. **Achievement integrity** with automated checks

---

For complete implementation details, see the full contract code and achievement logic.