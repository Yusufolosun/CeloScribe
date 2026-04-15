# CeloScribe

Pay-per-use AI access on Celo, built as a MiniApp and backed by on-chain cUSD payments.

## What is CeloScribe

CeloScribe is a Celo-based MiniApp that will let users pay for AI access one request at a time instead of subscribing to a monthly plan. The payment boundary is on-chain: a user approves a cUSD payment through a Celo-compatible wallet, and the application uses that verified payment as the basis for delivering the requested AI result. The repository currently contains the Next.js frontend scaffold, the payment contract workspace, and the documentation and tooling needed for the system that will be completed in later prompts.

## Composer Alignment

CeloScribe keeps the monorepo shape and MiniPay wallet patterns that Celo Composer emphasizes, but it is customized for the CeloScribe product flow.

- `apps/web` keeps the explicit MiniPay connect flow, chain guards, and live CELO/cUSD balance summary.
- `packages/contracts` contains the payment contract workspace.
- The project intentionally does not force MiniPay auto-connect so wallet consent stays explicit.
- See [docs/COMPOSER.md](docs/COMPOSER.md) for the upstream Composer notes and mapping.

## Prerequisites

- Node.js 20 or later
- pnpm 9 or later
- A Celo-compatible wallet for local testing and future MiniApp flows

## Installation

```bash
git clone https://github.com/<your-org>/CeloScribe.git
cd CeloScribe
pnpm install
cp .env.example .env.local
```

If you are only working on the web app, the copied file can stay minimal for now. For contract deployment, add `DEPLOYER_PRIVATE_KEY`, `TREASURY_ADDRESS`, and `CELOSCAN_API_KEY` before running the deploy scripts.

The web app now expects AI provider credentials for DeepSeek, Anthropic, and fal.ai in addition to the existing blockchain and Thirdweb values.

## Development Commands

```bash
pnpm dev         # Runs the workspace development tasks
pnpm build       # Runs the workspace production build
pnpm lint        # Runs the workspace lint pipeline
pnpm test        # Runs workspace tests when present
```

For frontend work specifically, you can run the app directly from `apps/web`:

```bash
pnpm --dir apps/web dev
pnpm --dir apps/web build
pnpm --dir apps/web lint
pnpm --dir apps/web exec vitest run src/lib/ai/**/*.test.ts
```

## Repository Structure

```text
CeloScribe/
├── apps/
│   └── web/               Next.js MiniApp frontend scaffold
├── packages/
│   └── contracts/         Hardhat Solidity workspace for payment logic
├── docs/                  Architecture, security, and API documentation
├── .husky/                Git hooks used by the quality pipeline
├── .prettierrc            Root Prettier configuration
├── .prettierignore        Files excluded from formatting
├── package.json           Workspace scripts and lint-staged config
└── turbo.json             Turborepo task configuration
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).
