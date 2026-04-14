'use client';

import { useCallback, useState } from 'react';

import { type Address, type Hash } from 'viem';
import { usePublicClient, useWriteContract } from 'wagmi';

import { CUSD_ADDRESS } from '@/lib/chains';
import { CUSD_ABI } from '@/lib/contracts/cusd.abi';

type ApprovalState = 'idle' | 'approving' | 'confirming' | 'done' | 'error';

interface UseCusdApprovalReturn {
  approve: (spender: Address, amount: bigint) => Promise<Hash | null>;
  state: ApprovalState;
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

export function useCusdApproval(): UseCusdApprovalReturn {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [state, setState] = useState<ApprovalState>('idle');
  const [txHash, setTxHash] = useState<Hash | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setState('idle');
    setTxHash(null);
    setError(null);
  }, []);

  const approve = useCallback(
    async (spender: Address, amount: bigint): Promise<Hash | null> => {
      if (!publicClient) {
        setState('error');
        setError('Blockchain client is unavailable.');
        return null;
      }

      setState('approving');
      setTxHash(null);
      setError(null);

      try {
        const hash = await writeContractAsync({
          address: CUSD_ADDRESS,
          abi: CUSD_ABI,
          functionName: 'approve',
          args: [spender, amount],
        });

        setTxHash(hash);
        setState('confirming');

        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        if (receipt.status !== 'success') {
          throw new Error('cUSD approval transaction reverted.');
        }

        setState('done');
        return hash;
      } catch (error) {
        setState('error');
        setError(getErrorMessage(error, 'Approval failed.'));
        return null;
      }
    },
    [publicClient, writeContractAsync]
  );

  return { approve, state, txHash, error, reset };
}
