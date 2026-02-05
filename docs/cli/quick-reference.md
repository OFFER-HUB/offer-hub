# CLI Quick Reference

Quick reference guide for the OfferHub CLI tool.

## Installation

\`\`\`bash
npm install -g @offerhub/cli
\`\`\`

## Configuration

\`\`\`bash
# Interactive setup
offerhub config set

# Show current config
offerhub config show

# Or use environment variables
export OFFERHUB_API_URL=http://localhost:3000
export OFFERHUB_API_KEY=ohk_your_key
\`\`\`

---

## API Keys

### List Keys

\`\`\`bash
# List all keys
offerhub keys list

# Filter by user
offerhub keys list --user-id usr_123
\`\`\`

### Create Key

\`\`\`bash
# Interactive
offerhub keys create

# With options
offerhub keys create \\
  --user-id usr_123 \\
  --scopes read,write \\
  --name "Production Key"
\`\`\`

### Revoke Key

\`\`\`bash
# With confirmation
offerhub keys revoke key_abc123

# Skip confirmation
offerhub keys revoke key_abc123 --yes
\`\`\`

### Generate Token

\`\`\`bash
# Default TTL (1 hour)
offerhub keys token key_abc123

# Custom TTL (2 hours)
offerhub keys token key_abc123 --ttl 7200
\`\`\`

---

## Maintenance Mode

### Enable

\`\`\`bash
# Interactive
offerhub maintenance enable

# With options
offerhub maintenance enable \\
  --message "Scheduled upgrade" \\
  --yes
\`\`\`

### Disable

\`\`\`bash
# Interactive
offerhub maintenance disable

# Skip confirmation
offerhub maintenance disable --yes
\`\`\`

### Check Status

\`\`\`bash
offerhub maintenance status
\`\`\`

---

## Common Workflows

### Setup for New Environment

\`\`\`bash
# 1. Configure CLI
offerhub config set

# 2. Create admin key
offerhub keys create \\
  --user-id usr_admin \\
  --scopes read,write,support \\
  --name "Admin Key"

# 3. Verify configuration
offerhub config show
\`\`\`

### Manage Keys for User

\`\`\`bash
# List user's keys
offerhub keys list --user-id usr_123

# Create read-only key
offerhub keys create \\
  --user-id usr_123 \\
  --scopes read \\
  --name "Mobile App (Read Only)"

# Generate short-lived token
offerhub keys token key_abc123 --ttl 3600
\`\`\`

### Perform Maintenance

\`\`\`bash
# Check current status
offerhub maintenance status

# Enable maintenance
offerhub maintenance enable \\
  --message "Database upgrade in progress" \\
  --yes

# After maintenance
offerhub maintenance disable --yes

# Verify normal operation
offerhub maintenance status
\`\`\`

---

## Help Commands

\`\`\`bash
# General help
offerhub --help

# Command help
offerhub keys --help
offerhub maintenance --help

# Subcommand help
offerhub keys create --help
\`\`\`

---

## Configuration Files

### Global Config

\`\`\`
~/.offerhub/config.json
\`\`\`

### Local .env File

\`\`\`env
OFFERHUB_API_URL=http://localhost:3000
OFFERHUB_API_KEY=ohk_your_key
\`\`\`

---

## Exit Codes

- \`0\` - Success
- \`1\` - Error (with error message)

---

## See Also

- [CLI README](../../packages/cli/README.md) - Full documentation
- [SDK Integration Guide](../sdk/integration-guide.md) - Using the SDK
- [API Documentation](../api/README.md) - API reference
