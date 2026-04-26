# Contributing to CeloScribe

CeloScribe is a production-grade codebase maintained by the core team and community contributors. We welcome contributions from developers, designers, and community members. This guide ensures all contributions meet our quality standards and fit the project's direction.

## Our Values

- **Security First**: Payment verification and secret management are non-negotiable
- **User Experience**: Mobile-first design optimized for Web3 users
- **Production Quality**: Code must be tested, documented, and reviewed before merge
- **Transparency**: All design decisions are documented and open to discussion
- **Simplicity**: Code should be clear and maintainable, not clever

## Getting Started

### Fork and Clone

```bash
git clone https://github.com/your-username/CeloScribe.git
cd CeloScribe
pnpm install
```

### Set Up Environment

```bash
# Copy example environment file
cp .env.example .env.local

# Add your test values (never use real mainnet credentials in development)
NEXT_PUBLIC_CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
```

### Verify Setup

```bash
pnpm build
pnpm lint
pnpm test
```

## Branching Strategy

We follow a simple Git flow:

| Branch Type  | Purpose                         | Example                    |
| ------------ | ------------------------------- | -------------------------- |
| `main`       | Production-ready code           | (protected)                |
| `dev`        | Integration branch for features | (protected)                |
| `feat/*`     | New features                    | `feat/translate-support`   |
| `fix/*`      | Bug fixes                       | `fix/wallet-disconnect`    |
| `docs/*`     | Documentation only              | `docs/architecture`        |
| `refactor/*` | Code improvements               | `refactor/component-hooks` |
| `perf/*`     | Performance improvements        | `perf/cache-balances`      |

### Branch Naming Rules

```bash
# ✓ Good: Descriptive, lowercase, hyphenated
git checkout -b feat/payment-modal-redesign
git checkout -b fix/missing-error-boundary
git checkout -b docs/api-reference-update

# ✗ Bad: Vague, mixed case, underscores
git checkout -b feature/updates
git checkout -b Fix_Stuff
git checkout -b my_work
```

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) strictly. Every commit must follow this format:

```
type(scope): description

[optional body]
[optional footer]
```

### Commit Types

| Type       | Use For                                | Example                                      |
| ---------- | -------------------------------------- | -------------------------------------------- |
| `feat`     | New behavior or capability             | `feat(web): add image generation task`       |
| `fix`      | Bug fixes                              | `fix(api): handle missing transaction hash`  |
| `docs`     | Documentation changes                  | `docs: update deployment guide`              |
| `refactor` | Code improvements (no behavior change) | `refactor(components): extract wallet logic` |
| `perf`     | Performance improvements               | `perf(api): add response caching`            |
| `test`     | Test additions or updates              | `test(payment): add verification tests`      |
| `style`    | Formatting only (Prettier, etc.)       | `style: format files`                        |
| `ci`       | CI/CD changes                          | `ci: add type checking to pipeline`          |
| `chore`    | Maintenance, tooling                   | `chore(deps): update Next.js to 16.2`        |
| `security` | Security hardening                     | `security: add rate limiting middleware`     |

### Commit Scopes

| Scope       | Applies To                           | Example                                      |
| ----------- | ------------------------------------ | -------------------------------------------- |
| `web`       | `apps/web` frontend                  | `feat(web): add dark mode toggle`            |
| `contracts` | `packages/contracts`                 | `feat(contracts): add admin role`            |
| `api`       | API routes in `apps/web/src/app/api` | `fix(api): validate task type`               |
| `payment`   | Payment flow and hooks               | `fix(payment): recover from failed approval` |
| `ai`        | AI routing and providers             | `feat(ai): support Gemini provider`          |
| `env`       | Environment configuration            | `chore(env): add CLAUDE_API_KEY`             |
| `docs`      | Documentation files                  | `docs: add faq section`                      |
| `repo`      | Root workspace and tooling           | `chore(repo): update tsconfig`               |

### Commit Examples

```bash
# Feature: Clear, descriptive message
git commit -m "feat(web): implement dark mode toggle in settings panel"

# Bug fix with context
git commit -m "fix(api): handle network timeout in payment verification

The route was not catching promise rejections from eth_getTransactionReceipt.
Added try-catch block and 30-second timeout."

# Documentation update
git commit -m "docs: add deployment troubleshooting section"

# Security improvement
git commit -m "security: validate task type before provider dispatch

Prevents sending unsupported task types to providers."

# Refactor with explanation
git commit -m "refactor(payment): extract verification logic into utility

No behavior change. Extracted verifyPaymentOnChain into
src/lib/payment/verify.ts for reusability."
```

### Commit Messages Best Practices

✓ **DO:**

- Use imperative mood ("add feature", not "added feature")
- Keep first line under 50 characters
- Reference issue number if applicable: `fix(payment): handle timeout (fixes #123)`
- Explain **why**, not just **what**
- Include scope in all commits

✗ **DON'T:**

- Use vague messages like "fix stuff" or "update code"
- Commit multiple unrelated changes in one commit
- Merge without clean commit history
- Skip the scope

## Pull Request Process

### Before Opening a PR

1. **Update from main**

   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run all checks locally**

   ```bash
   pnpm lint       # Must pass with 0 warnings
   pnpm test       # Must pass all tests
   pnpm typecheck  # Must pass TypeScript
   pnpm build      # Must build successfully
   ```

3. **Verify `.env.example` is updated**
   - If you added a new environment variable, document it

4. **Create a focused branch**
   - One feature or fix per branch
   - Branch name matches commit scope

### Opening a PR

1. **Use the PR template** (if provided)

2. **Write a clear title**
   - ✓ "Add image generation task support"
   - ✗ "Updates and fixes"

3. **Describe what changed**
   - What problem does this solve?
   - How were it tested?
   - Any breaking changes?

4. **Reference related issues**
   - "Fixes #123" (auto-closes issue when merged)
   - "Related to #456" (for context)

5. **Mention any deployment steps**
   - New environment variables?
   - Database migrations?
   - Contract deployments?

### PR Template

```markdown
## Description

Brief description of the change and why it's needed.

## Type of Change

- [ ] Bug fix (fixes #...)
- [ ] New feature (related to #...)
- [ ] Breaking change
- [ ] Documentation update

## Testing

Describe how you tested this change:

- [ ] Local development testing
- [ ] Test coverage added
- [ ] Manual testing steps:
  1. Step one
  2. Step two

## Checklist

- [ ] Code follows style guidelines
- [ ] TypeScript has no errors
- [ ] Tests pass locally
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings from linter

## Screenshots (if applicable)

Add screenshots for UI changes.
```

## Code Review Guidelines

### For Authors

- **Keep PRs small**: Ideally < 400 lines of changes
- **Respond to feedback**: Don't take criticism personally; it's about code quality
- **Ask questions**: If feedback is unclear, ask for clarification
- **Make updates**: Address all comments before requesting re-review
- **Know when to discuss**: If you disagree, discuss in the PR or schedule a sync

### For Reviewers

- **Review thoroughly**: Check for bugs, security issues, and maintainability
- **Be constructive**: Phrase feedback as questions or suggestions, not demands
- **Explain reasoning**: Help author understand why a change is needed
- **Request changes only for**: Security issues, breaking changes, style violations
- **Approve once satisfied**: Don't hold up merges unnecessarily

### What Reviewers Check

- ✓ **Correctness**: Does the code work as intended?
- ✓ **Security**: Are secrets protected? Is payment verified server-side?
- ✓ **Testing**: Are there tests? Do they cover edge cases?
- ✓ **Style**: Does code follow conventions? Is it readable?
- ✓ **Documentation**: Are complex changes documented?
- ✓ **Performance**: Does this introduce any bottlenecks?
- ✓ **Dependencies**: Were any new dependencies added? Are they necessary?

## Testing Requirements

### Coverage Expectations

| Code Path            | Minimum Coverage         |
| -------------------- | ------------------------ |
| Payment verification | 100% (security-critical) |
| API routes           | 90%+                     |
| Components           | 80%+                     |
| Utilities            | 85%+                     |
| Hooks                | 85%+                     |

### Writing Tests

```typescript
// ✓ Good: Descriptive test names, clear expectations
describe('verifyPaymentOnChain', () => {
  it('returns verified: true for valid payment event', async () => {
    const result = await verifyPaymentOnChain(txHash, address, taskType);
    expect(result.verified).toBe(true);
  });

  it('returns verified: false when event not found', async () => {
    const result = await verifyPaymentOnChain(invalidHash, address, taskType);
    expect(result.verified).toBe(false);
  });
});

// ✗ Avoid: Vague test names, unclear expectations
describe('payment', () => {
  it('works', async () => {
    const x = await someFunction();
    expect(x).toBeDefined();
  });
});
```

### Test Commands

```bash
# Run all tests
pnpm test

# Watch mode (auto-rerun on changes)
pnpm test -- --watch

# Run specific file
pnpm test -- src/lib/payment/verify.test.ts

# Run with coverage report
pnpm test -- --coverage
```

## Documentation Standards

### Code Comments

- Use comments sparingly (code should be self-documenting)
- Comment the **why**, not the **what**

```typescript
// ✓ Good: Explains why
const blockConfirmations = 2; // Protect against reorgs during volatile periods

// ✗ Bad: Explains what (obvious from code)
const blockConfirmations = 2; // Set to 2
```

### File Documentation

New files should have a header comment explaining purpose:

```typescript
/**
 * Payment verification utilities for on-chain verification.
 *
 * This module handles all interactions with the blockchain to verify
 * that a payment was recorded on-chain. It is security-critical and
 * must not be modified without careful review.
 */

export async function verifyPaymentOnChain(...) { ... }
```

### Updating Documentation

- Update [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design changes
- Update [docs/API.md](docs/API.md) for API endpoint changes
- Update [docs/SECURITY.md](docs/SECURITY.md) for security-related changes
- Update this file for contribution process changes

## Release Process

Releases follow semantic versioning and are tagged on `main` branch:

```bash
# Only maintainers can release
# 1. Update version in package.json
# 2. Update CHANGELOG if present
# 3. Create tag: git tag v1.2.3
# 4. Push tag: git push origin v1.2.3
```

## Code Style

### TypeScript

```typescript
// ✓ Strict mode enabled
// ✓ Explicit types for exports
// ✓ No `any` types without justification

export function parseAmount(value: unknown): Amount {
  if (typeof value !== 'number') {
    throw new Error('Amount must be a number');
  }
  return value as Amount;
}
```

### React Components

```typescript
// ✓ Functional components with hooks
// ✓ Descriptive prop names
// ✓ Children typed as React.ReactNode

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function Button({ onClick, disabled = false, children }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{children}</button>;
}
```

### CSS

```css
/* ✓ BEM naming for components */
.payment-modal {
}
.payment-modal__title {
}
.payment-modal__button {
}

/* ✓ Use CSS custom properties for theming */
color: var(--color-text);
font-family: var(--font-sans);
```

## Getting Help

- **Question about process?** Check this file or ask in discussions
- **Found a security issue?** Email security@[organization] (don't open issue)
- **Need design guidance?** Open a discussion before starting work
- **Want to propose a big change?** Open an issue first to discuss

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Contributors are expected to:

- Be respectful and constructive in all interactions
- Welcome feedback and criticism
- Focus on what is best for the community
- Show empathy towards other community members
- Report harassment to maintainers immediately

## Recognition

Contributors will be recognized in:

- Commit history (you're immortalized in git!)
- [CHANGELOG](CHANGELOG.md) (if maintained)
- GitHub contributor graph
- Twitter shout-outs for major contributions

Thank you for contributing to CeloScribe! 🚀
