import { type NextRequest, NextResponse } from 'next/server';

import { type Address, type Hash } from 'viem';

import { routeTask } from '@/lib/ai/router';
import type { TaskType } from '@/lib/ai/taskTypes';
import { getPromptLimitError, isSupportedTaskType } from '@/lib/ai/taskValidation';
import {
  badRequest,
  methodNotAllowed,
  paymentRequired,
  tooManyRequests,
  withErrorHandling,
} from '@/lib/api';
import { TaskType as PaymentTaskType, verifyPayment } from '@/lib/payment/verifyPayment';
import { checkRateLimit } from '@/lib/rateLimit';

interface GenerateRequest {
  txHash: Hash;
  userAddress: Address;
  taskType: TaskType;
  prompt: string;
  targetLanguage?: string;
}

export const POST = withErrorHandling(async (req: NextRequest) => {
  if (req.method !== 'POST') return methodNotAllowed(['POST']);

  const body = (await req.json()) as Partial<GenerateRequest>;

  if (!body.txHash || !body.userAddress || !body.taskType || !body.prompt) {
    return badRequest('Required fields: txHash, userAddress, taskType, prompt');
  }

  const prompt = body.prompt.trim();

  if (!prompt) {
    return badRequest('Required fields: txHash, userAddress, taskType, prompt');
  }

  if (!isSupportedTaskType(body.taskType)) {
    return badRequest(`Invalid taskType: ${body.taskType}`);
  }

  const promptLimitError = getPromptLimitError(body.taskType, prompt);

  if (promptLimitError) {
    return badRequest(promptLimitError);
  }

  const rateLimit = checkRateLimit(body.userAddress);

  if (!rateLimit.allowed) {
    return tooManyRequests(rateLimit.retryAfterMs);
  }

  const paymentTaskType = PaymentTaskType[body.taskType as keyof typeof PaymentTaskType];
  const verification = await verifyPayment(body.txHash, body.userAddress, paymentTaskType);

  if (!verification.valid) {
    return paymentRequired(verification.reason ?? 'Payment not verified.');
  }

  const result = await routeTask({
    taskType: body.taskType,
    prompt,
    ...(body.targetLanguage ? { targetLanguage: body.targetLanguage } : {}),
  });

  return NextResponse.json(result);
});
