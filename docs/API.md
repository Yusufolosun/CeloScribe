# CeloScribe API Reference

The CeloScribe backend API provides payment verification and AI task execution endpoints. All API routes run server-side within the Next.js application, ensuring secrets remain protected and on-chain payment verification is cryptographically enforced.

## Authentication

The API does not use API keys. Instead, endpoints require:

- Valid transaction hashes verified on-chain
- User wallet addresses that match the payment event
- Supported task types with corresponding payment proof

Frontend wallet state is untrusted; on-chain payment proof is the authentication boundary.

## Endpoints

### `POST /api/payment/verify`

Verifies that a transaction corresponds to a confirmed `PaymentReceived` event from the `CeloScribePayment` contract.

**Request Body:**

```json
{
  "txHash": "0x...",
  "userAddress": "0x...",
  "taskType": "TEXT_SHORT" | "TEXT_LONG" | "IMAGE" | "TRANSLATE"
}
```

**Response (200 OK):**

```json
{
  "verified": true,
  "taskType": "TEXT_SHORT",
  "amount": "1.00",
  "timestamp": 1234567890
}
```

**Response (400 Bad Request):**

```json
{
  "error": "Invalid input",
  "details": "Unknown task type"
}
```

**Response (402 Payment Required):**

```json
{
  "error": "Payment verification failed",
  "details": "No matching payment event found"
}
```

### `POST /api/task/generate`

Verifies on-chain payment, routes the request to the appropriate AI provider, and returns the generated result.

**Request Body:**

```json
{
  "txHash": "0x...",
  "userAddress": "0x...",
  "taskType": "TEXT_SHORT",
  "prompt": "Write a professional email...",
  "targetLanguage": "Spanish" // Required only for TRANSLATE
}
```

**Response (200 OK):**

```json
{
  "taskType": "TEXT_SHORT",
  "output": "Dear [recipient], Thank you...",
  "provider": "deepseek",
  "tokensUsed": 145,
  "processingMs": 2341,
  "completedAt": "2024-01-15T10:30:00Z"
}
```

**Response (400 Bad Request):**

```json
{
  "error": "Invalid input",
  "details": "Missing required field: targetLanguage"
}
```

**Response (402 Payment Required):**

```json
{
  "error": "Payment verification failed",
  "details": "Transaction not confirmed"
}
```

**Response (429 Too Many Requests):**

```json
{
  "error": "Rate limit exceeded",
  "details": "Maximum 100 requests per hour per wallet"
}
```

**Response (500 Internal Server Error):**

```json
{
  "error": "Provider error",
  "details": "The AI provider returned an error"
}
```

## Task Types and Limits

| Task Type    | Max Input  | Provider  | Cost      |
| ------------ | ---------- | --------- | --------- |
| `TEXT_SHORT` | 300 words  | DeepSeek  | 1.00 cUSD |
| `TEXT_LONG`  | 1500 words | Anthropic | 2.50 cUSD |
| `IMAGE`      | 1000 chars | fal.ai    | 3.00 cUSD |
| `TRANSLATE`  | 1500 chars | DeepSeek  | 1.50 cUSD |

## Rate Limiting

- **Global**: 1000 requests per minute across all wallets
- **Per-Wallet**: 100 requests per hour per unique wallet address
- **Per-Provider**: Enforced by each AI provider (see provider docs)

Rate limits are applied server-side and are not bypassable from the client.

## Error Handling

All error responses follow this format:

```json
{
  "error": "Human-readable error category",
  "details": "Additional context",
  "requestId": "req_123abc" // Included for debugging
}
```

Common error categories:

- `"Invalid input"` (400): Malformed or missing required fields
- `"Payment verification failed"` (402): On-chain payment not confirmed
- `"Rate limit exceeded"` (429): Too many requests in time window
- `"Provider error"` (500): AI provider returned an error
- `"Server error"` (500): Unexpected internal error

## Security Considerations

1. **On-Chain Verification**: Every request is verified against the blockchain before processing. No shortcuts are available.
2. **Server-Side Only**: Provider credentials and rate limit state are never exposed to the client.
3. **Request Signing**: Future versions may require request signatures for additional security.
4. **Audit Logging**: All requests are logged with wallet address, task type, and status for audit purposes.

## Examples

### Request Short Text Generation

```bash
curl -X POST http://localhost:3000/api/task/generate \
  -H "Content-Type: application/json" \
  -d '{
    "txHash": "0x1234567890abcdef",
    "userAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f1bEb",
    "taskType": "TEXT_SHORT",
    "prompt": "Write a professional email confirming a meeting."
  }'
```

### Request Translation

```bash
curl -X POST http://localhost:3000/api/task/generate \
  -H "Content-Type: application/json" \
  -d '{
    "txHash": "0x1234567890abcdef",
    "userAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f1bEb",
    "taskType": "TRANSLATE",
    "prompt": "Hello, how are you?",
    "targetLanguage": "French"
  }'
```

## Status Codes Reference

| Code | Meaning                                |
| ---- | -------------------------------------- |
| 200  | Request succeeded                      |
| 400  | Malformed request or unknown task type |
| 402  | Payment verification failed            |
| 429  | Rate limit exceeded                    |
| 500  | Server error; try again later          |

## Future Endpoints

The following endpoints are planned for future development:

- `GET /api/health`: System health check
- `GET /api/user/:address/history`: Transaction and task history for wallet
- `POST /api/webhooks/payment`: Notifications for payment events
- `DELETE /api/cache/:address`: Clear cached results for wallet

## Versioning

The API currently operates on v1 (default). Version negotiation via `Accept-Version` header is planned for future releases.
