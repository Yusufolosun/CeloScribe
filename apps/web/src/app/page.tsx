'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { PaymentModal } from '@/components/PaymentModal';
import { ResultContainer } from '@/components/ResultContainer';
import { TaskCard } from '@/components/TaskCard';
import { TransactionHistory } from '@/components/TransactionHistory';
import { WalletBanner } from '@/components/WalletBanner';
import { useMiniPay } from '@/hooks/useMiniPay';
import { useTaskPayment } from '@/hooks/useTaskPayment';
import type { TaskResult } from '@/lib/ai/taskTypes';
import type { TaskType } from '@/lib/ai/taskTypes';
import { TASK_LIMITS } from '@/lib/ai/taskTypes';
import { getPromptLimitError } from '@/lib/ai/taskValidation';
import { TASK_PRICE_DISPLAY } from '@/lib/payment/taskPrices';

const TASK_TYPES: TaskType[] = ['TEXT_SHORT', 'TEXT_LONG', 'IMAGE', 'TRANSLATE'];

export default function Home() {
  const { address, isConnected, isOnCelo } = useMiniPay();
  const {
    pay,
    state: paymentState,
    txHash,
    error: paymentError,
    reset: resetPayment,
  } = useTaskPayment();
  const lastGeneratedTxHash = useRef<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<TaskResult | null>(null);
  const [resultError, setResultError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedLimit = useMemo(() => {
    if (!selectedTask) return null;

    return TASK_LIMITS[selectedTask].maxInputChars;
  }, [selectedTask]);

  const promptValidationError = useMemo(
    () => getPromptLimitError(selectedTask, prompt),
    [prompt, selectedTask]
  );

  const canOpenPayment = Boolean(selectedTask && prompt.trim() && !promptValidationError);

  useEffect(() => {
    if (paymentState !== 'done' || !selectedTask || !txHash || !address) {
      return;
    }

    if (lastGeneratedTxHash.current === txHash) {
      return;
    }

    lastGeneratedTxHash.current = txHash;

    let isActive = true;

    async function generateTaskOutput() {
      setIsGenerating(true);
      setResultError(null);
      setIsModalOpen(false);

      try {
        const response = await fetch('/api/task/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            taskType: selectedTask,
            txHash,
            userAddress: address,
          }),
        });

        const payload = (await response.json()) as { error?: string } | TaskResult;

        if (!response.ok) {
          const message =
            'error' in payload && payload.error ? payload.error : 'Task generation failed.';
          throw new Error(message);
        }

        if (!('output' in payload)) {
          throw new Error('Task generation response was incomplete.');
        }

        if (!isActive) {
          return;
        }

        setResult(payload);
        setIsModalOpen(false);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setResultError(error instanceof Error ? error.message : 'Task generation failed.');
      } finally {
        if (isActive) {
          setIsGenerating(false);
        }
      }
    }

    void generateTaskOutput();

    return () => {
      isActive = false;
    };
  }, [address, paymentState, prompt, selectedTask, txHash]);

  function handleSelectTask(taskType: TaskType) {
    lastGeneratedTxHash.current = null;
    setSelectedTask(taskType);
    setResult(null);
    setResultError(null);
    setIsModalOpen(false);
    resetPayment();
  }

  function handleOpenPayment() {
    if (!selectedTask || !prompt.trim() || promptValidationError) {
      return;
    }

    if (!isConnected) {
      setResultError('Connect your wallet to continue.');
      return;
    }

    if (!isOnCelo) {
      setResultError('Switch to Celo mainnet to continue.');
      return;
    }

    lastGeneratedTxHash.current = null;
    setResult(null);
    setResultError(null);
    setIsModalOpen(true);
  }

  async function handleConfirmPayment() {
    if (!selectedTask) {
      return;
    }

    await pay(selectedTask);
  }

  function handleCancelPayment() {
    setIsModalOpen(false);
    resetPayment();
  }

  return (
    <main className="task-flow">
      <div className="task-flow__shell">
        <section className="task-flow__hero" aria-labelledby="celoScribeTitle">
          <div className="task-flow__eyebrow">CeloScribe MiniApp</div>
          <h1 id="celoScribeTitle" className="task-flow__title">
            Choose a task, pay in cUSD, and get the result in one flow.
          </h1>
          <p className="task-flow__subtitle">
            Built for the MiniPay browser first: compact spacing, readable type, and no external
            font runtime dependencies.
          </p>
        </section>

        <div className="mt-4 flex items-center justify-between">
          <WalletBanner />
        </div>

        <div className="task-tabs" role="tablist" aria-label="Main views">
          <button
            className={`task-tabs__button ${activeTab === 'generate' ? 'task-tabs__button--active' : ''}`}
            type="button"
            role="tab"
            aria-selected={activeTab === 'generate'}
            aria-controls="generateTabPanel"
            onClick={() => setActiveTab('generate')}
          >
            Generate
          </button>
          <button
            className={`task-tabs__button ${activeTab === 'history' ? 'task-tabs__button--active' : ''}`}
            type="button"
            role="tab"
            aria-selected={activeTab === 'history'}
            aria-controls="historyTabPanel"
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        <div
          className="mt-4"
          role="tabpanel"
          id="generateTabPanel"
          hidden={activeTab !== 'generate'}
        >
          <section className="task-flow__section" aria-labelledby="taskSelectionTitle">
            <h2 id="taskSelectionTitle" className="task-flow__section-title">
              Select a task
            </h2>
            <div className="task-flow__grid">
              {TASK_TYPES.map((taskType) => (
                <TaskCard
                  key={taskType}
                  taskType={taskType}
                  selected={selectedTask === taskType}
                  onSelect={handleSelectTask}
                />
              ))}
            </div>
          </section>

          <section className="prompt-panel mt-4" aria-labelledby="promptTitle">
            <div>
              <p id="promptTitle" className="prompt-panel__label">
                Your prompt
              </p>
              <p className="prompt-panel__hint">
                {selectedTask
                  ? `Selected ${TASK_PRICE_DISPLAY[selectedTask]} cUSD task. Max input ${selectedLimit ?? 0} characters.`
                  : 'Select a task before writing your prompt.'}
              </p>
            </div>

            <label className="sr-only" htmlFor="taskPrompt">
              Task prompt
            </label>
            <textarea
              id="taskPrompt"
              className="prompt-panel__field"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Describe what you want CeloScribe to generate..."
              disabled={!selectedTask}
              aria-describedby="promptTitle"
              aria-invalid={Boolean(resultError)}
            />

            {resultError && (
              <p className="prompt-panel__error" role="alert">
                {resultError}
              </p>
            )}

            <div className="prompt-panel__actions">
              <button
                className="btn btn--primary"
                type="button"
                onClick={handleOpenPayment}
                disabled={!canOpenPayment}
                aria-disabled={!canOpenPayment}
              >
                Pay and generate
              </button>
            </div>
          </section>

          <div className="mt-4">
            <ResultContainer
              result={result}
              isLoading={isGenerating}
              taskType={selectedTask}
              prompt={prompt}
            />
          </div>
        </div>

        <div className="mt-4" role="tabpanel" id="historyTabPanel" hidden={activeTab !== 'history'}>
          <TransactionHistory userAddress={address} />
        </div>

        {isModalOpen && selectedTask && (
          <PaymentModal
            taskType={selectedTask}
            paymentState={paymentState}
            error={paymentError}
            onConfirm={handleConfirmPayment}
            onCancel={handleCancelPayment}
          />
        )}
      </div>
    </main>
  );
}
