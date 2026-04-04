# CeloScribe

## Pay-per-Use AI Agent for MiniPay

CeloScribe is a wallet-native AI agent inside MiniPay that offers writing, image generation, and translation on a true pay-per-use model.

Users pay micro-amounts per task starting at **$0.01** with **no subscription, no credit card, and no account setup friction**.

---

## The Problem

Millions of users in Africa and Southeast Asia are excluded from premium AI tools because subscription pricing assumes access to traditional banking rails.

- ChatGPT Plus: **$20/month**
- Midjourney: **$10/month**

For many students, freelancers, and small business owners, this can represent a large portion of monthly income. The outcome is account sharing, piracy, or complete exclusion from productivity-enhancing AI.

There is still no widely adopted micro-payment AI access layer built directly into African mobile wallet flows.

---

## The Opportunity

CeloScribe is designed for this exact gap:

- Wallet-native AI access through MiniPay
- Fixed, transparent micro-pricing users can understand instantly
- One-click payment + execution flow
- Practical support for local language translation and everyday work tasks

This model aligns with Celo's agent ecosystem momentum, including ERC-8004 identity standards and the Agent Visa growth pathway.

---

## How It Works

1. User opens CeloScribe inside MiniPay.
2. User selects a task category:
   - **Write**: blog post, CV, email, business proposal
   - **Generate Image**: product mockup, social graphic, logo concept
   - **Translate**: English ↔ Yoruba, Igbo, Hausa, Swahili
3. User approves a fixed micro-payment via **x402** before execution.
4. The backend agent routes the task to the most cost-efficient model.
5. Results are returned directly in the MiniPay chat interface.

---

## Pricing

| Task Type | Scope | Price |
|---|---|---:|
| Short Text | Up to 300 words | $0.01 |
| Long Text | Up to 1500 words | $0.05 |
| Image Generation | Single generation task | $0.08 |
| Translation | EN ↔ Yoruba / Igbo / Hausa / Swahili | $0.02 |

---

## What Makes CeloScribe Different

- No subscriptions
- No credit cards
- No email onboarding friction
- Wallet-native payment and delivery
- Micro-pricing built for emerging markets
- Useful, work-focused task templates

---

## Technical Overview

### Frontend
- MiniApp experience inside MiniPay
- Lightweight, clean chat-first interface
- One-tap task selection and payment approval

### Payments
- x402 pre-execution payment flow
- Per-task charging with transparent fixed pricing

### Agent Backend
- Lightweight orchestration (LangChain or custom)
- Cost-aware model routing:
  - Text: low-cost LLM tier (e.g., DeepSeek-class pricing)
  - Images: Stable Diffusion via fal.ai-class provider
- Margin-preserving execution at micro-price points

### On-Chain Agent Identity
- ERC-8004 registry compatibility
- Verified Self Agent ID
- Eligibility pathway for Celo Agent Visa incentives

---

## Why Celo

- Growing momentum as an Ethereum L2 for agent activity
- ERC-8004 enables verifiable autonomous agent trust
- Agent Visa program rewards traction with visibility and DeFi-aligned incentives

---

## Initial Go-To-Market Focus

- Freelancers and students needing affordable writing support
- Small businesses creating proposals, emails, and marketing copy
- Merchants and creators generating low-cost social graphics
- Users requiring practical local-language translation

---

## Vision

CeloScribe aims to become the default AI utility layer for mobile-first economies: affordable, wallet-native, and accessible one task at a time.
