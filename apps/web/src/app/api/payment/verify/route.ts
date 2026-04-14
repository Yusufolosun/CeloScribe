import { type NextRequest, NextResponse } from 'next/server';

import { type Address, type Hash } from 'viem';

import { badRequest, methodNotAllowed, paymentRequired, withErrorHandling } from '@/lib/api';
import { TaskType, verifyPayment } from '@/lib/payment/verifyPayment';

interface VerifyPaymentRequest {
  txHash: Hash;
  userAddress: Address;
  taskType: keyof typeof TaskType;
}

export const POST = withErrorHandling(async (req: NextRequest) => {
  if (req.method !== 'POST') return methodNotAllowed(['POST']);

  const body = (await req.json()) as Partial<VerifyPaymentRequest>;

  if (!body.txHash || !body.userAddress || body.taskType === undefined) {
    return badRequest('Required fields: txHash, userAddress, taskType');
  }

  if (!(body.taskType in TaskType)) {
    return badRequest(`Invalid taskType. Must be one of: ${Object.keys(TaskType).join(', ')}`);
  }

  const taskType = TaskType[body.taskType as keyof typeof TaskType];
  const result = await verifyPayment(body.txHash, body.userAddress, taskType);

  if (!result.valid) {
    return paymentRequired(result.reason ?? 'Payment verification failed.');
  }

  return NextResponse.json({ verified: true, taskType: body.taskType });
});
