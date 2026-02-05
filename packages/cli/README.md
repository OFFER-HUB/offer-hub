# @offerhub/cli

Command-line tool for managing the OfferHub Orchestrator. Provides utilities for API key management and maintenance operations.

## Installation

```bash
# Global installation
npm install -g @offerhub/cli

# Or use with npx
npx @offerhub/cli
```

## Quick Start

### 1. Configure the CLI

```bash
# Interactive configuration
offerhub config set

# Or set via environment variables
export OFFERHUB_API_URL=https://api.offerhub.com
export OFFERHUB_API_KEY=ohk_your_admin_key
```

### 2. Use Commands

```bash
# List API keys
offerhub keys list

# Create a new API key
offerhub keys create

# Check maintenance status
offerhub maintenance status
```

## Configuration

The CLI supports three configuration methods (in priority order):

### 1. Environment Variables

```bash
export OFFERHUB_API_URL=https://api.offerhub.com
export OFFERHUB_API_KEY=ohk_your_admin_key
```

### 2. .env File

Create a `.env` file in your current directory:

```env
OFFERHUB_API_URL=https://api.offerhub.com
OFFERHUB_API_KEY=ohk_your_admin_key
```

### 3. Global Config File

```bash
# Set configuration interactively
offerhub config set

# Configuration is saved to ~/.offerhub/config.json
```

## Commands

### Config Commands

#### `offerhub config set`

Set API configuration interactively.

```bash
offerhub config set

# Or with options
offerhub config set --api-url https://api.offerhub.com --api-key ohk_xxx
```

#### `offerhub config show`

Display current configuration.

```bash
offerhub config show
```

### API Key Management

#### `offerhub keys list`

List all API keys.

```bash
# List all keys
offerhub keys list

# Filter by user ID
offerhub keys list --user-id usr_123
```

Output:
```
┌──────────┬─────────────┬──────────┬───────────────┬────────────┬───────────┐
│ ID       │ Key         │ User ID  │ Scopes        │ Created    │ Last Used │
├──────────┼─────────────┼──────────┼───────────────┼────────────┼───────────┤
│ key_abc  │ ohk_***xyz  │ usr_123  │ read, write   │ 1/1/2026   │ 1/5/2026  │
└──────────┴─────────────┴──────────┴───────────────┴────────────┴───────────┘
```

#### `offerhub keys create`

Create a new API key.

```bash
# Interactive mode
offerhub keys create

# With options
offerhub keys create \
  --user-id usr_123 \
  --scopes read,write \
  --name "Production API Key"
```

Options:
- `-u, --user-id <userId>` - User ID (required)
- `-s, --scopes <scopes>` - Comma-separated scopes: read, write, support
- `-n, --name <name>` - Key name/description (optional)

Output:
```
✓ API key created successfully!

⚠️  IMPORTANT: Save this key now. You won't be able to see it again!

API Key: ohk_abc123xyz...
Key ID: key_abc123
User ID: usr_123
Scopes: read, write
```

#### `offerhub keys revoke <keyId>`

Revoke an API key.

```bash
# Interactive confirmation
offerhub keys revoke key_abc123

# Skip confirmation
offerhub keys revoke key_abc123 --yes
```

Options:
- `-y, --yes` - Skip confirmation prompt

#### `offerhub keys token <keyId>`

Generate a short-lived token from an API key.

```bash
# Generate token with default TTL (1 hour)
offerhub keys token key_abc123

# Custom TTL (in seconds)
offerhub keys token key_abc123 --ttl 7200
```

Options:
- `-t, --ttl <seconds>` - Token TTL in seconds (default: 3600)

Output:
```
✓ Token generated successfully!

Token: ohk_tok_xyz...
Expires: 1/5/2026, 2:00:00 PM

⚠️  This token will expire. Save it now!
```

### Maintenance Mode

#### `offerhub maintenance enable`

Enable maintenance mode (makes API read-only).

```bash
# Interactive mode
offerhub maintenance enable

# With options
offerhub maintenance enable \
  --message "Scheduled maintenance" \
  --yes
```

Options:
- `-m, --message <message>` - Maintenance message
- `-y, --yes` - Skip confirmation

#### `offerhub maintenance disable`

Disable maintenance mode.

```bash
# Interactive mode
offerhub maintenance disable

# Skip confirmation
offerhub maintenance disable --yes
```

Options:
- `-y, --yes` - Skip confirmation

#### `offerhub maintenance status`

Check maintenance mode status.

```bash
offerhub maintenance status
```

Output when enabled:
```
Maintenance Mode Status:

Status: ENABLED
Message: Scheduled maintenance
Enabled: 1/5/2026, 1:00:00 PM
Enabled by: admin@example.com
```

Output when disabled:
```
Maintenance Mode Status:

Status: NORMAL
API is operating normally
```

## Examples

### Manage API Keys for a User

```bash
# Create a new read-only key
offerhub keys create \
  --user-id usr_buyer123 \
  --scopes read \
  --name "Mobile App (Read Only)"

# List all keys for the user
offerhub keys list --user-id usr_buyer123

# Generate a short-lived token for frontend use
offerhub keys token key_abc123 --ttl 3600
```

### Perform Maintenance

```bash
# Check current status
offerhub maintenance status

# Enable maintenance mode
offerhub maintenance enable \
  --message "Database upgrade in progress" \
  --yes

# After maintenance is complete
offerhub maintenance disable --yes
```

## Error Handling

The CLI provides clear error messages and exits with appropriate codes:

```bash
# Missing configuration
❌ Error: No configuration found.

Please configure the CLI using one of these methods:

1. Environment variables:
   export OFFERHUB_API_URL=https://api.offerhub.com
   export OFFERHUB_API_KEY=ohk_your_api_key

2. .env file in current directory:
   OFFERHUB_API_URL=https://api.offerhub.com
   OFFERHUB_API_KEY=ohk_your_api_key

3. Run: offerhub config set
```

## Platform Support

The CLI works on:
- ✅ macOS
- ✅ Linux
- ✅ Windows (with WSL or Git Bash)

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Type check
npm run type-check
```

## License

MIT
