import { fal } from '@fal-ai/client';

import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

import { rethrowProviderError } from '../providerErrors';
import type { TaskRequest, TaskResult } from '../taskTypes';

fal.config({ credentials: env.FAL_API_KEY });

export async function generateWithFal(request: TaskRequest): Promise<TaskResult> {
  const start = Date.now();

  if (request.prompt.length > 1000) {
    throw new Error('Image prompt too long. Max 1000 characters.');
  }

  try {
    const result = await fal.subscribe('fal-ai/stable-diffusion-v35-large', {
      input: {
        prompt: request.prompt,
        image_size: 'square_hd',
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: true,
      },
    });

    const imageUrl = (result.data as { images?: { url: string }[] }).images?.[0]?.url;

    if (!imageUrl) {
      throw new Error('fal.ai returned no image URL.');
    }

    logger.info({
      provider: 'fal-ai/stable-diffusion-v35-large',
      taskType: 'IMAGE',
      processingMs: Date.now() - start,
    });

    return {
      taskType: 'IMAGE',
      output: imageUrl,
      provider: 'fal-ai/stable-diffusion-v35-large',
      processingMs: Date.now() - start,
    };
  } catch (error) {
    rethrowProviderError('fal.ai', error);
  }
}
