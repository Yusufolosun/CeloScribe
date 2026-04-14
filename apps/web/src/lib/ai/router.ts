// Installed versions: @anthropic-ai/sdk 0.88.0, openai 6.34.0, @fal-ai/client 1.9.5.
// Keep all AI provider selection and SDK interaction inside this module.
import { logger } from '@/lib/logger';

import { generateWithAnthropic } from './providers/anthropic';
import { generateWithDeepSeek } from './providers/deepseek';
import { generateWithFal } from './providers/fal';
import type { TaskRequest, TaskResult } from './taskTypes';

/**
 * Routes an AI task request to the appropriate provider based on task type.
 *
 * Routing Table:
 * - TEXT_SHORT  -> DeepSeek V3  (lowest cost for short tasks)
 * - TEXT_LONG   -> Claude Haiku (better quality for longer outputs)
 * - IMAGE       -> fal.ai SDXL  (only image provider)
 * - TRANSLATE   -> DeepSeek V3  (multilingual strength)
 */
export async function routeTask(request: TaskRequest): Promise<TaskResult> {
  logger.info({ msg: 'Routing task', taskType: request.taskType });

  switch (request.taskType) {
    case 'TEXT_SHORT':
      return generateWithDeepSeek(request);
    case 'TEXT_LONG':
      return generateWithAnthropic(request);
    case 'IMAGE':
      return generateWithFal(request);
    case 'TRANSLATE':
      return generateWithDeepSeek(request);
    default: {
      const exhaustiveCheck: never = request.taskType;
      throw new Error(`Unhandled task type: ${String(exhaustiveCheck)}`);
    }
  }
}
