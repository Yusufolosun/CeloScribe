'use client';

import type { TaskResult, TaskType } from '@/lib/ai/taskTypes';

import { ImageResult } from './results/ImageResult';
import { TextResult } from './results/TextResult';
import { TranslateResult } from './results/TranslateResult';
import { ImageSkeleton } from './skeletons/ImageSkeleton';
import { TextSkeleton } from './skeletons/TextSkeleton';

interface ResultContainerProps {
  result: TaskResult | null;
  isLoading: boolean;
  taskType?: TaskType | null;
  prompt?: string;
  targetLanguage?: string;
}

function renderLoadingState(taskType?: TaskType | null) {
  switch (taskType) {
    case 'IMAGE':
      return <ImageSkeleton />;
    case 'TRANSLATE':
      return (
        <div className="translation-grid" aria-label="Loading translation result">
          <article className="translation-block">
            <div className="translation-block__header">
              <span className="text-skeleton__label">Source</span>
            </div>
            <TextSkeleton lines={4} />
          </article>
          <article className="translation-block">
            <div className="translation-block__header">
              <span className="text-skeleton__label">Translation</span>
            </div>
            <TextSkeleton lines={4} />
          </article>
        </div>
      );
    case 'TEXT_SHORT':
      return <TextSkeleton lines={3} />;
    case 'TEXT_LONG':
      return <TextSkeleton lines={6} />;
    default:
      return <TextSkeleton lines={4} />;
  }
}

export function ResultContainer({
  result,
  isLoading,
  taskType,
  prompt,
  targetLanguage,
}: ResultContainerProps) {
  if (isLoading) {
    return (
      <section className="result-panel" aria-busy="true" aria-label="Generating result...">
        {renderLoadingState(taskType)}
      </section>
    );
  }

  if (!result) return null;

  switch (result.taskType) {
    case 'TEXT_SHORT':
    case 'TEXT_LONG':
      return (
        <section className="result-panel">
          <TextResult output={result.output} provider={result.provider} />
        </section>
      );
    case 'IMAGE':
      return (
        <section className="result-panel">
          <ImageResult imageUrl={result.output} prompt={prompt} />
        </section>
      );
    case 'TRANSLATE':
      return (
        <section className="result-panel">
          <TranslateResult
            output={result.output}
            originalPrompt={prompt}
            targetLanguage={targetLanguage}
          />
        </section>
      );
    default: {
      const exhaustive: never = result.taskType;
      return <p>Unknown result type: {String(exhaustive)}</p>;
    }
  }
}
