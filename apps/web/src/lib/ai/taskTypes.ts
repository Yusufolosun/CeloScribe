export const TASK_TYPES = {
  TEXT_SHORT: 'TEXT_SHORT',
  TEXT_LONG: 'TEXT_LONG',
  IMAGE: 'IMAGE',
  TRANSLATE: 'TRANSLATE',
} as const;

export type TaskType = keyof typeof TASK_TYPES;

export interface TaskRequest {
  taskType: TaskType;
  prompt: string;
  targetLanguage?: string;
}

export interface TaskResult {
  taskType: TaskType;
  output: string;
  provider: string;
  tokensUsed?: number;
  processingMs: number;
}

export const TASK_LIMITS = {
  TEXT_SHORT: { maxInputChars: 500, maxOutputTokens: 400 },
  TEXT_LONG: { maxInputChars: 2000, maxOutputTokens: 2000 },
  IMAGE: { maxInputChars: 1000, maxOutputTokens: 0 },
  TRANSLATE: { maxInputChars: 1500, maxOutputTokens: 1500 },
} as const;
