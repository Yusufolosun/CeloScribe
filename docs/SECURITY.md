# CeloScribe Security

This document describes the current security model and operating rules for CeloScribe.

## Security Boundary

CeloScribe authorizes paid generation only after backend on-chain verification.

Trusted boundary:

- Server-side route handlers
- On-chain transaction receipts and events

Untrusted inputs:

- Browser wallet state
- Client-provided request payloads
- Any client-side payment flags

## Core Controls

### 1) Payment Verification Gate

Implemented in:

- `apps/web/src/app/api/payment/verify/route.ts`
- `apps/web/src/app/api/task/generate/route.ts`
- `apps/web/src/lib/payment/verifyPayment.ts`

A request is accepted only when all checks pass:

- Receipt exists and status is successful
- Confirmation threshold is met
- Transaction target matches configured contract
- Matching `PaymentReceived` event exists
- Event user and task type match request expectations

If any check fails, API returns `402`.

### 2) Secret Isolation

Secrets are server-side only and loaded from environment variables in `apps/web/src/lib/env.ts`.

Examples:

- `DEEPSEEK_API_KEY`
- `FAL_API_KEY`
- `ANTHROPIC_API_KEY`
- `THIRDWEB_SECRET_KEY`

Secrets must never be committed to git and must never be returned in API responses.

### 3) Request Throttling

`POST /api/task/generate` applies per-wallet rate limiting via `apps/web/src/lib/rateLimit.ts`.

Current default:

- 10 requests per 60 seconds per wallet address

The current limiter is in-memory and process-local. Multi-instance deployments should move this to a shared store.

## Environment And Secret Policy

Use `.env.local` for local development only. Store production values in deployment secret managers.

Never commit:

- `.env*` files containing secrets
- private keys or mnemonic phrases
- API keys or token files
- wallet export files

Repository `.gitignore` includes patterns for environment files, key material, and common secret artifacts.

## Contract-Side Considerations

Contract: `packages/contracts/contracts/CeloScribePayment.sol`

Implemented protections:

- `ReentrancyGuard` on payment and withdrawal paths
- `Pausable` emergency stop for payment flow
- `Ownable` access control for treasury and pause operations
- `SafeERC20` for token transfers
- Explicit treasury update and withdrawal events for auditability

## API Error Handling

Route handlers use `withErrorHandling(...)` from `apps/web/src/lib/api.ts`.

Behavior:

- Logs request metadata and status
- Catches uncaught exceptions
- Returns generic `500` response without stack traces

Standard response shape:

```json
{
  "error": "..."
}
```

## Logging Guidance

Operational logs should include:

- method, route, status, duration
- transaction hash and wallet address when relevant
- payment verification failure reason categories

Operational logs must not include secret values.

## Deployment Security Checklist

Before production release:

- [ ] Environment variables are set in secret manager
- [ ] No secret files are tracked by git
- [ ] Contract address is correct for target network
- [ ] Payment verification paths tested end-to-end
- [ ] Rate-limiting behavior verified
- [ ] Lint, tests, and build pass

## Incident Response

If a security issue is discovered:

1. Stop rollout or pause sensitive operations
2. Rotate affected keys immediately
3. Patch and validate in staging
4. Deploy fix and verify with targeted tests
5. Record root cause and preventive actions

## Future Hardening

Planned improvements:

- Shared distributed rate-limiter backend
- Automated secret scanning in CI
- Additional monitoring/alerting on verification failures
- Optional multi-sig treasury operations
