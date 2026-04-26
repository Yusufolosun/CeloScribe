'use client';

import type { TaskType } from '@/lib/ai/taskTypes';
import { TASK_PRICE_DISPLAY } from '@/lib/payment/taskPrices';

interface PaymentModalProps {
  taskType: TaskType;
  targetLanguage?: string;
  paymentState: 'idle' | 'approving' | 'paying' | 'confirming' | 'done' | 'error';
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const STATE_MESSAGES: Record<PaymentModalProps['paymentState'], string> = {
  idle: 'Review the payment amount and confirm to proceed',
  approving: 'Authorizing cUSD spending in your wallet...',
  paying: 'Sending payment transaction to the blockchain...',
  confirming: 'Waiting for blockchain confirmation (1-2 blocks)...',
  done: 'Payment confirmed and recorded on-chain ✓',
  error: 'Payment failed. Please try again or contact support.',
};

export function PaymentModal({
  taskType,
  targetLanguage,
  paymentState,
  error,
  onConfirm,
  onCancel,
}: PaymentModalProps) {
  const isProcessing = ['approving', 'paying', 'confirming'].includes(paymentState);
  const price = TASK_PRICE_DISPLAY[taskType];

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Payment confirmation"
    >
      <div className="modal">
        <h2 className="modal__title">Confirm Payment</h2>
        <div style={{ marginTop: '0.65rem' }}>
          <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.85rem' }}>Amount</p>
          <p className="modal__amount">
            {price} <span className="modal__currency">cUSD</span>
          </p>
        </div>
        {targetLanguage?.trim() && (
          <p className="modal__detail">Target language: {targetLanguage.trim()}</p>
        )}
        <p className="modal__status">{STATE_MESSAGES[paymentState]}</p>
        {error && (
          <p className="modal__error" role="alert">
            {error}
          </p>
        )}
        <div className="modal__actions">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="btn btn--secondary"
            type="button"
            aria-label="Cancel payment"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing || paymentState === 'done'}
            className="btn btn--primary"
            type="button"
            aria-label={`Pay ${price} cUSD to proceed`}
          >
            {isProcessing ? 'Processing...' : `Pay ${price} cUSD`}
          </button>
        </div>
      </div>
    </div>
  );
}
