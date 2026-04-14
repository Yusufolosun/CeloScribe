'use client';

import { useCallback, useState } from 'react';

import { type Hash } from 'viem';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';

import type { TaskType } from '@/lib/ai/taskTypes';
import { CELOSCRIBE_PAYMENT_ABI } from '@/lib/contracts/CeloScribePayment.abi';
import { TASK_PRICES } from '@/lib/payment/taskPrices';

import { useCusdApproval } from './useCusdApproval';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CELOSCRIBE_CONTRACT_ADDRESS as
  | `0x${string}`
  | undefined;

const TASK_TYPE_INDEX: Record<TaskType, number> = {
  TEXT_SHORT: 0,
  TEXT_LONG: 1,
  IMAGE: 2,
  TRANSLATE: 3,
};

type PaymentState = 'idle' | 'approving' | 'paying' | 'confirming' | 'done' | 'error';

interface UseTaskPaymentReturn {
  pay: (taskType: TaskType) => Promise<Hash | null>;
  state: PaymentState;
  txHash: Hash | null;
  error: string | null;
  reset: () => void;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function getContractAddress(): `0x${string}` {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Missing NEXT_PUBLIC_CELOSCRIBE_CONTRACT_ADDRESS.');
  }

  return CONTRACT_ADDRESS;
}

export function useTaskPayment(): UseTaskPaymentReturn {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { approve } = useCusdApproval();

  const [state, setState] = useState<PaymentState>('idle');
  const [txHash, setTxHash] = useState<Hash | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setState('idle');
    setTxHash(null);
    setError(null);
  }, []);

  const pay = useCallback(
    async (taskType: TaskType): Promise<Hash | null> => {
      if (!address) {
        setState('error');
        setError('Wallet not connected.');
        return null;
      }

      if (!publicClient) {
        setState('error');
        setError('Blockchain client is unavailable.');
        return null;
      }

      setState('approving');
      setTxHash(null);
      setError(null);

      try {
        const contractAddress = getContractAddress();
        const amount = TASK_PRICES[taskType];
        const approvalHash = await approve(contractAddress, amount);

        if (!approvalHash) {
          throw new Error('cUSD approval failed.');
        }

        setState('paying');

        const paymentHash = await writeContractAsync({
          address: contractAddress,
          abi: CELOSCRIBE_PAYMENT_ABI,
          functionName: 'payForTask',
          args: [TASK_TYPE_INDEX[taskType]],
        });

        setTxHash(paymentHash);
        setState('confirming');

        const receipt = await publicClient.waitForTransactionReceipt({ hash: paymentHash });
        if (receipt.status !== 'success') {
          throw new Error('Task payment transaction reverted.');
        }

        setState('done');
        return paymentHash;
      } catch (error) {
        setState('error');
        setError(getErrorMessage(error, 'Payment failed.'));
        return null;
      }
    },
    [address, approve, publicClient, writeContractAsync]
  );

  return { pay, state, txHash, error, reset };
}
