'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

interface ImageResultProps {
  imageUrl: string | null | undefined;
  prompt?: string | undefined;
}

function buildDownloadName(prompt: string, imageUrl: string) {
  const promptSlug = prompt
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);

  const [imagePath] = imageUrl.split('?');
  const urlSlug = (imagePath || '')
    .split('/')
    .filter(Boolean)
    .pop()
    ?.replace(/\.[a-z0-9]+$/i, '');

  return `${promptSlug || urlSlug || 'celoscribe-image'}.png`;
}

export function ImageResult({ imageUrl, prompt }: ImageResultProps) {
  const [loadFailed, setLoadFailed] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  const src = imageUrl?.trim() ?? '';
  const hasImage = src.length > 0 && !loadFailed;
  const altText = prompt?.trim()
    ? `Generated image for: ${prompt.trim()}`
    : 'Generated image result';
  const downloadName = useMemo(
    () => buildDownloadName(prompt ?? '', src || 'image'),
    [prompt, src]
  );

  useEffect(() => {
    if (copyState !== 'copied') {
      return;
    }

    const timeoutId = window.setTimeout(() => setCopyState('idle'), 1500);
    return () => window.clearTimeout(timeoutId);
  }, [copyState]);

  async function handleCopyUrl() {
    if (!src || !navigator.clipboard?.writeText) {
      setCopyState('error');
      return;
    }

    try {
      await navigator.clipboard.writeText(src);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }
  }

  const copyLabel =
    copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Copy failed' : 'Copy URL';

  return (
    <section className="result-card" aria-label="Image result">
      <div className="result-card__header">
        <div>
          <p className="result-card__eyebrow">Image output</p>
          <p className="result-card__meta">Use the download link to save the generated asset.</p>
        </div>

        <div className="result-card__actions">
          <button
            className="btn btn--secondary result-card__copy"
            type="button"
            onClick={handleCopyUrl}
            disabled={!src}
          >
            {copyLabel}
          </button>
          <a
            className="btn btn--primary result-card__download"
            href={src || '#'}
            download={downloadName}
            aria-disabled={!src}
            onClick={(event) => {
              if (!src) event.preventDefault();
            }}
          >
            Download
          </a>
        </div>
      </div>

      <div className="result-image" aria-live="polite">
        {hasImage ? (
          <Image
            src={src}
            alt={altText}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, 640px"
            className="result-image__media"
            onError={() => setLoadFailed(true)}
            priority={false}
          />
        ) : (
          <div className="result-image__fallback" role="img" aria-label={altText}>
            <p className="result-image__fallback-title">Image unavailable</p>
            <p className="result-image__fallback-text">
              {src
                ? 'The image failed to load. You can try the download link if it is still available.'
                : 'No image URL was returned.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
