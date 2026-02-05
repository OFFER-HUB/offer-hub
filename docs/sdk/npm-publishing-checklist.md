# NPM Publishing Checklist

Complete checklist and guide for publishing the OfferHub SDK and CLI to NPM.

## 📋 Pre-Publishing Checklist

### SDK Package

#### Requirements Check
- [ ] All features implemented and tested
- [ ] API is stable (no breaking changes expected)
- [ ] All tests pass (\`npm run test\`)
- [ ] Documentation is complete and up-to-date
- [ ] README.md has usage examples
- [ ] TypeScript types are exported correctly
- [ ] Dependencies are up to date
- [ ] No security vulnerabilities (\`npm audit\`)

#### Package Configuration
- [ ] Remove or set \`"private": false\` in package.json
- [ ] Set appropriate version (1.0.0 for first release)
- [ ] Add \`repository\`, \`homepage\`, \`bugs\` fields
- [ ] Add relevant \`keywords\` for discoverability
- [ ] Specify \`files\` array (only include dist/)
- [ ] Set correct \`main\` and \`types\` entry points
- [ ] Add \`prepublishOnly\` script
- [ ] Add \`LICENSE\` file
- [ ] Verify package name is available on NPM

#### Quality Checks
- [ ] Build completes without errors (\`npm run build\`)
- [ ] Dist folder contains all necessary files
- [ ] Type definitions are generated
- [ ] Package size is reasonable (\`npm pack\` and check .tgz size)
- [ ] Local installation test passes
- [ ] No sensitive data in published files

### CLI Package

Same checklist as SDK, plus:
- [ ] Binary is executable (\`#!/usr/bin/env node\` shebang)
- [ ] \`bin\` field in package.json is correct
- [ ] All commands work (\`--help\`, etc.)
- [ ] Cross-platform compatibility tested
- [ ] Error messages are user-friendly

---

## 🚀 Step-by-Step Publishing Guide

### Phase 1: Preparation

#### 1.1 Create NPM Account

If you don't have an NPM account:

1. Go to [npmjs.com](https://www.npmjs.com)
2. Sign up for a free account
3. Verify your email address
4. Enable 2FA (strongly recommended)

#### 1.2 Create Organization (Optional but Recommended)

For \`@offerhub\` scoped packages:

1. Go to [npmjs.com/org/create](https://www.npmjs.com/org/create)
2. Create organization named \`offerhub\`
3. Choose "Unlimited public packages" (free)
4. Invite team members if needed

#### 1.3 Check Package Name Availability

\`\`\`bash
# Check if name is available
npm view @offerhub/sdk

# If it shows "npm error code E404", the name is available
# If it shows package info, the name is taken
\`\`\`

If taken, choose alternative names:
- \`@offerhub/orchestrator-sdk\`
- \`@offerhub/marketplace-sdk\`
- \`offerhub-sdk\` (without scope)

---

### Phase 2: Configure Packages

#### 2.1 Update SDK package.json

\`\`\`json
{
  "name": "@offerhub/sdk",
  "version": "1.0.0",
  "description": "Official TypeScript SDK for the OfferHub Orchestrator API",
  "private": false,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/OFFER-HUB/OFFER-HUB.git",
    "directory": "packages/sdk"
  },
  "homepage": "https://github.com/OFFER-HUB/OFFER-HUB#readme",
  "bugs": {
    "url": "https://github.com/OFFER-HUB/OFFER-HUB/issues"
  },
  "keywords": [
    "offerhub",
    "sdk",
    "escrow",
    "payments",
    "marketplace",
    "typescript",
    "api-client"
  ],
  "author": "OfferHub",
  "license": "MIT",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "ky": "^1.14.3"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
\`\`\`

#### 2.2 Update CLI package.json

\`\`\`json
{
  "name": "@offerhub/cli",
  "version": "1.0.0",
  "description": "CLI tool for OfferHub Orchestrator - API key management and maintenance",
  "private": false,
  "type": "module",
  "bin": {
    "offerhub": "./dist/index.js"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/OFFER-HUB/OFFER-HUB.git",
    "directory": "packages/cli"
  },
  "homepage": "https://github.com/OFFER-HUB/OFFER-HUB#readme",
  "bugs": {
    "url": "https://github.com/OFFER-HUB/OFFER-HUB/issues"
  },
  "keywords": [
    "offerhub",
    "cli",
    "api-key",
    "management",
    "maintenance"
  ],
  "author": "OfferHub",
  "license": "MIT",
  "scripts": {
    "build": "tsc -p tsconfig.json && chmod +x dist/index.js",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "@offerhub/sdk": "^1.0.0",
    "commander": "^11.1.0",
    "inquirer": "^9.2.12",
    "chalk": "^5.3.0",
    "ora": "^7.0.1",
    "dotenv": "^16.3.1",
    "table": "^6.8.1"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
\`\`\`

#### 2.3 Create LICENSE File

Create \`LICENSE\` file in root:

\`\`\`
MIT License

Copyright (c) 2026 OfferHub

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
\`\`\`

---

### Phase 3: Testing Before Publishing

#### 3.1 Build Everything

\`\`\`bash
# Build SDK first (CLI depends on it)
cd packages/sdk
npm run build

# Verify dist folder
ls -la dist/

# Build CLI
cd ../cli
npm run build

# Verify dist folder and executable bit
ls -la dist/
\`\`\`

#### 3.2 Test SDK Locally

\`\`\`bash
cd packages/sdk

# Create tarball
npm pack

# This creates: offerhub-sdk-1.0.0.tgz
# Test install in a temporary project:
mkdir /tmp/test-sdk && cd /tmp/test-sdk
npm init -y
npm install /path/to/offerhub-sdk-1.0.0.tgz

# Test import
node -e "const sdk = require('@offerhub/sdk'); console.log(sdk.OfferHubSDK)"
\`\`\`

#### 3.3 Test CLI Locally

\`\`\`bash
cd packages/cli

# Create tarball
npm pack

# Test install globally
npm install -g ./offerhub-cli-1.0.0.tgz

# Test commands
offerhub --help
offerhub keys --help
offerhub config --help

# Uninstall
npm uninstall -g @offerhub/cli
\`\`\`

#### 3.4 Verify Package Contents

\`\`\`bash
# Extract and inspect tarball
tar -xzf offerhub-sdk-1.0.0.tgz
cd package

# Check what will be published:
# - package.json
# - README.md
# - LICENSE
# - dist/ (with all .js and .d.ts files)

# Make sure NO sensitive files are included:
# - .env files
# - node_modules
# - source files (src/)
# - test files
\`\`\`

---

### Phase 4: Publish to NPM

#### 4.1 Login to NPM

\`\`\`bash
npm login

# You'll be prompted for:
# Username: your-npm-username
# Password: your-npm-password
# Email: your-email@example.com
# One-time password: (if 2FA is enabled)

# Verify login
npm whoami
\`\`\`

#### 4.2 Dry Run (Recommended)

\`\`\`bash
# SDK
cd packages/sdk
npm publish --dry-run

# Review output - it shows:
# - Package size
# - Files that will be published
# - Tarball details

# CLI
cd packages/cli
npm publish --dry-run
\`\`\`

#### 4.3 Publish SDK First

\`\`\`bash
cd packages/sdk

# First time publishing scoped package
npm publish --access public

# You should see:
# + @offerhub/sdk@1.0.0
\`\`\`

**Important:** Publish SDK first because CLI depends on it!

#### 4.4 Publish CLI

\`\`\`bash
cd packages/cli

# Update dependency to use published SDK version
# Edit package.json: "@offerhub/sdk": "^1.0.0"

# Rebuild
npm install
npm run build

# Publish
npm publish --access public

# You should see:
# + @offerhub/cli@1.0.0
\`\`\`

#### 4.5 Verify Publication

\`\`\`bash
# View SDK on NPM
npm view @offerhub/sdk

# View CLI on NPM
npm view @offerhub/cli

# Visit pages:
# https://www.npmjs.com/package/@offerhub/sdk
# https://www.npmjs.com/package/@offerhub/cli
\`\`\`

---

### Phase 5: Post-Publishing

#### 5.1 Test Installation from NPM

\`\`\`bash
# Create fresh test project
mkdir /tmp/test-published && cd /tmp/test-published
npm init -y

# Install SDK
npm install @offerhub/sdk

# Test it works
node -e "const {OfferHubSDK} = require('@offerhub/sdk'); console.log('SDK loaded!')"

# Install CLI globally
npm install -g @offerhub/cli

# Test CLI
offerhub --version
offerhub --help
\`\`\`

#### 5.2 Create GitHub Release

\`\`\`bash
# Tag the release
git tag sdk-v1.0.0
git tag cli-v1.0.0
git push origin --tags

# Create release on GitHub
gh release create sdk-v1.0.0 --title "SDK v1.0.0" --notes "First stable release"
gh release create cli-v1.0.0 --title "CLI v1.0.0" --notes "First stable release"
\`\`\`

#### 5.3 Update Documentation

- [ ] Update README badges with NPM version
- [ ] Update installation instructions
- [ ] Announce on website/blog
- [ ] Share on social media
- [ ] Update CHANGELOG.md

#### 5.4 Monitor

- [ ] Watch NPM download stats
- [ ] Monitor GitHub issues
- [ ] Check for security advisories
- [ ] Respond to user feedback

---

## 🔄 Publishing Updates

### Versioning Strategy

Follow [Semantic Versioning](https://semver.org):

- **PATCH** (1.0.0 → 1.0.1): Bug fixes, no API changes
  \`\`\`bash
  npm version patch
  \`\`\`

- **MINOR** (1.0.0 → 1.1.0): New features, backward compatible
  \`\`\`bash
  npm version minor
  \`\`\`

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
  \`\`\`bash
  npm version major
  \`\`\`

### Update Process

\`\`\`bash
# 1. Make your changes
# 2. Update CHANGELOG.md
# 3. Run tests
npm test

# 4. Bump version (automatically commits and tags)
npm version patch -m "chore: release v%s"

# 5. Build
npm run build

# 6. Publish
npm publish

# 7. Push to GitHub
git push && git push --tags

# 8. Create GitHub release
gh release create v1.0.1 --title "v1.0.1" --notes "Bug fixes"
\`\`\`

---

## 🔧 Troubleshooting

### "You do not have permission to publish"

**Solution:**
\`\`\`bash
# Check you're logged in
npm whoami

# Check org access
npm access ls-packages @offerhub

# Request access from org owner
\`\`\`

### "Package name too similar to existing package"

**Solution:** Choose a different name or add a scope.

### "Cannot publish over existing version"

**Solution:**
\`\`\`bash
npm version patch
npm publish
\`\`\`

### "Missing files in package"

**Solution:** Check \`files\` array in package.json and ensure build completed.

### "Binary doesn't work after install"

**Solution:** 
- Check shebang: \`#!/usr/bin/env node\`
- Verify \`bin\` field in package.json
- Ensure executable bit: \`chmod +x dist/index.js\`

---

## 🤖 Automated Publishing (CI/CD)

### GitHub Actions Workflow

Create \`.github/workflows/publish.yml\`:

\`\`\`yaml
name: Publish to NPM

on:
  push:
    tags:
      - 'v*'

jobs:
  publish-sdk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build SDK
        run: npm run build --workspace=packages/sdk
      
      - name: Publish SDK
        run: npm publish --workspace=packages/sdk --access public
        env:
          NODE_AUTH_TOKEN: \${{ secrets.NPM_TOKEN }}
  
  publish-cli:
    needs: publish-sdk
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build CLI
        run: npm run build --workspace=packages/cli
      
      - name: Publish CLI
        run: npm publish --workspace=packages/cli --access public
        env:
          NODE_AUTH_TOKEN: \${{ secrets.NPM_TOKEN }}
\`\`\`

### Setup NPM Token

1. Generate token: [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens)
2. Choose "Automation" type
3. Add to GitHub secrets: Settings → Secrets → New repository secret
4. Name: \`NPM_TOKEN\`
5. Value: your token

### Trigger Automated Publishing

\`\`\`bash
# Tag and push
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions will automatically publish
\`\`\`

---

## 📊 Post-Launch Monitoring

### NPM Stats

- Check download stats: [npmjs.com/package/@offerhub/sdk](https://npmjs.com/package/@offerhub/sdk)
- Use [npm-stat.com](https://npm-stat.com) for detailed analytics

### GitHub

- Monitor [issues](https://github.com/OFFER-HUB/OFFER-HUB/issues)
- Watch for [security advisories](https://github.com/OFFER-HUB/OFFER-HUB/security)
- Track [pull requests](https://github.com/OFFER-HUB/OFFER-HUB/pulls)

### User Feedback

- Setup [GitHub Discussions](https://github.com/OFFER-HUB/OFFER-HUB/discussions)
- Create Discord/Slack community
- Monitor Stack Overflow questions

---

## ✅ Final Checklist

Before considering publishing complete:

- [ ] SDK published successfully to NPM
- [ ] CLI published successfully to NPM
- [ ] Packages install without errors
- [ ] All functionality works as expected
- [ ] Documentation is accessible and clear
- [ ] GitHub releases created
- [ ] CHANGELOG.md updated
- [ ] Social media announcement posted
- [ ] Community channels setup
- [ ] Monitoring in place
- [ ] Support channels ready

---

## 📚 Resources

- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [NPM Package.json Guide](https://docs.npmjs.com/cli/v10/configuring-npm/package-json)
- [GitHub Actions for NPM](https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages)
