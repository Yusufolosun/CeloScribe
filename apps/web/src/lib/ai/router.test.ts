import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routeTask } from './router';

const mockState = vi.hoisted(() => {
  const anthropicMock = vi.fn();
  const deepseekMock = vi.fn();
  const falMock = vi.fn();
  const infoMock = vi.fn();
  const warnMock = vi.fn();
  const hasServerEnvMock = vi.fn();

  return {
    anthropicMock,
    deepseekMock,
    falMock,
    infoMock,
    warnMock,
    hasServerEnvMock,
  };
});

vi.mock('@/lib/logger', () => ({
  logger: {
    info: mockState.infoMock,
    warn: mockState.warnMock,
  },
}));

vi.mock('@/lib/env', () => ({
  hasServerEnv: mockState.hasServerEnvMock,
}));

vi.mock('./providers/anthropic', () => ({
  generateWithAnthropic: mockState.anthropicMock,
}));

vi.mock('./providers/deepseek', () => ({
  generateWithDeepSeek: mockState.deepseekMock,
}));

vi.mock('./providers/fal', () => ({
  generateWithFal: mockState.falMock,
}));

describe('routeTask', () => {
  beforeEach(() => {
    mockState.anthropicMock.mockReset();
    mockState.deepseekMock.mockReset();
    mockState.falMock.mockReset();
    mockState.infoMock.mockReset();
    mockState.warnMock.mockReset();
    mockState.hasServerEnvMock.mockReset();
  });

  it('routes short text tasks to DeepSeek', async () => {
    mockState.deepseekMock.mockResolvedValue({
      output: 'short',
      processingMs: 1,
      provider: 'deepseek-chat',
      taskType: 'TEXT_SHORT',
    });

    const result = await routeTask({ prompt: 'Write short copy.', taskType: 'TEXT_SHORT' });

    expect(mockState.deepseekMock).toHaveBeenCalledWith({
      prompt: 'Write short copy.',
      taskType: 'TEXT_SHORT',
    });
    expect(result.provider).toBe('deepseek-chat');
    expect(mockState.anthropicMock).not.toHaveBeenCalled();
    expect(mockState.falMock).not.toHaveBeenCalled();
  });

  it('routes long text tasks to Anthropic', async () => {
    mockState.hasServerEnvMock.mockReturnValue(true);

    mockState.anthropicMock.mockResolvedValue({
      output: 'long',
      processingMs: 1,
      provider: 'claude-haiku-4-5-20251001',
      taskType: 'TEXT_LONG',
    });

    await routeTask({ prompt: 'Write a long explanation.', taskType: 'TEXT_LONG' });

    expect(mockState.anthropicMock).toHaveBeenCalledWith({
      prompt: 'Write a long explanation.',
      taskType: 'TEXT_LONG',
    });
    expect(mockState.deepseekMock).not.toHaveBeenCalled();
  });

  it('falls back to DeepSeek for long text tasks when Anthropic is unavailable', async () => {
    mockState.hasServerEnvMock.mockReturnValue(false);

    mockState.deepseekMock.mockResolvedValue({
      output: 'long-via-deepseek',
      processingMs: 1,
      provider: 'deepseek-chat',
      taskType: 'TEXT_LONG',
    });

    const result = await routeTask({ prompt: 'Write a long explanation.', taskType: 'TEXT_LONG' });

    expect(mockState.anthropicMock).not.toHaveBeenCalled();
    expect(mockState.deepseekMock).toHaveBeenCalledWith({
      prompt: 'Write a long explanation.',
      taskType: 'TEXT_LONG',
    });
    expect(mockState.warnMock).toHaveBeenCalled();
    expect(result.provider).toBe('deepseek-chat');
  });

  it('routes image tasks to fal.ai', async () => {
    mockState.falMock.mockResolvedValue({
      output: 'https://example.com/image.png',
      processingMs: 1,
      provider: 'fal-ai/stable-diffusion-v35-large',
      taskType: 'IMAGE',
    });

    await routeTask({ prompt: 'Render an image.', taskType: 'IMAGE' });

    expect(mockState.falMock).toHaveBeenCalledWith({
      prompt: 'Render an image.',
      taskType: 'IMAGE',
    });
  });

  it('routes translation tasks to DeepSeek', async () => {
    mockState.deepseekMock.mockResolvedValue({
      output: 'traducción',
      processingMs: 1,
      provider: 'deepseek-chat',
      taskType: 'TRANSLATE',
    });

    await routeTask({
      prompt: 'Translate this sentence.',
      taskType: 'TRANSLATE',
      targetLanguage: 'Spanish',
    });

    expect(mockState.deepseekMock).toHaveBeenCalledWith({
      prompt: 'Translate this sentence.',
      taskType: 'TRANSLATE',
      targetLanguage: 'Spanish',
    });
  });
});
