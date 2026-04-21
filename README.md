# CeloScribe

Pay-per-use AI access on Celo, built as a MiniApp and backed by on-chain cUSD payments.

## What is CeloScribe

CeloScribe is a Celo-based MiniApp that will let users pay for AI access one request at a time instead of subscribing to a monthly plan. The payment boundary is on-chain: a user approves a cUSD payment through a Celo-compatible wallet, and the application uses that verified payment as the basis for delivering the requested AI result. The repository currently contains the Next.js frontend scaffold, the payment contract workspace, and the documentation and tooling needed for the system that will be completed in later prompts.

## Composer Alignment

CeloScribe keeps the monorepo shape and MiniPay wallet patterns that Celo Composer emphasizes, but it is customized for the CeloScribe product flow.

- `apps/web` keeps the explicit MiniPay connect flow, chain guards, and live CELO/cUSD balance summary.
- The composer validates prompt length against the selected task limit before payment opens, so oversized requests are blocked locally instead of failing after an on-chain payment.
- Translate requests now require a target-language selection in the compose flow, and the confirmed language is carried through payment and `/api/task/generate` so the output matches the request the user approved.
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

The web app also expects AI provider credentials for DeepSeek, Anthropic, and fal.ai, plus the blockchain and Thirdweb values used by the MiniApp shell.

## Mainnet Deployment Checklist

Before deploying to Celo mainnet, make sure you have all of the following ready:

1. A funded deployer wallet with the private key exported as `DEPLOYER_PRIVATE_KEY`.
2. A treasury wallet address exported as `TREASURY_ADDRESS`. This is where cUSD revenue will ultimately be withdrawn.
3. A Celoscan API key exported as `CELOSCAN_API_KEY` for contract verification.
4. A production RPC URL exported as `NEXT_PUBLIC_CELO_RPC_URL`.
5. The deployed contract address exported as `NEXT_PUBLIC_CELOSCRIBE_CONTRACT_ADDRESS` after deployment.
6. A Thirdweb secret key and client ID exported as `THIRDWEB_SECRET_KEY` and `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`.
7. AI provider credentials exported as `DEEPSEEK_API_KEY`, `ANTHROPIC_API_KEY`, and `FAL_API_KEY`.
8. A local `.env.local` file that is not committed.

Recommended validation steps before mainnet:

```bash
pnpm --dir packages/contracts test
pnpm --dir packages/contracts compile
pnpm --dir apps/web test
pnpm --dir apps/web lint
pnpm --dir apps/web build
```

## Deploying To Mainnet

1. Populate `.env.local` with the values above.
2. Run the contract deployment script:

```bash
pnpm --dir packages/contracts deploy:mainnet
```

3. Copy the printed contract address into `NEXT_PUBLIC_CELOSCRIBE_CONTRACT_ADDRESS`.
4. Update `apps/web/src/lib/contracts/celoScribeDeployment.ts` with the new deployment block so the history tab keeps its scan bounded.
5. Re-run `pnpm --dir apps/web build` so the frontend bakes in the deployed address.
6. Deploy the web app to your host of choice after the build succeeds.
7. Send a small end-to-end test payment from MiniPay on Celo mainnet and confirm the `/api/task/generate` flow succeeds.

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
