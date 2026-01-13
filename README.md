# OFFER-HUB Orchestrator

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js" alt="Node.js 20" />
  <img src="https://img.shields.io/badge/TypeScript-5.4-blue?style=for-the-badge&logo=typescript" alt="TS 5.4" />
  <img src="https://img.shields.io/badge/NestJS-10.x-red?style=for-the-badge&logo=nestjs" alt="NestJS 10" />
  <img src="https://img.shields.io/badge/Prisma-5.x-teal?style=for-the-badge&logo=prisma" alt="Prisma 5" />
  <img src="https://img.shields.io/badge/Stellar-Wallet-black?style=for-the-badge&logo=stellar" alt="Stellar" />
</p>

```
 ██████╗ ███████╗███████╗███████╗██████╗       ██╗  ██╗██╗   ██╗██████╗ 
██╔═══██╗██╔════╝██╔════╝██╔════╝██╔══██╗      ██║  ██║██║   ██║██╔══██╗
██║   ██║█████╗  █████╗  █████╗  ██████╔╝█████╗███████║██║   ██║██████╔╝
██║   ██║██╔══╝  ██╔══╝  ██╔══╝  ██╔══██╗╚════╝██╔══██║██║   ██║██╔══██╗
╚██████╔╝██║     ██║     ███████╗██║  ██║      ██║  ██║╚██████╔╝██████╔╝
 ╚═════╝ ╚═╝     ╚═╝     ╚══════╝╚═╝  ╚═╝      ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ 
                                                                        
---------------------- Marketplaces Orchestrator ----------------------
```

**OFFER-HUB Orchestrator** is a self-hosted payments orchestration system designed for Marketplaces. It manages a Web2-like experience (balances, top-ups, payments with escrow, and withdrawals) using **Airtm** for fund management and **Trustless Work** for non-custodial escrows on the Stellar network.

## 🚀 Features

- 💰 **User Balances**: Internal management of available and reserved balances.
- ⚡ **Top-ups**: Fast reloads via Airtm.
- 🤝 **Smart Escrow**: Secure checkout with non-custodial escrow via TW.
- 💸 **Withdrawals**: Direct withdrawals to Airtm accounts.
- 🔐 **Secure & Audited**: Native idempotency, audit logs, and modular architecture.

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (API Server)
- **Runtime**: Node.js 20 LTS
- **Database**: PostgreSQL (via Prisma ORM)
- **Cache & Queues**: Redis + [BullMQ](https://docs.bullmq.io/)
- **Monorepo**: npm Workspaces

## 🏁 Quick Start

1. **Clone and Prepare**:
   ```bash
   git clone <repo-url>
   cd OFFER-HUB-Orchestrator
   cp .env.example .env
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Generate Database Client**:
   ```bash
   npm run prisma:generate
   ```

4. **Start Infrastructure (Optional)**:
   If you don't have local Postgres/Redis, use Docker:
   ```bash
   docker compose up -d
   ```

5. **Run in Development**:
   You can start both the API and the Worker concurrently:
   ```bash
   npm run dev
   ```
   *Note: This starts the API on port 4000 and the Worker in the same terminal.*

## 🏗️ Project Structure

- `apps/api`: Main NestJS server. Run with `npm run dev:api`.
- `apps/worker`: Asynchronous task processor. Run with `npm run dev:worker`.
- `packages/shared`: Shared code (DTOs, Enums, Utils).
- `packages/database`: Prisma schema and migrations.
- `packages/sdk`: Official client for marketplaces.

## 📚 Documentation

Detailed documentation can be found in the [`/docs`](./docs/) folder:

- 🧠 [AI.md](./docs/AI.md) - **Development guide for AIs (Read first)**
- 📐 [Architecture](./docs/architecture/overview.md)
- 🔌 [API Overview](./docs/api/overview.md)
- ⚙️ [Environment Configuration](./docs/deployment/env-variables.md)

## 🤝 Contributing

Want to help? Read our [Contribution Guide](./docs/CONTRIBUTING.md).

---

<p align="center">
  <i>Built with ❤️ for the decentralized marketplace future.</i>
</p>
