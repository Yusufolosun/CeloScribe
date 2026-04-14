import Anthropic from '@anthropic-ai/sdk';

import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

import { rethrowProviderError } from '../providerErrors';
import type { TaskRequest, TaskResult } from '../taskTypes';
import { TASK_LIMITS } from '../taskTypes';

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

export async function generateWithAnthropic(request: TaskRequest): Promise<TaskResult> {
  const start = Date.now();
  const limits = TASK_LIMITS[request.taskType];

  if (request.prompt.length > limits.maxInputChars) {
    throw new Error(
      `Prompt too long. Max ${limits.maxInputChars} characters for ${request.taskType}.`
    );
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: limits.maxOutputTokens,
      messages: [{ role: 'user', content: request.prompt }],
    });

    const output = message.content
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('')
      .trim();

    if (!output) {
      throw new Error('Anthropic returned an unexpected content type.');
    }

    logger.info({
      provider: 'claude-haiku',
      taskType: request.taskType,
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
      processingMs: Date.now() - start,
    });

    return {
      taskType: request.taskType,
      output,
      provider: 'claude-haiku-4-5-20251001',
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
      processingMs: Date.now() - start,
    };
  } catch (error) {
    rethrowProviderError('Anthropic', error);
  }
}
