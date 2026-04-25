import { beforeEach, describe, expect, it, vi } from 'vitest';

import { generateWithFal } from './fal';

const mockState = vi.hoisted(() => {
  const configMock = vi.fn();
  const subscribeMock = vi.fn();
  const infoMock = vi.fn();

  return {
    configMock,
    infoMock,
    subscribeMock,
  };
});

vi.mock('@fal-ai/client', () => ({
  fal: {
    config: mockState.configMock,
    subscribe: mockState.subscribeMock,
  },
}));

vi.mock('@/lib/env', () => ({
  getServerEnv: () => ({
    FAL_API_KEY: 'test-fal-key',
  }),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: mockState.infoMock,
  },
}));

describe('generateWithFal', () => {
  beforeEach(() => {
    mockState.configMock.mockReset();
    mockState.infoMock.mockReset();
    mockState.subscribeMock.mockReset();
  });

  it('subscribes with safety checking enabled and returns the image URL', async () => {
    mockState.subscribeMock.mockResolvedValue({
      data: {
        images: [{ url: 'https://example.com/generated.png' }],
      },
    });

    const result = await generateWithFal({
      prompt: 'A neon city skyline at night',
      taskType: 'IMAGE',
    });

    expect(mockState.subscribeMock).toHaveBeenCalledWith('fal-ai/stable-diffusion-v35-large', {
      input: {
        enable_safety_checker: true,
        guidance_scale: 3.5,
        image_size: 'square_hd',
        num_images: 1,
        num_inference_steps: 28,
        prompt: 'A neon city skyline at night',
      },
    });
    expect(result).toEqual({
      output: 'https://example.com/generated.png',
      processingMs: expect.any(Number),
      provider: 'fal-ai/stable-diffusion-v35-large',
      taskType: 'IMAGE',
    });
  });

  it('rejects image prompts that exceed the size limit', async () => {
    await expect(
      generateWithFal({
        prompt: 'b'.repeat(1001),
        taskType: 'IMAGE',
      })
    ).rejects.toThrow('Image prompt too long. Max 1000 characters.');

    expect(mockState.subscribeMock).not.toHaveBeenCalled();
  });
});
