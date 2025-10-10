#!/bin/bash

# Modified deployment script using stellar CLI and direct key usage
# This script deploys all contracts using your specific key

set -e

echo "🚀 Starting OfferHub Contract Deployment with Stellar CLI..."
echo "============================================================="

# Configuration
NETWORK=${NETWORK:-"testnet"}
ADMIN_ADDRESS=${ADMIN_ADDRESS:-"GD4FILPR7OLXXLLWZ3CNP2W367DP4U77Z67GVWGKMEH7NC6J6MXYJHXS"}
FEE_MANAGER_ADDRESS=${FEE_MANAGER_ADDRESS:-"GD4FILPR7OLXXLLWZ3CNP2W367DP4U77Z67GVWGKMEH7NC6J6MXYJHXS"}
ADMIN_SECRET_KEY="SB3QEVA5OCOQEQZVTA2PSAGT5HEA6SRXSQTP3TIWPDZTQMVSNBDTH6QE"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "Deployment Configuration:"
echo "   Network: $NETWORK"
echo "   Admin Address: $ADMIN_ADDRESS"
echo "   Fee Manager Address: $FEE_MANAGER_ADDRESS"
echo ""

# Create deployment directory
DEPLOYMENT_DIR="deployments/$(date +%Y%m%d-%H%M%S)"
mkdir -p $DEPLOYMENT_DIR

# Function to build contract
build_contract() {
    local contract_name=$1
    local contract_path=$2
    
    print_status "Building $contract_name..."
    cd $contract_path
    
    if [ ! -f "Cargo.toml" ]; then
        print_error "Cargo.toml not found in $contract_path"
        exit 1
    fi
    
    cargo build --target wasm32-unknown-unknown --release --quiet
    
    if [ $? -eq 0 ]; then
        print_success "$contract_name built successfully"
    else
        print_error "Failed to build $contract_name"
        exit 1
    fi
    
    cd - > /dev/null
}

# Function to deploy contract
deploy_contract() {
    local contract_name=$1
    local contract_path=$2
    local wasm_file=$3
    local init_args=$4
    
    print_status "Deploying $contract_name..."
    
    if [ ! -f "$wasm_file" ]; then
        print_error "WASM file not found: $wasm_file"
        exit 1
    fi
    
    # Deploy the contract using stellar CLI
    local contract_id=$(stellar contract deploy \
        --wasm $wasm_file \
        --source-account $ADMIN_ADDRESS \
        --secret-key $ADMIN_SECRET_KEY \
        --network $NETWORK)
    
    print_success "$contract_name deployed: $contract_id"
    
    # Initialize if init_args provided
    if [ -n "$init_args" ]; then
        print_status "Initializing $contract_name..."
        stellar contract invoke \
            --id $contract_id \
            --source-account $ADMIN_ADDRESS \
            --secret-key $ADMIN_SECRET_KEY \
            --network $NETWORK \
            -- $init_args
        
        print_success "$contract_name initialized"
    fi
    
    # Save contract address
    echo "$contract_id" > "$DEPLOYMENT_DIR/${contract_name,,}_address.txt"
    
    echo $contract_id
}

# Build all contracts
print_status "Building all contracts..."
echo "================================"

build_contract "User Registry" "contracts-offerhub/contracts/user-registry-contract"
build_contract "Fee Manager" "contracts-offerhub/contracts/fee-manager-contract"
build_contract "Publication" "contracts-offerhub/contracts/publication-contract"
build_contract "Rating" "contracts-offerhub/contracts/rating-contract"
build_contract "Reputation NFT" "contracts-offerhub/contracts/reputation-nft-contract"
build_contract "Escrow" "contracts-offerhub/contracts/escrow-contract"
build_contract "Escrow Factory" "contracts-offerhub/contracts/escrow-factory"
build_contract "Dispute" "contracts-offerhub/contracts/dispute-contract"
build_contract "Emergency" "contracts-offerhub/contracts/emergency-contract"
build_contract "Stat" "contracts-offerhub/contracts/stat-contract"

print_success "All contracts built successfully!"
echo ""

# Deploy contracts in dependency order
print_status "Deploying contracts in dependency order..."
echo "================================================"

# 1. Deploy core contracts first
print_status "Phase 1: Deploying core contracts..."

USER_REGISTRY_ID=$(deploy_contract "User Registry" \
    "contracts-offerhub/contracts/user-registry-contract" \
    "contracts-offerhub/contracts/user-registry-contract/target/wasm32-unknown-unknown/release/user_registry_contract.wasm" \
    "initialize_admin --admin $ADMIN_ADDRESS")

FEE_MANAGER_ID=$(deploy_contract "Fee Manager" \
    "contracts-offerhub/contracts/fee-manager-contract" \
    "contracts-offerhub/contracts/fee-manager-contract/target/wasm32-unknown-unknown/release/fee_manager_contract.wasm" \
    "init --admin $ADMIN_ADDRESS")

STAT_ID=$(deploy_contract "Stat" \
    "contracts-offerhub/contracts/stat-contract" \
    "contracts-offerhub/contracts/stat-contract/target/wasm32-unknown-unknown/release/stat_contract.wasm" \
    "init --admin $ADMIN_ADDRESS")

# 2. Deploy secondary contracts
print_status "Phase 2: Deploying secondary contracts..."

PUBLICATION_ID=$(deploy_contract "Publication" \
    "contracts-offerhub/contracts/publication-contract" \
    "contracts-offerhub/contracts/publication-contract/target/wasm32-unknown-unknown/release/publication_contract.wasm" \
    "")

RATING_ID=$(deploy_contract "Rating" \
    "contracts-offerhub/contracts/rating-contract" \
    "contracts-offerhub/contracts/rating-contract/target/wasm32-unknown-unknown/release/rating_contract.wasm" \
    "init --admin $ADMIN_ADDRESS")

REPUTATION_ID=$(deploy_contract "Reputation NFT" \
    "contracts-offerhub/contracts/reputation-nft-contract" \
    "contracts-offerhub/contracts/reputation-nft-contract/target/wasm32-unknown-unknown/release/reputation_nft_contract.wasm" \
    "init --admin $ADMIN_ADDRESS")

# 3. Deploy escrow-related contracts
print_status "Phase 3: Deploying escrow-related contracts..."

ESCROW_ID=$(deploy_contract "Escrow" \
    "contracts-offerhub/contracts/escrow-contract" \
    "contracts-offerhub/contracts/escrow-contract/target/wasm32-unknown-unknown/release/escrow_contract.wasm" \
    "initialize_contract --admin $ADMIN_ADDRESS")

ESCROW_FACTORY_ID=$(deploy_contract "Escrow Factory" \
    "contracts-offerhub/contracts/escrow-factory" \
    "contracts-offerhub/contracts/escrow-factory/target/wasm32-unknown-unknown/release/escrow_factory.wasm" \
    "init --admin $ADMIN_ADDRESS")

# 4. Deploy dispute and emergency contracts
print_status "Phase 4: Deploying dispute and emergency contracts..."

DISPUTE_ID=$(deploy_contract "Dispute" \
    "contracts-offerhub/contracts/dispute-contract" \
    "contracts-offerhub/contracts/dispute-contract/target/wasm32-unknown-unknown/release/dispute_contract.wasm" \
    "init --admin $ADMIN_ADDRESS")

EMERGENCY_ID=$(deploy_contract "Emergency" \
    "contracts-offerhub/contracts/emergency-contract" \
    "contracts-offerhub/contracts/emergency-contract/target/wasm32-unknown-unknown/release/emergency_contract.wasm" \
    "init --admin $ADMIN_ADDRESS")

print_success "All contracts deployed successfully!"
echo ""

# Configure contract relationships
print_status "Configuring contract relationships..."
echo "==========================================="

# Link rating contract with reputation contract
print_status "Linking rating contract with reputation contract..."
stellar contract invoke \
    --id $REPUTATION_ID \
    --source-account $ADMIN_ADDRESS \
    --secret-key $ADMIN_SECRET_KEY \
    --network $NETWORK \
    -- add_minter --caller $ADMIN_ADDRESS --minter $RATING_ID

# Add contracts to user registry
print_status "Adding contracts to user registry..."
stellar contract invoke \
    --id $USER_REGISTRY_ID \
    --source-account $ADMIN_ADDRESS \
    --secret-key $ADMIN_SECRET_KEY \
    --network $NETWORK \
    -- set_rating_contract --admin $ADMIN_ADDRESS --contract_address $RATING_ID

stellar contract invoke \
    --id $USER_REGISTRY_ID \
    --source-account $ADMIN_ADDRESS \
    --secret-key $ADMIN_SECRET_KEY \
    --network $NETWORK \
    -- add_escrow_contract --admin $ADMIN_ADDRESS --contract_address $ESCROW_ID

stellar contract invoke \
    --id $USER_REGISTRY_ID \
    --source-account $ADMIN_ADDRESS \
    --secret-key $ADMIN_SECRET_KEY \
    --network $NETWORK \
    -- add_dispute_contract --admin $ADMIN_ADDRESS --contract_address $DISPUTE_ID

print_success "Contract relationships configured!"
echo ""

# Generate deployment summary
print_status "Generating deployment summary..."
echo "====================================="

DEPLOYMENT_SUMMARY="$DEPLOYMENT_DIR/deployment-summary.json"
cat > $DEPLOYMENT_SUMMARY << EOF
{
  "deployment": {
    "timestamp": "$(date -Iseconds)",
    "network": "$NETWORK",
    "admin_address": "$ADMIN_ADDRESS",
    "fee_manager_address": "$FEE_MANAGER_ADDRESS",
    "contracts": {
      "user_registry": {
        "id": "$USER_REGISTRY_ID",
        "name": "User Registry Contract",
        "description": "Manages user verification, profiles, and access control"
      },
      "fee_manager": {
        "id": "$FEE_MANAGER_ID",
        "name": "Fee Manager Contract",
        "description": "Handles platform fees and fee distribution"
      },
      "publication": {
        "id": "$PUBLICATION_ID",
        "name": "Publication Contract",
        "description": "Manages service and project publications"
      },
      "rating": {
        "id": "$RATING_ID",
        "name": "Rating Contract",
        "description": "Handles user ratings and reviews"
      },
      "reputation": {
        "id": "$REPUTATION_ID",
        "name": "Reputation NFT Contract",
        "description": "Mints reputation NFTs based on ratings"
      },
      "escrow": {
        "id": "$ESCROW_ID",
        "name": "Escrow Contract",
        "description": "Manages escrow transactions and milestone payments"
      },
      "escrow_factory": {
        "id": "$ESCROW_FACTORY_ID",
        "name": "Escrow Factory Contract",
        "description": "Creates new escrow contract instances"
      },
      "dispute": {
        "id": "$DISPUTE_ID",
        "name": "Dispute Contract",
        "description": "Handles dispute resolution and arbitration"
      },
      "emergency": {
        "id": "$EMERGENCY_ID",
        "name": "Emergency Contract",
        "description": "Emergency procedures and recovery mechanisms"
      },
      "stat": {
        "id": "$STAT_ID",
        "name": "Stat Contract",
        "description": "Tracks platform statistics and analytics"
      }
    }
  }
}
EOF

# Generate environment variables file
ENV_FILE="$DEPLOYMENT_DIR/.env"
cat > $ENV_FILE << EOF
# OfferHub Contract Addresses - Generated on $(date)
# Network: $NETWORK

# Core Contracts
VITE_USER_REGISTRY_CONTRACT_ID="$USER_REGISTRY_ID"
VITE_FEE_MANAGER_CONTRACT_ID="$FEE_MANAGER_ID"
VITE_STAT_CONTRACT_ID="$STAT_ID"

# Publication & Rating System
VITE_PUBLICATION_CONTRACT_ID="$PUBLICATION_ID"
VITE_RATING_CONTRACT_ID="$RATING_ID"
VITE_REPUTATION_CONTRACT_ID="$REPUTATION_ID"

# Escrow System
VITE_ESCROW_CONTRACT_ID="$ESCROW_ID"
VITE_ESCROW_FACTORY_CONTRACT_ID="$ESCROW_FACTORY_ID"

# Dispute & Emergency
VITE_DISPUTE_CONTRACT_ID="$DISPUTE_ID"
VITE_EMERGENCY_CONTRACT_ID="$EMERGENCY_ID"

# Network Configuration
VITE_SOROBAN_NETWORK="$NETWORK"
VITE_ADMIN_ADDRESS="$ADMIN_ADDRESS"
VITE_FEE_MANAGER_ADDRESS="$FEE_MANAGER_ADDRESS"
EOF

# Generate TypeScript constants file
TS_CONSTANTS="$DEPLOYMENT_DIR/contract-addresses.ts"
cat > $TS_CONSTANTS << EOF
// OfferHub Contract Addresses - Generated on $(date)
// Network: $NETWORK

export const CONTRACT_ADDRESSES = {
  // Core Contracts
  USER_REGISTRY: "$USER_REGISTRY_ID",
  FEE_MANAGER: "$FEE_MANAGER_ID",
  STAT: "$STAT_ID",
  
  // Publication & Rating System
  PUBLICATION: "$PUBLICATION_ID",
  RATING: "$RATING_ID",
  REPUTATION: "$REPUTATION_ID",
  
  // Escrow System
  ESCROW: "$ESCROW_ID",
  ESCROW_FACTORY: "$ESCROW_FACTORY_ID",
  
  // Dispute & Emergency
  DISPUTE: "$DISPUTE_ID",
  EMERGENCY: "$EMERGENCY_ID",
} as const;

export const NETWORK_CONFIG = {
  NETWORK: "$NETWORK",
  ADMIN_ADDRESS: "$ADMIN_ADDRESS",
  FEE_MANAGER_ADDRESS: "$FEE_MANAGER_ADDRESS",
} as const;

export type ContractAddresses = typeof CONTRACT_ADDRESSES;
export type NetworkConfig = typeof NETWORK_CONFIG;
EOF

print_success "Deployment summary generated!"
echo ""

# Display final results
echo "🎉 Deployment Complete!"
echo "======================"
echo ""
echo "📋 Contract Addresses:"
echo "   User Registry:     $USER_REGISTRY_ID"
echo "   Fee Manager:       $FEE_MANAGER_ID"
echo "   Publication:       $PUBLICATION_ID"
echo "   Rating:            $RATING_ID"
echo "   Reputation:        $REPUTATION_ID"
echo "   Escrow:            $ESCROW_ID"
echo "   Escrow Factory:    $ESCROW_FACTORY_ID"
echo "   Dispute:           $DISPUTE_ID"
echo "   Emergency:         $EMERGENCY_ID"
echo "   Stat:              $STAT_ID"
echo ""
echo "📁 Deployment Files:"
echo "   Summary:           $DEPLOYMENT_SUMMARY"
echo "   Environment:       $ENV_FILE"
echo "   TypeScript:        $TS_CONSTANTS"
echo ""
echo "🔧 Next Steps:"
echo "   1. Copy the .env file to your frontend project"
echo "   2. Update your frontend configuration with contract addresses"
echo "   3. Test contract interactions using the generated hooks"
echo "   4. Verify all contract functions work as expected"
echo ""
echo "💡 To use in your frontend:"
echo "   cp $ENV_FILE .env.local"
echo "   # or import the TypeScript constants:"
echo "   import { CONTRACT_ADDRESSES } from '$TS_CONSTANTS'"
echo ""
echo "🔍 Verify deployment:"
echo "   stellar contract invoke --network $NETWORK --id $USER_REGISTRY_ID -- get_admin"
echo "   stellar contract invoke --network $NETWORK --id $RATING_ID -- get_admin"
echo ""

print_success "OfferHub contracts successfully deployed and configured!"
