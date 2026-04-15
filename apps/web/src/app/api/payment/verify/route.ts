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
  const validTaskTypeNames = Object.keys(TaskType).filter((key) => Number.isNaN(Number(key)));

  if (!body.txHash || !body.userAddress || body.taskType === undefined) {
    return badRequest('Required fields: txHash, userAddress, taskType');
  }

  const taskTypeValue = TaskType[body.taskType as keyof typeof TaskType];
  if (typeof taskTypeValue !== 'number') {
    return badRequest(`Invalid taskType. Must be one of: ${validTaskTypeNames.join(', ')}`);
  }

  const result = await verifyPayment(body.txHash, body.userAddress, taskTypeValue);

  if (!result.valid) {
    return paymentRequired(result.reason ?? 'Payment verification failed.');
  }

  return NextResponse.json({ verified: true, taskType: body.taskType });
});
