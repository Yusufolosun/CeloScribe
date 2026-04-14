'use client';

import { useSyncExternalStore } from 'react';

import type { Address } from 'viem';

import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import type { TaskType } from '@/lib/ai/taskTypes';

const TASK_META: Record<TaskType, { icon: string; label: string }> = {
  TEXT_SHORT: { icon: '✍️', label: 'Short Text' },
  TEXT_LONG: { icon: '📄', label: 'Long Text' },
  IMAGE: { icon: '🖼️', label: 'Image' },
  TRANSLATE: { icon: '🌍', label: 'Translate' },
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

interface TransactionHistoryProps {
  userAddress: Address | undefined;
}

function formatTxLink(hash: string) {
  return `https://celoscan.io/tx/${hash}`;
}

function formatTransactionDate(timestamp?: number) {
  if (!timestamp) {
    return 'Date unavailable';
  }

  return dateFormatter.format(new Date(timestamp * 1000));
}

function HistorySkeleton() {
  return (
    <div className="transaction-history__skeleton" aria-hidden="true">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="transaction-history__item transaction-history__item--skeleton">
          <span className="transaction-history__icon transaction-history__icon--skeleton" />
          <div className="transaction-history__body transaction-history__body--skeleton">
            <span className="transaction-history__line transaction-history__line--title" />
            <span className="transaction-history__line transaction-history__line--meta" />
          </div>
          <div className="transaction-history__meta transaction-history__meta--skeleton">
            <span className="transaction-history__line transaction-history__line--price" />
            <span className="transaction-history__line transaction-history__line--date" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TransactionHistory({ userAddress }: TransactionHistoryProps) {
  const { history, isLoading, error } = useTransactionHistory(userAddress);
  const isConnected = Boolean(userAddress);
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!isMounted) {
    return (
      <section className="transaction-history" aria-labelledby="historyTitle">
        <div className="transaction-history__header">
          <h2 id="historyTitle" className="transaction-history__title">
            Transaction history
          </h2>
          <p className="transaction-history__subtitle">
            PaymentReceived events are read directly from Celo, so the chain remains the source of
            truth.
          </p>
        </div>

        <HistorySkeleton />
      </section>
    );
  }

  return (
    <section className="transaction-history" aria-labelledby="historyTitle">
      <div className="transaction-history__header">
        <h2 id="historyTitle" className="transaction-history__title">
          Transaction history
        </h2>
        <p className="transaction-history__subtitle">
          PaymentReceived events are read directly from Celo, so the chain remains the source of
          truth.
        </p>
      </div>

      {isLoading ? (
        <HistorySkeleton />
      ) : error ? (
        <p className="transaction-history__error" role="alert">
          {error}
        </p>
      ) : history.length > 0 ? (
        <ul className="transaction-history__list">
          {history.map((entry) => {
            const meta = TASK_META[entry.taskType];

            return (
              <li key={entry.txHash} className="transaction-history__item">
                <span className="transaction-history__icon" aria-hidden="true">
                  {meta.icon}
                </span>
                <div className="transaction-history__body">
                  <p className="transaction-history__task">{meta.label}</p>
                  <p className="transaction-history__hash">
                    <a
                      className="transaction-history__link"
                      href={formatTxLink(entry.txHash)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {entry.txHash.slice(0, 10)}...{entry.txHash.slice(-8)}
                    </a>
                  </p>
                </div>
                <div className="transaction-history__meta">
                  <span className="transaction-history__price">{entry.amount} cUSD</span>
                  <span className="transaction-history__date">
                    {formatTransactionDate(entry.timestamp)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="transaction-history__empty">
          <p className="transaction-history__empty-title">
            {isConnected ? 'No payments found yet.' : 'Connect your wallet to view history.'}
          </p>
          <p className="transaction-history__empty-copy">
            {isConnected
              ? 'Once you pay for a task, the matching PaymentReceived event will appear here.'
              : 'Switch to the connected wallet first, then open the History tab.'}
          </p>
        </div>
      )}
    </section>
  );
}
