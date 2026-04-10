# Contributing to CeloScribe

This repository is maintained as a production codebase. Changes should be small, reviewable, and aligned with the system design documented in `docs/`.

## Branching Strategy

- `main` is the production branch. Only merged, release-ready work belongs here.
- `dev` is the integration branch for completed work that still needs broader validation.
- Feature branches use `feat/<name>`.
- Fix branches use `fix/<name>`.

Examples:

- `feat/payment-verification`
- `fix/lint-config`

## Commit Convention

All commits must follow Conventional Commits:

```text
type(scope): description
```

### Types and Scopes

| Type       | Use for                                                  |
| ---------- | -------------------------------------------------------- |
| `feat`     | New behavior or product capability                       |
| `fix`      | Bug fixes                                                |
| `docs`     | Documentation-only changes                               |
| `chore`    | Tooling, config, maintenance, and non-production updates |
| `refactor` | Code changes that do not add new behavior                |
| `test`     | Test additions or updates                                |
| `ci`       | CI and automation changes                                |
| `style`    | Formatting-only changes                                  |
| `perf`     | Performance improvements                                 |
| `security` | Security hardening                                       |

| Scope       | Use for                                  |
| ----------- | ---------------------------------------- |
| `repo`      | Root-level workspace and tooling         |
| `web`       | Next.js frontend                         |
| `contracts` | Solidity contracts and Hardhat workspace |
| `docs`      | Repository documentation                 |
| `api`       | API routes and backend surface           |
| `payment`   | Payment flow and contract integration    |
| `ai`        | AI routing and provider selection        |
| `env`       | Environment configuration                |
| `ci`        | Automation and pipeline configuration    |

## Pull Request Checklist

Before opening a PR:

- [ ] Tests pass.
- [ ] TypeScript builds with no errors.
- [ ] ESLint reports no errors.
- [ ] `.env.example` is updated if new environment variables were added.
- [ ] Documentation is updated when the change affects setup, architecture, or security.
- [ ] The commit history is split into logical, reviewable units.

## Code Review Expectations

Reviewers should verify that the change is correct, minimal, and consistent with the repository conventions. Review comments should focus on correctness, regression risk, security, maintainability, and whether the change is documented where needed. Authors should resolve all comments before merge and should not merge partial work or placeholder implementations.
