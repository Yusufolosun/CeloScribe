import { describe, expect, it } from 'vitest';

import { isSupportedTaskType } from './taskValidation';

describe('isSupportedTaskType', () => {
  it('accepts the supported task names', () => {
    expect(isSupportedTaskType('TEXT_SHORT')).toBe(true);
    expect(isSupportedTaskType('TEXT_LONG')).toBe(true);
    expect(isSupportedTaskType('IMAGE')).toBe(true);
    expect(isSupportedTaskType('TRANSLATE')).toBe(true);
  });

  it('rejects prototype and unknown keys', () => {
    expect(isSupportedTaskType('toString')).toBe(false);
    expect(isSupportedTaskType('constructor')).toBe(false);
    expect(isSupportedTaskType('NOT_A_TASK')).toBe(false);
  });
});
