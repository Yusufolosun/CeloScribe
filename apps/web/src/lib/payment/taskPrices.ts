import { parseUnits } from 'viem';

import type { TaskType } from '@/lib/ai/taskTypes';

// Must stay in lockstep with the PRICE_* constants in CeloScribePayment.sol.
export const TASK_PRICES: Record<TaskType, bigint> = {
  TEXT_SHORT: parseUnits('0.01', 18),
  TEXT_LONG: parseUnits('0.05', 18),
  IMAGE: parseUnits('0.08', 18),
  TRANSLATE: parseUnits('0.02', 18),
};

export const TASK_PRICE_DISPLAY: Record<TaskType, string> = {
  TEXT_SHORT: '$0.01',
  TEXT_LONG: '$0.05',
  IMAGE: '$0.08',
  TRANSLATE: '$0.02',
};
