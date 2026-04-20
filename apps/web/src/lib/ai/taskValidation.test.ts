import { describe, expect, it } from 'vitest';

import { getPromptLimitError, isSupportedTaskType } from './taskValidation';

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

describe('getPromptLimitError', () => {
  it('returns no error when the prompt stays within the selected limit', () => {
    expect(getPromptLimitError('TEXT_SHORT', 'a'.repeat(500))).toBeNull();
  });

  it('trims surrounding whitespace before checking the prompt length', () => {
    expect(getPromptLimitError('TEXT_SHORT', `  ${'a'.repeat(500)}  `)).toBeNull();
  });

  it('returns the selected task limit when the prompt exceeds it', () => {
    expect(getPromptLimitError('TEXT_SHORT', 'a'.repeat(501))).toBe(
      'Prompt too long. Max 500 characters for TEXT_SHORT.'
    );
  });

  it('returns no error when no task is selected', () => {
    expect(getPromptLimitError(null, 'a'.repeat(501))).toBeNull();
  });
});
