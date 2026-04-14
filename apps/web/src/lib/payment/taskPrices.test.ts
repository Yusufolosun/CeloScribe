import { parseUnits } from 'viem';
import { describe, expect, it } from 'vitest';

import { TASK_PRICES, TASK_PRICE_DISPLAY } from './taskPrices';

describe('taskPrices', () => {
  it('matches the cUSD prices defined in the payment contract', () => {
    expect(TASK_PRICES).toEqual({
      TEXT_SHORT: parseUnits('0.01', 18),
      TEXT_LONG: parseUnits('0.05', 18),
      IMAGE: parseUnits('0.08', 18),
      TRANSLATE: parseUnits('0.02', 18),
    });
  });

  it('exposes the matching display strings', () => {
    expect(TASK_PRICE_DISPLAY).toEqual({
      TEXT_SHORT: '$0.01',
      TEXT_LONG: '$0.05',
      IMAGE: '$0.08',
      TRANSLATE: '$0.02',
    });
  });
});
