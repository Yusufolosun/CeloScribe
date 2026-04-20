'use client';

import { useEffect, useState } from 'react';

interface TranslateResultProps {
  output: string | null | undefined;
  originalPrompt?: string | undefined;
  targetLanguage?: string | undefined;
}

function ResultBlock({
  label,
  value,
  onCopy,
  copyLabel,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copyLabel: string;
}) {
  return (
    <article className="translation-block">
      <div className="translation-block__header">
        <p className="result-card__eyebrow">{label}</p>
        <button
          className="btn btn--secondary result-card__copy"
          type="button"
          onClick={onCopy}
          disabled={!value.trim()}
        >
          {copyLabel}
        </button>
      </div>
      <div
        className={`translation-block__body${value.trim() ? '' : ' translation-block__body--empty'}`}
      >
        {value.trim() ? (
          <p className="translation-block__text">{value}</p>
        ) : (
          <p className="result-card__empty">No content available.</p>
        )}
      </div>
    </article>
  );
}

export function TranslateResult({ output, originalPrompt, targetLanguage }: TranslateResultProps) {
  const [sourceCopyState, setSourceCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [resultCopyState, setResultCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  const sourceText = originalPrompt?.trim() ?? '';
  const translatedText = output?.trim() ?? '';
  const languageLabel = targetLanguage?.trim();
  const languageSummary = languageLabel
    ? `Target language: ${languageLabel}`
    : 'Target language unavailable';

  useEffect(() => {
    if (sourceCopyState !== 'copied') {
      return;
    }

    const timeoutId = window.setTimeout(() => setSourceCopyState('idle'), 1500);
    return () => window.clearTimeout(timeoutId);
  }, [sourceCopyState]);

  useEffect(() => {
    if (resultCopyState !== 'copied') {
      return;
    }

    const timeoutId = window.setTimeout(() => setResultCopyState('idle'), 1500);
    return () => window.clearTimeout(timeoutId);
  }, [resultCopyState]);

  async function copyText(text: string, setState: (state: 'idle' | 'copied' | 'error') => void) {
    if (!text || !navigator.clipboard?.writeText) {
      setState('error');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('error');
    }
  }

  const sourceCopyLabel =
    sourceCopyState === 'copied'
      ? 'Copied'
      : sourceCopyState === 'error'
        ? 'Copy failed'
        : 'Copy source';
  const resultCopyLabel =
    resultCopyState === 'copied'
      ? 'Copied'
      : resultCopyState === 'error'
        ? 'Copy failed'
        : 'Copy translation';

  return (
    <section className="result-card" aria-label="Translation result">
      <div className="result-card__header result-card__header--stacked">
        <div>
          <p className="result-card__eyebrow">Translation output</p>
          <p className="result-card__meta">{languageSummary}</p>
        </div>
      </div>

      <div className="translation-grid">
        <ResultBlock
          label="Source"
          value={sourceText}
          onCopy={() => void copyText(sourceText, setSourceCopyState)}
          copyLabel={sourceCopyLabel}
        />
        <ResultBlock
          label="Translation"
          value={translatedText}
          onCopy={() => void copyText(translatedText, setResultCopyState)}
          copyLabel={resultCopyLabel}
        />
      </div>
    </section>
  );
}
