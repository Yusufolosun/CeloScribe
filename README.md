# CeloScribe

Pay-per-use AI access on Celo. Request transcription, translation, writing, or image generation—pay only for what you use with cUSD, the Celo stablecoin.

CeloScribe is a production-grade Web3 application that demonstrates on-chain payment verification coupled with AI service delivery. Built as a Celo MiniApp, it enables seamless AI access through a mobile-first experience backed by real cUSD payments.

## Features

- **Pay-Per-Use Model**: No subscriptions. Pay only for individual AI requests via on-chain cUSD transactions.
- **MiniPay Integration**: Native Celo MiniPay support for the smoothest payment experience on mobile.
- **Multiple AI Tasks**: Transcription, translation, long-form writing, short-form writing, and image generation.
- **On-Chain Verification**: Payment verification is cryptographically proven on the blockchain before AI work proceeds.
- **Transaction History**: View all completed tasks and their associated blockchain payments.
- **Mobile-First Design**: Fully responsive interface optimized for mobile-first Web3 users.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, Wagmi, Viem, React Query
- **Blockchain**: Celo, Solidity smart contracts, Ethers.js for testing
- **AI Providers**: DeepSeek, Anthropic, fal.ai
- **Web3 SDKs**: Wagmi, Viem, Thirdweb, MiniPay
- **Infrastructure**: Vercel deployment, Celoscan block explorer integration

## Quick Start

### Prerequisites

- Node.js 20 or later
- pnpm 9 or later
- A Celo-compatible wallet (MiniPay, MetaMask with Celo network)

### Installation

```bash
git clone https://github.com/your-org/CeloScribe.git
cd CeloScribe
pnpm install
cp .env.example .env.local
```

### Development

```bash
# Start the development server
pnpm dev

# Run from specific workspace
pnpm --dir apps/web dev

# Run tests
pnpm test

# Run linting
pnpm lint

# Check types
pnpm --dir apps/web typecheck
```

Visit `http://localhost:3000` to see the app. The application runs on Celo mainnet by default; adjust `NEXT_PUBLIC_CELO_RPC_URL` in `.env.local` to use testnet.

## Environment Variables

Create a `.env.local` file in the root (this file is not committed):

```bash
# Blockchain & Deployment (for mainnet deployments only)
DEPLOYER_PRIVATE_KEY=                  # Private key of deployer wallet
TREASURY_ADDRESS=                       # Address where cUSD revenue is withdrawn
CELOSCAN_API_KEY=                       # From https://celoscan.io/myapikey
CELO_RPC_URL=https://forno.celo.org   # Mainnet RPC
ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org  # Testnet RPC

# Frontend Configuration
NEXT_PUBLIC_CELO_RPC_URL=https://forno.celo.org
NEXT_PUBLIC_CELOSCRIBE_CONTRACT_ADDRESS=  # Set after contract deployment
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=           # From Thirdweb dashboard

# AI Provider Keys
DEEPSEEK_API_KEY=                    # For text generation tasks
ANTHROPIC_API_KEY=                   # For long-form writing
FAL_API_KEY=                         # For image generation
```

**Never commit `.env.local` or any file containing private keys, seed phrases, or API keys.**

## Project Structure

```
CeloScribe/
├── apps/web/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/                # Next.js app directory
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utilities and AI routing
│   │   ├── providers/          # Web3 provider setup
│   │   └── styles/             # CSS and design tokens
│   └── e2e/                    # End-to-end tests
├── packages/contracts/         # Solidity smart contracts
│   ├── contracts/              # Contract source files
│   ├── deployments/            # Deployment addresses
│   ├── scripts/                # Deployment and setup scripts
│   └── test/                   # Contract tests
├── docs/                       # Documentation
│   ├── API.md                  # API reference
│   ├── ARCHITECTURE.md         # System design
│   ├── SECURITY.md             # Security guidelines
│   └── COMPOSER.md             # Celo Composer alignment
├── CONTRIBUTING.md             # Contribution guidelines
└── README.md                   # This file
```

## Architecture

CeloScribe operates as a four-layer system:

1. **MiniApp UI Layer**: React components for user interaction and wallet connection
2. **Smart Contract Layer**: On-chain payment boundary and verification
3. **API Layer**: Next.js routes for server-side request validation and AI routing
4. **AI Provider Layer**: Adapter pattern for DeepSeek, Anthropic, and fal.ai

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed system design.

## Payment Flow

1. User selects an AI task and enters a prompt
2. Task is validated locally against token/length limits
3. User reviews and confirms payment in their Celo wallet
4. Smart contract records the cUSD payment on-chain
5. API route verifies the on-chain payment before proceeding
6. AI provider generates the result
7. Result is delivered to the user in the MiniApp UI

Payment verification is the security boundary: no AI work proceeds without cryptographic proof of on-chain payment.

## Deploying to Mainnet

### Prerequisites

1. Ensure `.env.local` is populated with:
   - `DEPLOYER_PRIVATE_KEY`: Wallet with sufficient CELO and cUSD
   - `TREASURY_ADDRESS`: Where revenue will be withdrawn
   - `CELOSCAN_API_KEY`: For contract verification
   - `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`: Thirdweb SDK key
   - All AI provider keys

2. Run validation:

```bash
pnpm --dir packages/contracts test
pnpm --dir packages/contracts compile
pnpm --dir apps/web lint
pnpm --dir apps/web test
pnpm --dir apps/web build
```

3. Deploy the contract:

```bash
pnpm --dir packages/contracts deploy:mainnet
```

4. Copy the returned contract address to `NEXT_PUBLIC_CELOSCRIBE_CONTRACT_ADDRESS`

5. Update `apps/web/src/lib/contracts/celoScribeDeployment.ts` with deployment block number

6. Rebuild and deploy the frontend:

```bash
pnpm --dir apps/web build
```

7. Test end-to-end on mainnet from a MiniPay wallet

## Documentation

- **[Architecture](docs/ARCHITECTURE.md)**: System design, payment flow, and layer responsibilities
- **[API Reference](docs/API.md)**: Payment verification, task generation, and webhook routes
- **[Security](docs/SECURITY.md)**: Secret management, on-chain verification, and security expectations
- **[Contributing](CONTRIBUTING.md)**: Commit conventions, branching strategy, and code review process

## Testing

```bash
# Unit tests
pnpm --dir apps/web test

# Contract tests
pnpm --dir packages/contracts test

# End-to-end tests
pnpm --dir apps/web test:e2e

# Type checking
pnpm --dir apps/web typecheck

# Linting
pnpm lint

# Full deployment check
pnpm --dir apps/web check:deploy
```

## Security

- All secrets are stored in `.env.local` (never committed)
- Private keys and API keys remain server-side only
- On-chain payment verification is cryptographically enforced
- Rate limiting is applied server-side by wallet address
- Contract is verified on Celoscan for transparency

See [docs/SECURITY.md](docs/SECURITY.md) for complete security guidelines.

## Support & Community

- GitHub Issues: Report bugs and request features
- GitHub Discussions: Ask questions and share ideas
- Documentation: See `docs/` directory for detailed guides

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Contributing

We welcome contributions from developers, designers, and community members. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- Code style and commit conventions
- Pull request process
- Testing and validation requirements
- Documentation standards

## Acknowledgments

CeloScribe is built on the Celo ecosystem and follows Celo Composer patterns. Special thanks to the Celo community for the MiniPay infrastructure and Web3 tooling.
├── packages/
│ └── contracts/ Hardhat Solidity workspace for payment logic
├── docs/ Architecture, security, and API documentation
├── .husky/ Git hooks used by the quality pipeline
├── .prettierrc Root Prettier configuration
├── .prettierignore Files excluded from formatting
├── package.json Workspace scripts and lint-staged config
└── turbo.json Turborepo task configuration

```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).
```
