# SDK Publishing Guide

This guide explains how to publish the OfferHub SDK to NPM so other developers can install it.

## 📋 Current Status

The SDK is currently marked as **private** in `packages/sdk/package.json`:

\`\`\`json
{
  "name": "@offerhub/sdk",
  "private": true,  // ← This prevents publishing to NPM
  "version": "0.0.0"
}
\`\`\`

---

## 🚀 Publishing to NPM

### Prerequisites

1. **NPM Account**: Create an account at [npmjs.com](https://www.npmjs.com)
2. **Organization** (Optional but recommended): Create an organization for `@offerhub` scope
3. **NPM Authentication**: Login on your machine

### Step 1: Prepare the Package

#### Update package.json

\`\`\`json
{
  "name": "@offerhub/sdk",
  "version": "1.0.0",
  "private": false,  // Remove or set to false
  "description": "Official TypeScript SDK for the OfferHub Orchestrator API",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
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
    "typescript"
  ],
  "author": "OfferHub",
  "license": "MIT",
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "ky": "^1.14.3"
  }
}
\`\`\`

Key changes:
- Set `"private": false` or remove it entirely
- Add proper version number (start with 1.0.0)
- Add `repository`, `homepage`, and `bugs` for better NPM page
- Add `keywords` for discoverability
- Add `files` array to specify what to publish (only dist folder)
- Add `prepublishOnly` script to ensure build runs before publishing

### Step 2: Login to NPM

\`\`\`bash
npm login
\`\`\`

Enter your NPM credentials when prompted.

### Step 3: Build the Package

\`\`\`bash
cd packages/sdk
npm run build
\`\`\`

Verify that the `dist` folder contains all necessary files:
\`\`\`bash
ls -la dist/
\`\`\`

### Step 4: Test Locally Before Publishing

Test the package locally to ensure it works:

\`\`\`bash
# In packages/sdk
npm pack

# This creates a .tgz file like: offerhub-sdk-1.0.0.tgz
# You can install it locally to test:
# npm install ./offerhub-sdk-1.0.0.tgz
\`\`\`

### Step 5: Publish to NPM

#### Dry Run First (Recommended)

\`\`\`bash
npm publish --dry-run
\`\`\`

This shows what would be published without actually publishing.

#### Publish for Real

\`\`\`bash
# If using @offerhub scope for the first time, make it public
npm publish --access public

# For subsequent versions
npm publish
\`\`\`

### Step 6: Verify Publication

Check that your package is live:
\`\`\`bash
npm view @offerhub/sdk
\`\`\`

Visit: https://www.npmjs.com/package/@offerhub/sdk

---

## 🔄 Publishing Updates

### Semantic Versioning

Follow [semver](https://semver.org/):
- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features, backward compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes

### Update Version

\`\`\`bash
# Patch release (1.0.0 → 1.0.1)
npm version patch

# Minor release (1.0.0 → 1.1.0)
npm version minor

# Major release (1.0.0 → 2.0.0)
npm version major
\`\`\`

This automatically:
1. Updates version in package.json
2. Creates a git commit
3. Creates a git tag

### Publish Update

\`\`\`bash
npm publish
git push && git push --tags
\`\`\`

---

## 📦 Alternative: GitHub Packages

If you don't want to use NPM, you can publish to GitHub Packages:

### Step 1: Update package.json

\`\`\`json
{
  "name": "@offerhub/sdk",
  "version": "1.0.0",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
\`\`\`

### Step 2: Authenticate

Create a GitHub Personal Access Token with `write:packages` scope.

\`\`\`bash
npm login --scope=@offerhub --registry=https://npm.pkg.github.com
# Username: your-github-username
# Password: your-github-token
\`\`\`

### Step 3: Publish

\`\`\`bash
npm publish
\`\`\`

### Installing from GitHub Packages

Users will need to configure their `.npmrc`:

\`\`\`
@offerhub:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
\`\`\`

---

## 🔒 Private NPM Registry

For internal use, you can use a private NPM registry:

### Options:
1. **Verdaccio**: Self-hosted private NPM registry
2. **npm private packages**: Pay for private packages on npmjs.com
3. **GitHub Packages**: Free for public repos, paid for private
4. **AWS CodeArtifact**: AWS-managed artifact repository
5. **JFrog Artifactory**: Enterprise artifact management

---

## 🤖 Automated Publishing (CI/CD)

### GitHub Actions

Create `.github/workflows/publish-sdk.yml`:

\`\`\`yaml
name: Publish SDK

on:
  push:
    tags:
      - 'sdk-v*'

jobs:
  publish:
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
      
      - name: Publish to NPM
        run: npm publish --workspace=packages/sdk --access public
        env:
          NODE_AUTH_TOKEN: \${{ secrets.NPM_TOKEN }}
\`\`\`

Usage:
\`\`\`bash
# Tag a release
git tag sdk-v1.0.0
git push origin sdk-v1.0.0

# GitHub Actions will automatically publish
\`\`\`

---

## 📝 Checklist Before Publishing

- [ ] Update version number in package.json
- [ ] Build the package (\`npm run build\`)
- [ ] Test the package locally (\`npm pack\` and install)
- [ ] Update CHANGELOG.md with changes
- [ ] Ensure README.md is up to date
- [ ] Verify all dependencies are correct
- [ ] Run tests (\`npm test\`)
- [ ] Do a dry run (\`npm publish --dry-run\`)
- [ ] Publish! (\`npm publish --access public\`)
- [ ] Create GitHub release
- [ ] Update documentation

---

## 🛠️ Current Recommendation

**For now, keep the SDK private** until:

1. ✅ API is stable and tested
2. ✅ All features are implemented
3. ✅ Documentation is complete
4. ✅ Tests are written
5. ✅ You're ready to support external users

**When ready to publish:**

1. Choose a unique package name (check if `@offerhub/sdk` is available)
2. Create an NPM organization `@offerhub`
3. Follow the publishing steps above
4. Announce on your website/blog
5. Monitor issues and support requests

---

## 📚 Resources

- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [GitHub Packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
- [Verdaccio](https://verdaccio.org/)

---

## 🆘 Troubleshooting

### "You do not have permission to publish"

Make sure you're logged in and have access to the `@offerhub` scope:
\`\`\`bash
npm whoami
npm access ls-packages @offerhub
\`\`\`

### "Package name too similar to existing package"

NPM prevents similar names. Choose a more unique name or add a scope.

### "Cannot publish over existing version"

You need to bump the version:
\`\`\`bash
npm version patch
npm publish
\`\`\`

### "Missing files in package"

Check your `files` array in package.json and ensure `dist` folder exists.
