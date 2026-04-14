# CeloScribe Security

## Secret Management Policy

All secrets must remain outside the repository and outside the browser runtime. Environment values should be provided locally through untracked files such as `.env.local` and in deployment environments through the platform secret manager.

Public client IDs used by the Thirdweb SDK are not secrets, but they should still be sourced from environment variables so the frontend config stays portable.

## What Is Never Committed

The following must not be committed to the repository:

- Private keys
- Wallet seed phrases
- API keys and provider secrets
- Access tokens
- Database credentials
- Production environment files
- User-specific local overrides

## Rate Limiting

Rate limiting will be enforced on the server side in the Next.js API layer once request routes are added. The rate limiter should operate on wallet address and request context rather than on UI state alone, because the UI is not a security boundary.

## On-Chain Payment Verification

On-chain payment verification is the security boundary for paid requests. A request may proceed only after the backend verifies that the required cUSD payment was recorded on-chain for the intended request type.

The verifier must check all of the following before allowing work to continue:

- The receipt must be successful and confirmed.
- The receipt target must match the deployed `CeloScribePayment` contract.
- The receipt logs must contain a matching `PaymentReceived` event for the expected wallet and task type.

The frontend may initiate the flow, but it must never be treated as proof of payment.

MiniPay detection in the browser is only a convenience signal for the UI. It does not authorize a request and it does not replace backend verification.

## Security Expectations for Future Work

- Keep payment verification server-side.
- Keep provider credentials server-side.
- Do not add client-side shortcuts around payment checks.
- Treat unverified requests as unauthorized until the on-chain evidence is confirmed.
