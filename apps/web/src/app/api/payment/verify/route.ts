import { type NextRequest, NextResponse } from 'next/server';

import { type Address, type Hash } from 'viem';

import { badRequest, methodNotAllowed, withErrorHandling } from '@/lib/api';
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

  const taskType = TaskType[body.taskType as keyof typeof TaskType];
  const result = await verifyPayment(body.txHash, body.userAddress, taskType);

  return NextResponse.json({ verified: result.valid, taskType: body.taskType });
});
