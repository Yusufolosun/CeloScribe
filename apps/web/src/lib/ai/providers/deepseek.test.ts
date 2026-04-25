import { beforeEach, describe, expect, it, vi } from 'vitest';

import { generateWithDeepSeek } from './deepseek';

const mockState = vi.hoisted(() => {
  const createMock = vi.fn();
  const infoMock = vi.fn();

  return {
    client: {
      chat: {
        completions: {
          create: createMock,
        },
      },
    },
    createMock,
    infoMock,
  };
});

vi.mock('openai', () => ({
  default: vi.fn(function OpenAI() {
    return mockState.client;
  }),
}));

vi.mock('@/lib/env', () => ({
  getServerEnv: () => ({
    DEEPSEEK_API_KEY: 'test-deepseek-key',
  }),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: mockState.infoMock,
  },
}));

describe('generateWithDeepSeek', () => {
  beforeEach(() => {
    mockState.createMock.mockReset();
    mockState.infoMock.mockReset();
  });

  it('routes short text tasks to DeepSeek and returns the model output', async () => {
    mockState.createMock.mockResolvedValue({
      choices: [{ message: { content: 'short response' } }],
      usage: { total_tokens: 12 },
    });

    const result = await generateWithDeepSeek({
      prompt: 'Summarize this text.',
      taskType: 'TEXT_SHORT',
    });

    expect(mockState.createMock).toHaveBeenCalledWith({
      max_tokens: 400,
      model: 'deepseek-chat',
      messages: [
        {
          content: 'You are a helpful AI assistant. Respond clearly and concisely.',
          role: 'system',
        },
        { content: 'Summarize this text.', role: 'user' },
      ],
    });
    expect(result).toEqual({
      output: 'short response',
      processingMs: expect.any(Number),
      provider: 'deepseek-chat',
      taskType: 'TEXT_SHORT',
      tokensUsed: 12,
    });
  });

  it('requires a target language for translation tasks', async () => {
    await expect(
      generateWithDeepSeek({
        prompt: 'Translate this.',
        taskType: 'TRANSLATE',
      })
    ).rejects.toThrow('targetLanguage required for TRANSLATE tasks.');

    expect(mockState.createMock).not.toHaveBeenCalled();
  });
});
