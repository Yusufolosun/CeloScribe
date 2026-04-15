# CeloScribe Contracts

Smart contracts powering the CeloScribe AI assistant on the Celo blockchain.

## CeloScribePayment

The financial core of CeloScribe — receives cUSD micropayments per AI task, validates amounts, emits events, and manages the protocol fee treasury.

### Architecture

- **CEI Pattern**: All state-modifying functions follow Checks-Effects-Interactions
- **Reentrancy Guard**: Critical functions are protected with `nonReentrant`
- **SafeERC20**: All token transfers use OpenZeppelin's `SafeERC20` library
- **Pausable**: Emergency stop mechanism for owner

### Task Types & Pricing

| Task Type  | Price (cUSD) | Description          |
| ---------- | ------------ | -------------------- |
| TEXT_SHORT | $0.01        | Up to 300 words      |
| TEXT_LONG  | $0.05        | Up to 1,500 words    |
| IMAGE      | $0.08        | Image generation     |
| TRANSLATE  | $0.02        | Language translation |

### Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Compile contracts
npx hardhat compile
```

## Deployment

For `pnpm deploy:testnet` and `pnpm deploy:mainnet`, set `DEPLOYER_PRIVATE_KEY`, `TREASURY_ADDRESS`, and `CELOSCAN_API_KEY` in the repo root `.env.local` before running the script. The deploy flow now requires an explicit treasury address so mainnet revenue routing is not left to a manual post-deploy step.

### Security

- No use of `transfer()` or `send()` — `SafeERC20.safeTransfer()` only
- No `tx.origin` for authorization
- Custom errors (no string reverts) for gas efficiency
- No upgradability patterns in this version
