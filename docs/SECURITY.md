# CeloScribe Security Guidelines

Security in CeloScribe is built on three pillars: secret management, on-chain verification, and server-side control. This document outlines the security model and expectations for all contributors.

## Security Model Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Untrusted)                 │
│  • Wallet connection state                              │
│  • User input and prompts                               │
│  • Public contract addresses                            │
│  • Transaction hashes (unverified)                      │
└────────────────────┬────────────────────────────────────┘
                     │
     ✗ No secrets here
     ✗ No payment logic here
     ✗ No provider credentials here
                     │
┌────────────────────▼────────────────────────────────────┐
│                    SERVER (Trusted)                     │
│  • On-chain payment verification                        │
│  • Provider credentials (API keys)                      │
│  • Rate limiting and throttling                         │
│  • Request logging and audit trail                      │
│  • Treasury management                                  │
└─────────────────────────────────────────────────────────┘
                     │
     ✓ All secrets stored here
     ✓ All verification happens here
     ✓ All credentials managed here
                     │
┌────────────────────▼────────────────────────────────────┐
│                  BLOCKCHAIN (Immutable)                 │
│  • Payment events (permanently recorded)                │
│  • Contract code (public and verified)                  │
│  • Transaction receipts (cryptographic proof)          │
└─────────────────────────────────────────────────────────┘
```

## Secret Management Policy

### What Must Never Be Committed

The following must **never** be committed to the repository:

- **Private Keys**: `DEPLOYER_PRIVATE_KEY`, wallet seed phrases, mnemonic files
- **API Keys**: `DEEPSEEK_API_KEY`, `ANTHROPIC_API_KEY`, `FAL_API_KEY`
- **Provider Secrets**: `THIRDWEB_SECRET_KEY` (client ID is public; secret is not)
- **Blockchain Credentials**: `CELOSCAN_API_KEY`, RPC authentication tokens
- **Environment Files**: `.env`, `.env.local`, `.env.*.local`, `*.env`
- **Wallet Files**: `*.mnemonic`, `*.seed`, `wallet.json`, keystore files

### How to Protect Secrets

**Local Development:**

```bash
# Use .env.local (already in .gitignore)
DEPLOYER_PRIVATE_KEY=0x...
ANTHROPIC_API_KEY=...
```

**Staging/Production:**

```bash
# Use platform secret managers:
# - Vercel Environment Variables
# - AWS Secrets Manager
# - Azure Key Vault
# - CloudFlare Workers Secrets
# - Docker secrets (for containerized deployments)
```

**Best Practices:**

```bash
# ✓ DO THIS: Use environment variables with application startup
export DEEPSEEK_API_KEY=$(aws secretsmanager get-secret-value ...)
npm start

# ✓ DO THIS: Rotate keys on a regular schedule
# Update API keys every 90 days in production

# ✗ DON'T DO THIS: Hardcode secrets in code
// const API_KEY = "sk-..."; ❌

# ✗ DON'T DO THIS: Commit secrets and hope to remove them later
# (They remain in git history forever)
```

## On-Chain Payment Verification

### Why It Matters

On-chain payment verification is the **only** security boundary. The system assumes:

1. **Frontend is untrusted**: User could have disabled prompt validation, modified localStorage, or replayed old requests
2. **Blockchain is trusted**: Events are immutable and cryptographically verified
3. **Backend acts as gatekeeper**: No AI work proceeds without proof of payment

### Verification Requirements

A request may proceed only after backend verifies **all** of the following:

```typescript
// In /api/task/generate route

// 1. Transaction exists and succeeded
const receipt = await provider.getTransactionReceipt(txHash);
if (!receipt || receipt.status !== 1) {
  return { error: 'Payment not confirmed' }; // 402
}

// 2. Receipt targets the correct contract
if (receipt.to.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
  return { error: 'Invalid contract target' }; // 402
}

// 3. Payment event exists in logs
const log = receipt.logs.find((log) => log.topics[0] === PAYMENT_RECEIVED_SIGNATURE);
if (!log) {
  return { error: 'No payment event found' }; // 402
}

// 4. Event contains the right user address
const [eventUser, eventTaskType, eventAmount] = decodeEventData(log);
if (eventUser.toLowerCase() !== userAddress.toLowerCase()) {
  return { error: 'Payment address mismatch' }; // 402
}

// 5. Task type matches
if (eventTaskType !== taskType) {
  return { error: 'Task type mismatch' }; // 402
}

// 6. Block is sufficiently confirmed
const currentBlock = await provider.getBlockNumber();
if (currentBlock - receipt.blockNumber < 2) {
  return { error: 'Payment not fully confirmed' }; // 402
}

// ✓ All checks passed - proceed with AI work
```

### Common Mistakes to Avoid

```typescript
// ❌ WRONG: Trusting client claim of payment
if (req.body.paymentConfirmed) {
  // User could set this to true
  return generateAI();
}

// ❌ WRONG: Only checking transaction exists
if (receipt) {
  // Receipt alone doesn't prove payment was for THIS user
  return generateAI();
}

// ❌ WRONG: Not checking confirmation blocks
if (receipt.status === 1) {
  // Could be reverted with reorg
  return generateAI();
}

// ✓ CORRECT: Verify all conditions and require >= 2 block confirmation
const verified = await verifyPaymentOnChain(txHash, userAddress, taskType);
if (!verified) {
  return errorResponse(402);
}
return generateAI();
```

## Rate Limiting

Rate limiting protects providers and prevents abuse. All rate limiting is **server-side**; client-side limits are for UX only and cannot be trusted.

### Rate Limit Tiers

| Limit        | Value             | Scope                                            |
| ------------ | ----------------- | ------------------------------------------------ |
| Global       | 1000 req/min      | All wallets combined                             |
| Per-Wallet   | 100 req/hour      | Single wallet address                            |
| Per-Provider | Provider-specific | DeepSeek, Anthropic, fal.ai each have own quotas |

### Implementation

```typescript
// In /api/task/generate middleware
import { RateLimiter } from '@/lib/rateLimit';

const limiter = new RateLimiter({
  globalLimit: 1000 / 60, // per second
  perWalletLimit: 100 / 3600, // per second
  window: 'sliding', // or 'fixed'
});

if (!limiter.allow(userAddress)) {
  return res.status(429).json({
    error: 'Rate limit exceeded',
    resetAt: limiter.getResetTime(userAddress),
  });
}

// Proceed with request
```

### Bypassing Rate Limits

Rate limits **cannot** be bypassed:

- Creating multiple wallets: Each wallet address is rate-limited separately
- Clearing localStorage: Rate limits are server-side, not client-side
- Replaying requests: Duplicate txHash within 1 second is rejected
- Requesting faster: Request queue is FIFO; queue depth is not exposed

## Credentials Rotation

### Schedule

| Credential             | Rotation Frequency | Owner  |
| ---------------------- | ------------------ | ------ |
| `DEPLOYER_PRIVATE_KEY` | On deployment only | DevOps |
| `DEEPSEEK_API_KEY`     | Every 90 days      | DevOps |
| `ANTHROPIC_API_KEY`    | Every 90 days      | DevOps |
| `FAL_API_KEY`          | Every 90 days      | DevOps |
| `CELOSCAN_API_KEY`     | Every 6 months     | DevOps |

### Rotation Process

```bash
# 1. Generate new key in provider dashboard
# 2. Add new key to platform secret manager
# 3. Update application (if necessary)
# 4. Monitor for errors (key should work alongside old key for 24h)
# 5. Remove old key from secret manager
# 6. Document rotation in security audit log
```

## Access Control

### Who Can Deploy

- **Mainnet Contracts**: Authorized DevOps only (requires multi-sig approval for future versions)
- **Environment Secrets**: Platform admins only
- **API Routes**: All authenticated requests via on-chain verification

### Who Can Modify

- **Contract Code**: Pull request review required + code review
- **Environment Variables**: Platform secret manager + audit trail
- **Deployment Addresses**: Immutable after initial deployment

### Audit Trail

All security-relevant actions are logged:

```
[2024-01-15 10:30:00] Secret updated: ANTHROPIC_API_KEY (modified by user@company.com)
[2024-01-15 10:31:00] Contract deployed: 0x1234... on Celo mainnet
[2024-01-15 10:32:00] Rate limit triggered for wallet 0x5678... (100 req/hr exceeded)
```

## Deployment Security Checklist

Before every mainnet deployment, verify:

```
[ ] All secrets are in platform secret manager, not in code
[ ] .env.local is in .gitignore and not committed
[ ] Private keys are not in any logs or error messages
[ ] API keys are rotated if older than 90 days
[ ] Contract address is correct in environment
[ ] Rate limiting is configured and tested
[ ] CORS is properly configured (only trusted origins)
[ ] HTTPS is enforced for all API routes
[ ] Request logging does not expose secrets
[ ] Error responses don't leak internal details
[ ] Payment verification code is unchanged from review
[ ] Contract code is verified on Celoscan
[ ] All environment variables are set in production
[ ] Wallet address is not a shared/compromised account
```

## Incident Response

If you discover a security issue:

1. **Do not** commit or push the vulnerability
2. **Do not** discuss it in public channels or issues
3. **Do** email security@[organization] immediately with:
   - Description of the vulnerability
   - Steps to reproduce (if applicable)
   - Suggested fix (if any)

4. **Response timeline**:
   - Acknowledged within 24 hours
   - Fix deployed to staging within 48 hours
   - Fix deployed to production within 72 hours (after testing)

## Security Testing

### Before Each Release

```bash
# 1. Check for committed secrets
git log -p --all -S "PRIVATE_KEY" -- "*.ts" "*.tsx" "*.js"

# 2. Audit dependencies
npm audit
pnpm audit

# 3. Type checking for secret usage
pnpm typecheck

# 4. Linting for security rules
pnpm lint

# 5. Manual review of:
#    - New environment variables
#    - API route changes
#    - Payment verification code
#    - Provider credential handling
```

### OWASP Top 10 Considerations

| Risk                                               | Mitigation                                                                   |
| -------------------------------------------------- | ---------------------------------------------------------------------------- |
| **A01:2021 – Broken Access Control**               | On-chain payment verification; server-side rate limiting                     |
| **A02:2021 – Cryptographic Failures**              | HTTPS only; secrets in environment; no hardcoded keys                        |
| **A03:2021 – Injection**                           | Input validation; parameterized queries (if DB used); TypeScript strict mode |
| **A04:2021 – Insecure Design**                     | Security-first architecture; threat modeling; peer review                    |
| **A05:2021 – Security Misconfiguration**           | IaC for deployment; automated security scanning; security checklist          |
| **A06:2021 – Vulnerable and Outdated Components**  | Weekly dependency updates; npm audit; vulnerability scanning                 |
| **A07:2021 – Authentication & Session Management** | Blockchain addresses as identity; no passwords; immutable audit trail        |
| **A08:2021 – Software & Data Integrity Failures**  | Contract verified on Celoscan; deployment reviewed; immutable history        |
| **A09:2021 – Logging & Monitoring Failures**       | Request logging; error tracking; rate limit monitoring                       |
| **A10:2021 – SSRF**                                | No external API calls from client; provider calls server-side only           |

## Future Security Enhancements

- **Multi-signature Treasury**: Require M-of-N signatures for treasury withdrawal
- **Request Signing**: Client signs all requests for additional non-repudiation
- **Whitelisting**: Support whitelisting specific wallets (for paid tiers)
- **Encryption at Rest**: Encrypt stored credentials with HSM keys
- **Security Headers**: Implement all recommended security headers
- **Bug Bounty Program**: Formalize vulnerability disclosure and rewards
- **Regular Audits**: Annual third-party security audit
- **Zero-Knowledge Proofs**: Optional zk-proof for payment verification
