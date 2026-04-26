# CeloScribe Web App

`apps/web` contains the Next.js frontend for CeloScribe.

This app handles:

- Wallet connection (MiniPay-first with injected-wallet fallback)
- Task selection and prompt composition
- On-chain payment initiation in cUSD
- Task result rendering and transaction history
- API routes for payment verification and AI task routing

## Stack

- Next.js 16 + React 19 + TypeScript
- Wagmi + Viem + React Query
- Tailwind CSS + custom component styles
- Thirdweb client integration
- API routes under `src/app/api/*`

## Local Development

From repository root:

```bash
pnpm --dir apps/web dev
```

Or from `apps/web`:

```bash
pnpm dev
```

## Build And Quality Checks

```bash
pnpm --dir apps/web lint
pnpm --dir apps/web test
pnpm --dir apps/web typecheck
pnpm --dir apps/web build
```

## Required Environment Variables

Populate root `.env.local` (not committed):

```bash
NEXT_PUBLIC_CELOSCRIBE_CONTRACT_ADDRESS=
NEXT_PUBLIC_CELO_RPC_URL=https://forno.celo.org
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=

DEEPSEEK_API_KEY=
ANTHROPIC_API_KEY=
FAL_API_KEY=

THIRDWEB_SECRET_KEY=
```

Notes:

- `ANTHROPIC_API_KEY` is optional at runtime. If missing, `TEXT_LONG` requests fall back to DeepSeek.
- `NEXT_PUBLIC_CELOSCRIBE_CONTRACT_ADDRESS` must match the deployed `CeloScribePayment` contract address.
- Secrets must stay server-side and must not be committed.

## Directory Highlights

- `src/app/page.tsx`: main user flow
- `src/app/api/payment/verify/route.ts`: payment verification endpoint
- `src/app/api/task/generate/route.ts`: payment-gated AI generation endpoint
- `src/hooks/useTaskPayment.ts`: payment transaction workflow
- `src/lib/payment/verifyPayment.ts`: on-chain verification logic
- `src/lib/ai/router.ts`: provider routing and fallback behavior

## Testing

- Unit/integration tests: `pnpm --dir apps/web test`
- End-to-end tests: `pnpm --dir apps/web test:e2e`

E2E tests are under `apps/web/e2e`.
