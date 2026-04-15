# Celo Composer Mapping

CeloScribe is customized from the Celo Composer Minipay ideas, but it does not copy the upstream scaffold verbatim. The goal is to keep the Composer shape where it helps and keep the product-specific payment flow where CeloScribe needs it.

## Upstream Facts

- Package name: `@celo/celo-composer`
- CLI entrypoint: `celo-composer create`
- Templates: `basic`, `farcaster-miniapp`, `minipay`, and `ai-chat`
- Wallet providers: `rainbowkit`, `thirdweb`, and `none`
- Contract frameworks: `hardhat`, `foundry`, and `none`

## How CeloScribe Maps

- `apps/web` is the custom MiniPay app shell for pay-per-use AI tasks.
- `packages/contracts` owns the payment contract workspace.
- The wallet layer stays MiniPay-aware and Celo-mainnet focused.
- The wallet summary now shows live CELO and cUSD balances, which mirrors the balance-first Composer Minipay template.
- The payment flow keeps explicit user consent instead of forcing MiniPay auto-connect.

## Why the Divergence Matters

The upstream Minipay template is optimized for a generated starter app. CeloScribe is a product, so it keeps the connection explicit, guards the chain before approval or write calls, and surfaces balances instead of hiding them behind a template-only wallet shell.

## Recreate The Upstream Scaffold

If you need to compare against the original generator, run the Composer CLI in a scratch directory and choose the `minipay` template. That gives you the upstream provider and component pattern to compare against the CeloScribe customizations here.
