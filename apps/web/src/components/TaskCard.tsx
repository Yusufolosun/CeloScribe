'use client';

import type { ButtonHTMLAttributes } from 'react';

import type { TaskType } from '@/lib/ai/taskTypes';
import { TASK_PRICE_DISPLAY } from '@/lib/payment/taskPrices';

const TASK_META: Record<
  TaskType,
  { icon: string; name: string; description: string; maxLen: string }
> = {
  TEXT_SHORT: {
    icon: '✍️',
    name: 'Short Text',
    description: 'Write emails, captions, summaries, and tweets up to 300 words.',
    maxLen: '300 words',
  },
  TEXT_LONG: {
    icon: '📄',
    name: 'Long Text',
    description: 'Compose articles, proposals, essays, and reports up to 1500 words.',
    maxLen: '1500 words',
  },
  IMAGE: {
    icon: '🖼️',
    name: 'Image Generation',
    description: 'Generate high-quality images from detailed descriptions and prompts.',
    maxLen: '1000 chars',
  },
  TRANSLATE: {
    icon: '🌍',
    name: 'Translate',
    description: 'Translate text into any language with accuracy up to 1500 characters.',
    maxLen: '1500 chars',
  },
};

interface TaskCardProps {
  taskType: TaskType;
  selected: boolean;
  onSelect: (type: TaskType) => void;
  disabled?: boolean;
}

export function TaskCard({ taskType, selected, onSelect, disabled = false }: TaskCardProps) {
  const meta = TASK_META[taskType];
  const price = TASK_PRICE_DISPLAY[taskType];

  const buttonProps: ButtonHTMLAttributes<HTMLButtonElement> = {
    'aria-pressed': selected,
    'aria-label': `${meta.name} task: ${meta.description} Cost: ${price} cUSD`,
    className: `task-card ${selected ? 'task-card--selected' : ''}`,
    disabled,
    onClick: () => onSelect(taskType),
    type: 'button',
  };

  return (
    <button {...buttonProps}>
      <span className="task-card__icon" aria-hidden="true">
        {meta.icon}
      </span>
      <div className="task-card__body">
        <span className="task-card__name">{meta.name}</span>
        <span className="task-card__desc">{meta.description}</span>
      </div>
      <span className="task-card__meta">
        <span className="task-card__price">{price}</span>
        <span className="task-card__limit">{meta.maxLen}</span>
      </span>
    </button>
  );
}
