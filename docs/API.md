# CeloScribe API

This document covers the API routes currently implemented in the web app.

All routes are server-side and return JSON.

## Security Boundary

Client wallet state is not trusted. A request is considered paid only after the backend verifies the on-chain `PaymentReceived` event against the provided transaction hash, wallet address, and task type.

## Implemented Routes

### `POST /api/payment/verify`

Verifies that a payment transaction matches the expected user and task type.

Request body:

- `txHash`: transaction hash
- `userAddress`: wallet address
- `taskType`: one of `TEXT_SHORT`, `TEXT_LONG`, `IMAGE`, `TRANSLATE`

Success response (`200`):

```json
{
  "verified": true,
  "taskType": "TEXT_SHORT"
}
```

Validation error (`400`):

```json
{
  "error": "Required fields: txHash, userAddress, taskType"
}
```

Payment failure (`402`):

```json
{
  "error": "Payment verification failed."
}
```

### `POST /api/task/generate`

Validates input, applies wallet-based rate limiting, verifies payment, routes the task to the provider layer, and returns the generated result.

Request body:

- `txHash`: transaction hash
- `userAddress`: wallet address
- `taskType`: one of `TEXT_SHORT`, `TEXT_LONG`, `IMAGE`, `TRANSLATE`
- `prompt`: task prompt
- `targetLanguage`: required only when `taskType` is `TRANSLATE`

Success response (`200`):

```json
{
  "taskType": "TEXT_SHORT",
  "output": "...",
  "provider": "deepseek",
  "processingMs": 1234,
  "tokensUsed": 320
}
```

Validation error (`400`):

```json
{
  "error": "Invalid taskType: ..."
}
```

Payment failure (`402`):

```json
{
  "error": "Payment not verified."
}
```

Rate limit (`429`):

```json
{
  "error": "Rate limit exceeded. Try again in 12 seconds."
}
```

Server error (`500`):

```json
{
  "error": "Internal server error"
}
```

## Task Limits And Prices

These limits and UI price labels are used by the current web app:

| Task Type    | Max Input (chars) | UI Price |
| ------------ | ----------------: | -------: |
| `TEXT_SHORT` |               500 |  `$0.01` |
| `TEXT_LONG`  |              2000 |  `$0.05` |
| `IMAGE`      |              1000 |  `$0.08` |
| `TRANSLATE`  |              1500 |  `$0.02` |

## Provider Routing

- `TEXT_SHORT`: DeepSeek
- `TEXT_LONG`: Anthropic, with DeepSeek fallback when `ANTHROPIC_API_KEY` is not set
- `IMAGE`: fal.ai
- `TRANSLATE`: DeepSeek

## Rate Limiting

`POST /api/task/generate` uses an in-memory sliding-window limiter:

- 10 requests
- per 60 seconds
- keyed by wallet address

For multi-instance production deployments, use a shared backend store (for example Redis).

## Standard Error Shape

Current error responses use:

```json
{
  "error": "..."
}
```

## HTTP Status Codes

- `200`: success
- `400`: validation failure
- `402`: payment verification failure
- `405`: unsupported method
- `429`: rate limit exceeded
- `500`: uncaught server error

## Example Requests

```bash
curl -X POST http://localhost:3000/api/payment/verify \
  -H "Content-Type: application/json" \
  -d '{"txHash":"0x...","userAddress":"0x...","taskType":"TEXT_SHORT"}'
```

```bash
curl -X POST http://localhost:3000/api/task/generate \
  -H "Content-Type: application/json" \
  -d '{"txHash":"0x...","userAddress":"0x...","taskType":"TRANSLATE","prompt":"Hello","targetLanguage":"French"}'
```
