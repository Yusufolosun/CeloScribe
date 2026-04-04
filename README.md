# CeloScribe

> Pay-per-use AI tools inside MiniPay. No subscription. No credit card. Just cUSD.

CeloScribe is a MiniApp built on the Celo blockchain that gives MiniPay users access to AI-powered tools — text generation, translation, and image creation — for micro-payments starting at $0.01 per task, paid in cUSD.

## Why CeloScribe?

- ChatGPT Plus costs $20/month. That is 10–15% of monthly income for many users in Nigeria and Kenya.
- CeloScribe charges per use. $0.01 for a short text. $0.05 for a long-form piece. $0.08 for an image.
- Payment is automatic, on-chain, and settled in under 1 second via Celo's L2 infrastructure.
- No wallet setup beyond MiniPay. No gas management. No subscriptions.

## Architecture Overview

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for full system design.

## Getting Started

### Prerequisites
- Node.js ≥ 20
- pnpm ≥ 9
- A MiniPay or any Celo-compatible wallet for testing

### Installation
```bash
git clone https://github.com/<your-username>/celoscribe.git
cd celoscribe
pnpm install
cp .env.example .env.local
# Fill in .env.local with real values — see .env.example for required keys
```

### Development
```bash
pnpm dev         # Starts the Next.js app at localhost:3000
```

### Testing
```bash
pnpm test        # Runs all tests across workspaces
```

## Repository Structure

```
celoscribe/
├── apps/web/          # Next.js 14 MiniApp frontend
├── packages/contracts/ # Solidity smart contracts (Hardhat)
└── docs/              # Architecture and technical documentation
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
