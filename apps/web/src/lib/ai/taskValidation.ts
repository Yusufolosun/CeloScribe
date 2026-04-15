import type { TaskType } from './taskTypes';
import { TASK_LIMITS } from './taskTypes';

export function isSupportedTaskType(taskType: string | undefined): taskType is TaskType {
  return Boolean(taskType && Object.prototype.hasOwnProperty.call(TASK_LIMITS, taskType));
}
