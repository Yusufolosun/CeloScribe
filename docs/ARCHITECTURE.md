# CeloScribe Architecture

## System Overview

```text
+-------------------+      +----------------------+      +------------------------+      +---------------------+      +----------------+
|   MiniApp UI      | ---> | Smart Contract       | ---> | Next.js API Routes     | ---> | AI Provider Routing | ---> | Response       |
|   (Celo / MiniPay)|      | (payment boundary)   |      | (server-side control)  |      | (provider adapters) |      | to user        |
+-------------------+      +----------------------+      +------------------------+      +---------------------+      +----------------+
```

## Layer Responsibilities

### MiniApp UI

The MiniApp UI is the user-facing entry point that will live in the Next.js frontend under `apps/web`. It is responsible for presenting the request form, initiating payment, and showing the result after a payment has been verified.

The frontend now includes a dedicated web3 client layer made up of Wagmi, Viem, React Query, and Thirdweb. That layer is mounted once in the root layout so wallet state is available to any component that needs it.

Transaction history queries start from the payment contract deployment block instead of block zero, which keeps the history tab responsive as on-chain activity grows.

MiniPay detection happens in the browser through `window.ethereum.isMiniPay`, but payment authorization still remains outside the browser and depends on server-side verification.

### Smart Contract

The payment contract workspace under `packages/contracts` defines the on-chain payment boundary. Its role is to accept and verify cUSD payment transactions for the supported request types. The contract is the security anchor for the system: if a payment is not verified on-chain, the downstream AI request should not be served.

### Next.js API Routes

The API route layer runs server-side inside the Next.js application. It receives verified request metadata from the frontend, confirms that the on-chain payment exists, and coordinates the rest of the request lifecycle. This layer keeps secret values and backend logic out of the browser.

The `POST /api/task/generate` route is the main entry point for AI work. It validates the request, verifies payment, and then hands the request to the router without importing provider SDKs directly.

### AI Provider Routing

The AI routing layer maps an approved request to the correct provider implementation. This layer is responsible for choosing the provider adapter, normalizing the request payload, and returning a response in a consistent format.

Current routing rules:

- `TEXT_SHORT` and `TRANSLATE` use DeepSeek through the OpenAI-compatible SDK.
- `TEXT_LONG` uses Anthropic.
- `IMAGE` uses fal.ai with safety checking enabled.
- Token and size limits are enforced inside the provider layer, not the route.

### Response

The response is the final result returned to the user in the MiniApp UI. The response layer should only be reached after the request has cleared payment verification and server-side routing.

## Payment Flow

1. The user opens the MiniApp UI and selects a supported request.
2. The frontend prepares the required payment action for the selected request type.
3. The user approves the cUSD payment in a Celo-compatible wallet.
4. The smart contract records the payment and emits the on-chain evidence needed for verification.
5. The frontend sends the request metadata to the Next.js API route.
6. The API route verifies the payment on-chain before proceeding.
7. The API route passes the request to the AI provider routing layer.
8. The routed provider returns a response to the API route.
9. The API route returns the response to the MiniApp UI.
10. The MiniApp UI renders the final result for the user.

## Design Notes

- On-chain payment verification is the system boundary that decides whether a request may continue.
- Secret values must remain server-side in the API route layer.
- The frontend owns presentation and request initiation, not provider credentials or payment validation.
- Wallet connection state is part of the client experience, not proof of payment.
- AI provider SDK usage stays inside `apps/web/src/lib/ai`.
- Subsequent prompts will fill in the API routes, provider adapters, and request-specific contract behavior.
