# CeloScribe Architecture

## Overview

CeloScribe is a payment-gated AI application composed of three runtime domains:

1. Frontend (Next.js UI)
2. API layer (Next.js route handlers)
3. On-chain payment contract (Celo)

AI providers are accessed only from the API layer.

## System Diagram

```text
User + Wallet
    |
    v
Next.js UI (apps/web/src/app/page.tsx)
    |
    |  txHash, userAddress, taskType, prompt, targetLanguage?
    v
POST /api/task/generate
    |
    |-- checkRateLimit(userAddress)
    |-- verifyPayment(txHash, userAddress, taskType)
    |-- routeTask(taskRequest)
    v
AI Provider Adapters
(DeepSeek / Anthropic / fal.ai)
    |
    v
TaskResult JSON

On-chain source of truth:
CeloScribePayment.sol -> PaymentReceived event
```

## Monorepo Boundaries

- `apps/web`: frontend app and API routes
- `packages/contracts`: Solidity contract, tests, and deployment scripts
- `docs`: product and engineering documentation

## Frontend Layer

Primary UI flow lives in `apps/web/src/app/page.tsx`.

Key responsibilities:

- Wallet connection and chain readiness
- Task selection (`TEXT_SHORT`, `TEXT_LONG`, `IMAGE`, `TRANSLATE`)
- Prompt input and client-side task limit validation
- Payment initiation through wallet hooks
- Display of generated results and transaction history

Key modules:

- `useMiniPay`: MiniPay-aware wallet connection behavior
- `useTaskPayment`: approval + payment transaction workflow
- `TransactionHistory`: reads payment events for connected user

## API Layer

### `POST /api/payment/verify`

File: `apps/web/src/app/api/payment/verify/route.ts`

Responsibilities:

- Validate required request fields
- Validate task type is one of contract enum names
- Call `verifyPayment(...)`
- Return `{ verified: true, taskType }` on success

### `POST /api/task/generate`

File: `apps/web/src/app/api/task/generate/route.ts`

Responsibilities:

- Validate request shape and prompt
- Enforce prompt limits by task type
- Require `targetLanguage` for `TRANSLATE`
- Apply per-wallet rate limiting
- Verify payment on-chain
- Route request to AI provider adapters
- Return normalized `TaskResult`

Shared helpers in `apps/web/src/lib/api.ts` provide standardized responses for 400/402/405/429/500.

## Payment Verification Path

Verification logic is implemented in `apps/web/src/lib/payment/verifyPayment.ts`.

Checks performed:

1. Receipt status is successful
2. Required block confirmations reached (`PAYMENT_MIN_CONFIRMATIONS` or environment default)
3. Transaction target equals configured contract address
4. Matching `PaymentReceived` event exists in the same block
5. Event user and task type match expected values

Only verified requests proceed to AI generation.

## Contract Layer

Contract: `packages/contracts/contracts/CeloScribePayment.sol`

Main behavior:

- Accepts cUSD payments for enumerated task types
- Emits `PaymentReceived` event per successful payment
- Stores total payments and supports treasury withdrawal (owner)
- Supports pause/unpause and treasury updates (owner)
- Uses OpenZeppelin `SafeERC20`, `ReentrancyGuard`, `Ownable`, `Pausable`

Price constants in contract must remain in sync with frontend display and task payment logic.

## AI Routing

Routing function: `apps/web/src/lib/ai/router.ts`

Current routing table:

- `TEXT_SHORT` -> DeepSeek
- `TEXT_LONG` -> Anthropic (DeepSeek fallback if Anthropic key missing)
- `IMAGE` -> fal.ai
- `TRANSLATE` -> DeepSeek

All provider SDK interactions are inside provider modules under `apps/web/src/lib/ai/providers`.

## Rate Limiting

Limiter implementation: `apps/web/src/lib/rateLimit.ts`

Current policy:

- 10 requests per 60 seconds
- Keyed by lowercase wallet address
- In-memory per process

For multi-instance deployments, this should be replaced with a shared backing store.

## Environment Model

Typed environment access: `apps/web/src/lib/env.ts`

Important values:

- `NEXT_PUBLIC_CELOSCRIBE_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_CELO_RPC_URL`
- `DEEPSEEK_API_KEY`
- `FAL_API_KEY`
- `ANTHROPIC_API_KEY` (optional)
- `THIRDWEB_SECRET_KEY`

## Operational Notes

- On-chain payment verification is the authorization boundary
- Client wallet state is UX state, not payment proof
- API error responses avoid leaking internals
- Provider keys are never exposed to browser code
