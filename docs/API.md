# CeloScribe API

This document lists the API surface that will be added in later prompts. Each section is intentionally minimal until the route is implemented.

The frontend web3 layer already exposes wallet connection state through Wagmi, but the API must still treat that as untrusted input until the backend verifies the on-chain payment.

## `POST /api/payment/verify`

Verifies that a transaction hash corresponds to a confirmed `PaymentReceived` event emitted by `CeloScribePayment` for the expected wallet address and task type.

Request body:

- `txHash`: Ethereum transaction hash
- `userAddress`: wallet address that should appear in the event log
- `taskType`: one of `TEXT_SHORT`, `TEXT_LONG`, `IMAGE`, `TRANSLATE`

Responses:

- `200`: `{ verified: true, taskType }`
- `400`: malformed input or unknown task type
- `402`: receipt did not verify against the expected on-chain payment

## `POST /api/request`

Documented in Prompt N. This route should only proceed after the payment verification route succeeds.

## `POST /api/task/generate`

Verifies the on-chain payment for a task request, routes the request to the appropriate AI provider, and returns the generated result.

Request body:

- `txHash`: transaction hash for the payment
- `userAddress`: wallet address that must match the payment event
- `taskType`: one of `TEXT_SHORT`, `TEXT_LONG`, `IMAGE`, `TRANSLATE`
- `prompt`: the task prompt text
- `targetLanguage`: required for `TRANSLATE` requests

Responses:

- `200`: provider result payload containing `taskType`, `output`, `provider`, `tokensUsed?`, and `processingMs`
- `400`: malformed input or unknown task type
- `402`: payment verification failed
- `500`: uncaught provider or server errors

## `GET /api/health`

Documented in Prompt N.

## `POST /api/webhooks/*`

Documented in Prompt N.
