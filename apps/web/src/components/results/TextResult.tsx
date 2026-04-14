'use client';

import { useEffect, useMemo, useState } from 'react';

interface TextResultProps {
  output: string | null | undefined;
  provider?: string;
}

function countWords(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return text.trim() ? words.length : 0;
}

function formatWordCount(wordCount: number) {
  return `${wordCount} word${wordCount === 1 ? '' : 's'}`;
}

export function TextResult({ output, provider }: TextResultProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  const text = output?.trim() ?? '';
  const wordCount = useMemo(() => countWords(text), [text]);
  const hasText = text.length > 0;

  useEffect(() => {
    if (copyState !== 'copied') {
      return;
    }

    const timeoutId = window.setTimeout(() => setCopyState('idle'), 1500);
    return () => window.clearTimeout(timeoutId);
  }, [copyState]);

  async function handleCopy() {
    if (!hasText || !navigator.clipboard?.writeText) {
      setCopyState('error');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }
  }

  const copyLabel =
    copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Copy failed' : 'Copy';

  return (
    <section className="result-card" aria-label="Text result">
      <div className="result-card__header">
        <div>
          <p className="result-card__eyebrow">Text output</p>
          <p className="result-card__meta">
            {provider ? `Provider: ${provider}` : 'Ready to copy or review.'}
          </p>
        </div>
        <div className="result-card__actions">
          <span className="result-card__count" aria-label={`Word count: ${wordCount}`}>
            {formatWordCount(wordCount)}
          </span>
          <button
            className="btn btn--secondary result-card__copy"
            type="button"
            onClick={handleCopy}
            disabled={!hasText}
          >
            {copyLabel}
          </button>
        </div>
      </div>

      <div className={`result-card__body${hasText ? '' : ' result-card__body--empty'}`}>
        {hasText ? (
          <pre className="result-card__text">{text}</pre>
        ) : (
          <p className="result-card__empty">No text output was returned.</p>
        )}
      </div>
    </section>
  );
}
