This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Web3 Setup

The app shell now mounts a client-side Web3 provider that combines Wagmi v2, Viem, and React Query for Celo mainnet and Alfajores support.

- `src/lib/chains.ts` centralizes the Celo chain definitions and the cUSD contract address.
- `src/lib/wagmi.ts` configures Wagmi with a MiniPay-aware injected connector plus a generic injected fallback so the app can explain MiniPay-ready, injected-wallet, and unsupported-browser states.
- `src/hooks/useMiniPay.ts` exposes wallet state, MiniPay detection, provider availability, and connect/disconnect actions.
- `src/components/WalletBanner.tsx` surfaces the active wallet mode before the payment flow starts.
- `src/components/WalletSummary.tsx` shows live CELO and cUSD balances so the wallet panel mirrors the Composer Minipay balance pattern.
- `src/hooks/useCusdApproval.ts` and `src/hooks/useTaskPayment.ts` handle the client payment flow with receipt confirmation.
- `src/lib/payment/taskPrices.ts` mirrors the on-chain task prices for UI display and payment checks.
- `src/lib/thirdweb.ts` exposes a reusable Thirdweb client for future wallet or SDK integrations.

If you want to use Thirdweb features that need a client ID, set `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` in your environment.
To use the payment hooks, set `NEXT_PUBLIC_CELOSCRIBE_CONTRACT_ADDRESS` to the deployed `CeloScribePayment` address.

You can start from `.env.example` in this folder and copy the value into `.env.local`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
