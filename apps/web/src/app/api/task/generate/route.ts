import { type NextRequest, NextResponse } from 'next/server';

import { type Address, type Hash } from 'viem';

import { routeTask } from '@/lib/ai/router';
import type { TaskType } from '@/lib/ai/taskTypes';
import { isSupportedTaskType } from '@/lib/ai/taskValidation';
import { badRequest, methodNotAllowed, paymentRequired, withErrorHandling } from '@/lib/api';
import { TaskType as PaymentTaskType, verifyPayment } from '@/lib/payment/verifyPayment';

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

  if (!isSupportedTaskType(body.taskType)) {
    return badRequest(`Invalid taskType: ${body.taskType}`);
  }

  const paymentTaskType = PaymentTaskType[body.taskType as keyof typeof PaymentTaskType];
  const verification = await verifyPayment(body.txHash, body.userAddress, paymentTaskType);

  if (!verification.valid) {
    return paymentRequired(verification.reason ?? 'Payment not verified.');
  }

  const result = await routeTask({
    taskType: body.taskType,
    prompt: body.prompt,
    ...(body.targetLanguage ? { targetLanguage: body.targetLanguage } : {}),
  });

  return NextResponse.json(result);
});
