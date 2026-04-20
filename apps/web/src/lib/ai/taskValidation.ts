import type { TaskType } from './taskTypes';
import { TASK_LIMITS } from './taskTypes';

export function isSupportedTaskType(taskType: string | undefined): taskType is TaskType {
  return Boolean(taskType && Object.prototype.hasOwnProperty.call(TASK_LIMITS, taskType));
}

export function getPromptLimitError(
  taskType: TaskType | null | undefined,
  prompt: string
): string | null {
  if (!taskType) {
    return null;
  }

  const trimmedPrompt = prompt.trim();

  if (!trimmedPrompt) {
    return null;
  }

  const maxInputChars = TASK_LIMITS[taskType].maxInputChars;

  if (trimmedPrompt.length <= maxInputChars) {
    return null;
  }

  return `Prompt too long. Max ${maxInputChars} characters for ${taskType}.`;
}
