import { describe, expect, it } from 'vitest';

import { CELOSCRIBE_CONTRACT_DEPLOYMENT_BLOCK } from './celoScribeDeployment';

describe('CELOSCRIBE_CONTRACT_DEPLOYMENT_BLOCK', () => {
  it('uses the known Celo deployment block', () => {
    expect(CELOSCRIBE_CONTRACT_DEPLOYMENT_BLOCK).toBe(64_681_064n);
  });
});
