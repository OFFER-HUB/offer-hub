# Contribution Guide

Thank you for your interest in contributing to **OFFER-HUB Orchestrator**! To maintain code quality and consistency, we follow these standards.

## 🛠️ Local Setup

### Cloning the Repository
```bash
git clone <repo-url>
cd OFFER-HUB-Orchestrator
```

### Installation
Ensure you have **Node.js 20+** and **npm 9+**.
```bash
npm install
```

### Configuration
Copy the example file and fill in the variables:
```bash
cp .env.example .env
```

## 🚀 Development Commands

The project uses **npm Workspaces**. You can run the services from the root:

- **Both Services (Concurrent)**: `npm run dev` (Starts API and Worker together)
- **API Server Only**: `npm run dev:api`
- **Worker Process Only**: `npm run dev:worker`
- **Generate Prisma Client**: `npm run prisma:generate`

### Running Separately
If you prefer to see logs in separate terminals, you can open two windows and run:
1. `npm run dev:api`
2. `npm run dev:worker`

## 🌿 Git Standards

### Branch Naming
We use prefixes to identify the type of change:

- `feat/feature-name`: New features.
- `fix/error-description`: Bug fixes.
- `bug/ticket-reference`: Critical reported bugs.
- `refactor/affected-area`: Changes that don't affect functionality.
- `docs/doc-name`: Documentation improvements.

### Atomic Commits
Commit messages should be clear and in English. We recommend following [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user balance check resource
fix: handle provider timeout in topup flow
docs: update api-overview with new response format
```

## 📐 Code Standards

Before submitting a change, ensure you:
1. Follow the **Naming Conventions** defined in [`docs/AI.md`](./docs/AI.md).
2. Use the correct **ID Prefixes** (`usr_`, `ord_`, etc.).
3. Verify that **Amounts** follow the string format with 2 decimal places (`"100.00"`).
4. Do not break the **State Machine** of the resources.

## 📬 Pull Request Process

1. Create a branch from `main`.
2. Make your changes and use atomic commits.
3. Ensure the project builds correctly (`npm run build`).
4. Open a PR using our Pull Request template.
5. Wait for a maintainer's review.

---

Questions? Consult the [AI Agent Guide](./docs/AI.md).
