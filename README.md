# CeloScribe

CeloScribe is a pay-per-use AI application on Celo. Users select a task, pay in cUSD, and receive AI output only after on-chain payment verification.

## What It Solves

Most AI products require monthly subscriptions even when usage is low. CeloScribe uses a transaction-based model: one task, one payment, one result.

## Core Features

- On-chain cUSD payments for each task
- MiniPay-first wallet UX with injected-wallet fallback
- Payment verification before every AI request
- Task routing across text, translation, and image providers
- Transaction history sourced from contract events

## Monorepo Structure

```text
CeloScribe/
├── apps/
│   └── web/                 Next.js frontend + API routes
├── packages/
│   └── contracts/           Solidity contracts + Hardhat workspace
├── docs/                    Architecture, API, security, and composer notes
├── CONTRIBUTING.md
└── README.md
```

## Prerequisites

- Node.js 20+
- pnpm 9+
- Celo-compatible wallet (MiniPay recommended)

## Quick Start

```bash
git clone https://github.com/your-org/CeloScribe.git
cd CeloScribe
pnpm install
cp .env.example .env.local
```

Start development:

```bash
pnpm dev
```

Or run only the web app:

```bash
pnpm --dir apps/web dev
```

## Environment Variables

Use root `.env.local` for local development (never commit it).

Required values for the current implementation:

```bash
# Blockchain
NEXT_PUBLIC_CELOSCRIBE_CONTRACT_ADDRESS=
NEXT_PUBLIC_CELO_RPC_URL=https://forno.celo.org

# AI providers
DEEPSEEK_API_KEY=
FAL_API_KEY=
ANTHROPIC_API_KEY=

# Thirdweb
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=
THIRDWEB_SECRET_KEY=
```

Deployment-related values (contract deployment and verification):

```bash
DEPLOYER_PRIVATE_KEY=
TREASURY_ADDRESS=
CELOSCAN_API_KEY=
ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org
CELO_RPC_URL=https://forno.celo.org
```

## Payment Flow

1. User selects task type and enters prompt
2. Frontend validates prompt limits locally
3. User approves and submits cUSD payment transaction
4. Backend verifies `PaymentReceived` event on-chain
5. Backend routes task to provider and returns result

If payment verification fails, task generation is rejected.

## Commands

Workspace commands:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm test
```

Targeted commands:

```bash
pnpm --dir apps/web lint
pnpm --dir apps/web test
pnpm --dir apps/web build
pnpm --dir packages/contracts test
pnpm --dir packages/contracts compile
```

## Mainnet Deployment Checklist

1. Set all required environment variables in secure secret storage
2. Run tests, lint, and build
3. Deploy contracts from `packages/contracts`
4. Set `NEXT_PUBLIC_CELOSCRIBE_CONTRACT_ADDRESS`
5. Rebuild and deploy `apps/web`
6. Verify first end-to-end payment on Celo mainnet

## Documentation

- `docs/API.md` API behavior and response semantics
- `docs/ARCHITECTURE.md` system design and component boundaries
- `docs/SECURITY.md` security model and secret handling
- `docs/COMPOSER.md` composer alignment notes
- `CONTRIBUTING.md` engineering and review guidelines

## Security Notes

- Secrets are server-side only
- `.env*` and key material are ignored by `.gitignore`
- Client wallet state is not treated as authorization
- On-chain verification is the payment gate

## Contributing

See `CONTRIBUTING.md`.
