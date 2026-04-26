# CeloScribe Architecture

## System Overview

CeloScribe is a four-layer Web3 application that combines a mobile-first UI with cryptographic payment verification and AI service delivery.

```text
┌─────────────────────────┐
│   MiniApp UI Layer      │  React + Next.js frontend
│   Wallet Connection     │  Task input & result display
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│  Smart Contract Layer   │  On-chain payment boundary
│  cUSD Payment Records   │  Event emission for verification
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│  API Route Layer        │  Server-side verification
│  Request Validation     │  Secret credential management
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│  AI Provider Layer      │  DeepSeek, Anthropic, fal.ai
│  Adapter Pattern        │  Normalized request/response
└─────────────────────────┘
```

## Layer Responsibilities

### 1. MiniApp UI Layer (`apps/web/`)

The user-facing entry point responsible for wallet interaction, task composition, and result display.

**Components:**

- **Wallet Panel**: Displays connection state, chain detection, and balance information
- **Task Selector**: Allows users to select from TEXT_SHORT, TEXT_LONG, IMAGE, or TRANSLATE
- **Composer**: Input form with real-time validation against task limits
- **Payment Modal**: Shows payment details and transaction status
- **Result Container**: Displays AI output and transaction hash
- **History Tab**: Lists all completed tasks with blockchain verification

**Key Features:**

- MiniPay detection via `window.ethereum.isMiniPay`
- Chain detection and fallback to injected wallet if MiniPay unavailable
- Local prompt validation before payment initiation
- Web3 stack: Wagmi for state, Viem for transactions, React Query for data, Thirdweb for storage

**Important Design Decisions:**

- No auto-connect; wallet selection is explicit user action
- Prompt validation happens locally to prevent oversized requests from reaching payment
- Target language (for TRANSLATE) is captured before payment and verified server-side
- Transaction history queries start from deployment block, not block zero, for performance

### 2. Smart Contract Layer (`packages/contracts/`)

Defines the on-chain payment boundary and provides cryptographic proof of payment.

**Contract: `CeloScribePayment.sol`**

**Responsibilities:**

- Accept cUSD transfer from user wallet
- Verify request type and price match
- Emit `PaymentReceived` event with user address, task type, and proof data
- Track cumulative revenue for treasury withdrawal

**Payment Process:**

1. User approves cUSD spend in wallet
2. Frontend calls `pay(taskType)` on contract
3. Contract transfers cUSD from user to treasury
4. Contract emits event with all necessary proof data
5. Event is immediately available on-chain

**Security Properties:**

- Non-reenentrant payments
- Whitelisted task types only
- Price immutability (can only be updated via governance)
- No user funds accessible except to approved treasury address

### 3. API Route Layer (`apps/web/src/app/api/`)

Server-side routes that verify payments and coordinate AI delivery.

**Routes:**

#### `POST /api/payment/verify`

- Verifies transaction hash corresponds to valid `PaymentReceived` event
- Returns verified task type if successful
- Returns 402 if payment not found or not confirmed

#### `POST /api/task/generate`

- Calls `/api/payment/verify` internally
- Validates request structure (prompt, targetLanguage if TRANSLATE)
- Looks up provider and calls provider adapter
- Returns normalized result with metadata
- Applies rate limiting per wallet address

**Key Patterns:**

- Environment variables control provider credentials (never exposed to client)
- Request/response logging for audit trail
- Graceful error handling with detailed context
- Rate limiting enforced per wallet address per time window

### 4. AI Provider Layer (`apps/web/src/lib/ai/`)

Adapter pattern for multiple AI providers with consistent interface.

**Providers:**

| Task Type    | Provider  | Adapter           | Rate Limit |
| ------------ | --------- | ----------------- | ---------- |
| `TEXT_SHORT` | DeepSeek  | OpenAI-compatible | 100 req/hr |
| `TEXT_LONG`  | Anthropic | Direct SDK        | 50 req/hr  |
| `IMAGE`      | fal.ai    | Direct SDK        | 50 req/hr  |
| `TRANSLATE`  | DeepSeek  | OpenAI-compatible | 100 req/hr |

**Adapter Interface:**

```typescript
interface TaskProvider {
  taskType: TaskType;
  execute(request: TaskRequest): Promise<TaskResult>;
  validateInput(prompt: string): boolean;
}
```

**Adapter Responsibilities:**

- Token counting and limit enforcement
- Request normalization to provider SDK format
- Response formatting to CeloScribe standard
- Error handling and retry logic
- Token usage tracking

## Payment Flow

```
User Opens App
     │
     ├─> Connect Wallet (MiniPay or Injected)
     │
     └─> On Celo Network?
         ├─> YES: Continue
         └─> NO: Show Network Switch Prompt
             │
             └─> User Switches Network
                 │
                 └─> Continue

User Selects Task & Enters Prompt
     │
     ├─> Validate Prompt Length Locally
     │
     └─> Valid?
         ├─> YES: Enable Payment
         └─> NO: Show Validation Error

User Confirms Payment
     │
     ├─> Show Payment Modal
     │
     ├─> User Signs Transaction
     │
     ├─> Wait for On-Chain Confirmation
     │
     └─> Payment Confirmed
         │
         └─> Transaction Hash Available

Frontend Calls /api/task/generate
     │
     ├─> Verify Payment On-Chain
     │
     ├─> Payment Verified?
     │
     ├─> YES: Route to AI Provider
     │
     ├─> Provider Processes Request
     │
     ├─> Provider Returns Result
     │
     └─> Return Result to UI

UI Displays Result
     │
     ├─> Show AI Output
     │
     ├─> Show Transaction Hash
     │
     ├─> Add to History
     │
     └─> Ready for Next Request
```

## Data Flow

### Request Path (Client → Server)

```
TaskRequest {
  taskType: 'TEXT_SHORT'
  prompt: "Write an email..."
  targetLanguage?: "Spanish"    // Only for TRANSLATE
}
         │
         ├─> Browser Validation
         ├─> User Wallet Signs Payment
         ├─> On-Chain Payment Confirmation
         │
         └─> /api/task/generate {
               txHash: "0x..."
               userAddress: "0x..."
               taskType: "TEXT_SHORT"
               prompt: "Write an email..."
               targetLanguage?: "Spanish"
             }
```

### Response Path (Server → Client)

```
/api/task/generate
    │
    ├─> Verify Payment On-Chain
    ├─> Validate Request Structure
    ├─> Select Provider (DeepSeek, Anthropic, fal.ai)
    ├─> Execute Task
    │
    └─> TaskResult {
          taskType: "TEXT_SHORT"
          output: "Dear [recipient]..."
          provider: "deepseek"
          tokensUsed: 145
          processingMs: 2341
          completedAt: "2024-01-15T10:30:00Z"
        }
         │
         └─> Client UI Displays Result
```

## Security Architecture

### Payment Verification Boundary

Payment verification is the **only** security boundary. No request proceeds without:

1. **On-Chain Proof**: Transaction hash maps to confirmed `PaymentReceived` event
2. **Address Match**: Event logs user address matching request address
3. **Type Match**: Event logs task type matching request type
4. **Server-Side Only**: Verification happens server-side, never trusting client

### Secret Management

| Secret                 | Location                      | Usage               |
| ---------------------- | ----------------------------- | ------------------- |
| `DEPLOYER_PRIVATE_KEY` | `.env.local` only             | Contract deployment |
| `TREASURY_ADDRESS`     | `.env.local` + contract       | Revenue recipient   |
| `DEEPSEEK_API_KEY`     | `.env.local` + process memory | Text generation     |
| `ANTHROPIC_API_KEY`    | `.env.local` + process memory | Long-form writing   |
| `FAL_API_KEY`          | `.env.local` + process memory | Image generation    |

**Rules:**

- Never commit `.env.local`
- Never log secrets
- Never send secrets to client
- Rotate keys regularly
- Use provider-specific rate limits and quotas

### Rate Limiting

Applied server-side per wallet address:

- **Global**: 1000 requests per minute
- **Per-Wallet**: 100 requests per hour per address
- **Per-Provider**: Enforced by each provider (separate quota)

Rate limits cannot be bypassed from client; they are enforced server-side in the API route.

## Component Interaction

### Wallet Connection → Payment

```
App Mounts
    │
    ├─> Web3Provider (Wagmi, Viem, Thirdweb)
    │
    └─> useContract Hook
        ├─> Loads CeloScribePayment ABI
        ├─> Connects to contract address
        ├─> Ready for payment calls
        │
        └─> useMiniPay Hook
            ├─> Detects MiniPay via window.ethereum
            ├─> Falls back to injected wallet
            ├─> Shows unsupported state if neither available
            │
            └─> User Can Now Pay
```

### Prompt Validation

```
User Types Prompt
    │
    └─> onChange Handler
        ├─> Count input characters
        ├─> Check against TASK_LIMITS[selectedTask]
        ├─> Show validation message if over limit
        │
        └─> Disable Payment Until Valid
```

### Payment Processing

```
User Clicks "Pay X cUSD"
    │
    ├─> Show Payment Modal
    ├─> Set state to "approving"
    │
    └─> User Signs Approval (if not already approved)
        ├─> Wait for confirmation
        ├─> Set state to "paying"
        │
        └─> Call contract.pay(taskType)
            ├─> Wait for transaction
            ├─> Set state to "confirming"
            │
            └─> Wait for block confirmation
                ├─> Set state to "done"
                │
                └─> Extract txHash
                    │
                    └─> Call /api/task/generate with txHash
```

## Deployment Architecture

### Local Development

```
Localhost:3000
    ├─> Next.js Dev Server (hot reload)
    ├─> Celo Mainnet (via RPC)
    ├─> Test Wallet (MiniPay or Browser Extension)
    │
    └─> AI Providers (via API keys from .env.local)
```

### Production Deployment

```
Vercel / Cloud Platform
    ├─> Next.js App (built)
    ├─> Environment Variables (from platform secrets)
    ├─> Celo Mainnet (via public RPC)
    ├─> Deployed Contract (at fixed address)
    │
    └─> AI Providers (via platform-managed API keys)
```

## Design Principles

1. **Cryptographic Boundary**: On-chain payment verification, not client state, is the security boundary
2. **Server-Side Secrets**: All credentials remain server-side; client receives only results
3. **Explicit Consent**: Users explicitly approve each payment; no auto-pay or batch features
4. **Immutable History**: All transactions are recorded on-chain for audit and transparency
5. **Provider Flexibility**: Adapter pattern allows swapping providers without changing core logic
6. **Rate Limiting**: Protects providers and prevents abuse; enforced server-side
7. **Error Transparency**: Users see clear error messages; detailed errors logged server-side
8. **Mobile-First**: UI is optimized for MiniPay and mobile wallets

## Performance Considerations

- **Transaction History**: Queries from deployment block onward (not block 0) for responsiveness
- **Provider Timeouts**: 30-second timeout per provider request with graceful error handling
- **React Query Caching**: Wallet balances cached with 30-second stale time
- **Request Deduplication**: Duplicate txHash submissions within 1 second are rejected
- **CDN Distribution**: Frontend served via Vercel Edge Network for global performance

## Future Enhancements

- Webhook notifications for transaction completions
- Batch payment processing for power users
- Provider auto-selection based on latency and cost
- User reputation system for early access to new providers
- Multi-signature treasury for governance
