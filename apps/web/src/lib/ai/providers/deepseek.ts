import OpenAI from 'openai';

import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

import { rethrowProviderError } from '../providerErrors';
import type { TaskRequest, TaskResult } from '../taskTypes';
import { TASK_LIMITS } from '../taskTypes';

const client = new OpenAI({
  apiKey: env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

function normalizeOutput(content: string | null | undefined | Array<{ text?: string }>): string {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((block) => block.text ?? '')
      .join('')
      .trim();
  }

  return '';
}

export async function generateWithDeepSeek(request: TaskRequest): Promise<TaskResult> {
  const start = Date.now();
  const limits = TASK_LIMITS[request.taskType];

  if (request.prompt.length > limits.maxInputChars) {
    throw new Error(
      `Prompt too long. Max ${limits.maxInputChars} characters for ${request.taskType}.`
    );
  }

  const systemPrompt =
    request.taskType === 'TRANSLATE'
      ? (() => {
          if (!request.targetLanguage) {
            throw new Error('targetLanguage required for TRANSLATE tasks.');
          }

          return `You are a professional translator. Translate the following text accurately to ${request.targetLanguage}. Output only the translation — no explanations, no preamble.`;
        })()
      : 'You are a helpful AI assistant. Respond clearly and concisely.';

  try {
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      max_tokens: limits.maxOutputTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: request.prompt },
      ],
    });

    const output = normalizeOutput(response.choices[0]?.message?.content);

    if (!output) {
      throw new Error('DeepSeek returned an empty response.');
    }

    logger.info({
      provider: 'deepseek',
      taskType: request.taskType,
      tokensUsed: response.usage?.total_tokens,
      processingMs: Date.now() - start,
    });

    return {
      taskType: request.taskType,
      output,
      provider: 'deepseek-chat',
      tokensUsed: response.usage?.total_tokens,
      processingMs: Date.now() - start,
    };
  } catch (error) {
    rethrowProviderError('DeepSeek', error);
  }
}
