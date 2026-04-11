# CeloScribe API

This document lists the API surface that will be added in later prompts. Each section is intentionally minimal until the route is implemented.

The frontend web3 layer already exposes wallet connection state through Wagmi, but the API must still treat that as untrusted input until the backend verifies the on-chain payment.

## `POST /api/payment/verify`

Documented in Prompt N. This route will confirm the cUSD payment that was initiated from the MiniPay-aware frontend.

## `POST /api/request`

Documented in Prompt N. This route should only proceed after the payment verification route succeeds.

## `GET /api/health`

Documented in Prompt N.

## `POST /api/webhooks/*`

Documented in Prompt N.
