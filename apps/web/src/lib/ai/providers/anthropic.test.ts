import { beforeEach, describe, expect, it, vi } from 'vitest';

import { generateWithAnthropic } from './anthropic';

const mockState = vi.hoisted(() => {
  const createMock = vi.fn();
  const infoMock = vi.fn();

  return {
    client: {
      messages: {
        create: createMock,
      },
    },
    createMock,
    infoMock,
  };
});

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(function Anthropic() {
    return mockState.client;
  }),
}));

vi.mock('@/lib/env', () => ({
  env: {
    ANTHROPIC_API_KEY: 'test-anthropic-key',
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: mockState.infoMock,
  },
}));

describe('generateWithAnthropic', () => {
  beforeEach(() => {
    mockState.createMock.mockReset();
    mockState.infoMock.mockReset();
  });

  it('returns the text block output for long text tasks', async () => {
    mockState.createMock.mockResolvedValue({
      content: [{ text: 'expanded answer', type: 'text' }],
      usage: { input_tokens: 5, output_tokens: 9 },
    });

    const result = await generateWithAnthropic({
      prompt: 'Explain the contract architecture.',
      taskType: 'TEXT_LONG',
    });

    expect(mockState.createMock).toHaveBeenCalledWith({
      max_tokens: 2000,
      messages: [{ content: 'Explain the contract architecture.', role: 'user' }],
      model: 'claude-haiku-4-5-20251001',
    });
    expect(result).toEqual({
      output: 'expanded answer',
      processingMs: expect.any(Number),
      provider: 'claude-haiku-4-5-20251001',
      taskType: 'TEXT_LONG',
      tokensUsed: 14,
    });
  });

  it('rejects prompts that exceed the configured input limit', async () => {
    await expect(
      generateWithAnthropic({
        prompt: 'a'.repeat(2001),
        taskType: 'TEXT_LONG',
      })
    ).rejects.toThrow('Prompt too long. Max 2000 characters for TEXT_LONG.');

    expect(mockState.createMock).not.toHaveBeenCalled();
  });
});
