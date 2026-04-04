# Contributing to CeloScribe

Thank you for contributing. This document explains the standards and workflow.

## Branching Strategy

- `main` — production-ready code only. No direct pushes.
- `dev` — integration branch. All PRs target `dev`.
- Feature branches: `feat/<short-description>`
- Bug branches: `fix/<short-description>`
- Example: `feat/escrow-contract`, `fix/payment-hook-race-condition`

## Commit Convention

All commits must follow Conventional Commits:

```
type(scope): short description

[optional body]
[optional footer]
```

### Types
| Type | When to use |
|------|-------------|
| `feat` | New feature or behavior |
| `fix` | Bug fix |
| `chore` | Build, tooling, dependencies |
| `docs` | Documentation only |
| `test` | Tests only |
| `refactor` | Code change without feature or fix |
| `style` | Formatting, no logic change |
| `ci` | CI/CD configuration |
| `perf` | Performance improvement |
| `security` | Security fix or hardening |

### Scopes
Use these scopes consistently:
- `repo` — root-level config
- `web` — Next.js frontend
- `contracts` — Solidity contracts
- `api` — API routes
- `payment` — Payment hooks and contract interaction
- `ai` — AI model routing and provider logic
- `agent` — ERC-8004 agent config and Self ID
- `env` — Environment config
- `docs` — Documentation
- `ci` — CI/CD

## Commit Rules

1. **One commit = one logical change.** Do not combine contract changes and frontend changes.
2. **No WIP commits** to `dev` or `main`. Each commit must be complete and working.
3. **Tests must pass** before committing any feature or fix.
4. **No `console.log` in committed code** — use the structured logger defined in `src/lib/logger.ts`.

## Pull Request Checklist

Before opening a PR, confirm:
- [ ] All tests pass (`pnpm test`)
- [ ] No TypeScript errors (`pnpm build`)
- [ ] No ESLint errors (`pnpm lint`)
- [ ] `.env.example` updated if new env vars were added
- [ ] `ARCHITECTURE.md` updated if system design changed
- [ ] Commit messages follow convention

## Code Review

All PRs require at least one review before merge. Comments must be resolved before merge.
