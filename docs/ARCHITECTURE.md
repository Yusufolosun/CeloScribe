# CeloScribe — Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        MiniPay Browser                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            CeloScribe MiniApp (Next.js)              │   │
│  │                                                       │   │
│  │   [Task UI] → [Payment Confirm] → [Task Result]      │   │
│  └──────────────────┬────────────────────────────────────┘   │
└─────────────────────│────────────────────────────────────────┘
                       │ wagmi / viem
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              CeloScribe Smart Contract (Celo L2)             │
│                                                              │
│   receivePament(taskType, amount)                            │
│   → validates amount ≥ taskPrice[taskType]                   │
│   → emits PaymentReceived(user, taskType, amount)            │
│   → credits are tracked off-chain via event indexing         │
└─────────────────────────────────────────────────────────────┘
                       │ on-chain event
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js API Routes (Server-Side)                │
│                                                              │
│   POST /api/task/generate                                    │
│   → verifies tx hash against contract event                  │
│   → routes to correct AI provider                            │
│   → returns task result                                      │
│                                                              │
│   AI Provider Routing:                                       │
│   TEXT_SHORT  → DeepSeek V3     ($0.01)                      │
│   TEXT_LONG   → Claude Haiku    ($0.05)                      │
│   IMAGE       → fal.ai SDXL     ($0.08)                      │
│   TRANSLATE   → DeepSeek V3     ($0.02)                      │
└─────────────────────────────────────────────────────────────┘
```

## Payment Flow

1. User selects a task type in the MiniApp UI.
2. MiniPay presents a payment confirmation (amount in cUSD).
3. User approves. Transaction is sent to the CeloScribe contract.
4. Contract validates the payment amount matches the task price.
5. Contract emits a `PaymentReceived` event with `(user, taskType, txHash)`.
6. Frontend detects transaction confirmation (1 block on Celo = ~1 second).
7. Frontend sends `POST /api/task/generate` with `{ txHash, taskType, prompt }`.
8. API route verifies the `txHash` resolves to a valid `PaymentReceived` event on-chain.
9. API route calls the appropriate AI provider.
10. Result is returned to the user in the MiniApp.

## Security Model

- All AI API keys are server-side only (API routes, never exposed to browser).
- Payment verification is on-chain — a user cannot call the AI API without a valid on-chain payment.
- No user data is stored server-side. All state is on-chain or in the user's browser session.
- Rate limiting is enforced per wallet address at the API route layer.

## Smart Contract

- Network: Celo Mainnet (Chain ID: 42220)
- Token: cUSD (ERC-20, address: `0x765DE816845861e75A25fCA122bb6898B8B1282a`)
- Contract: CeloScribePayment.sol (Prompt 04)

## Agent Identity

- Standard: ERC-8004
- Registered on: AgentScan (8004scan.io)
- Self Agent ID: verified human-backed agent
- Agent Visa Target: Work Visa tier (1,000+ txns, $5,000+ volume)
