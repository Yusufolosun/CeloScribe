import { type Page, expect, test } from '@playwright/test';

import { MOCK_ADDRESS, installMockWallet } from './fixtures/mockWallet';

const mockTaskResult = {
  taskType: 'TEXT_SHORT' as const,
  output: 'A concise generated response for the test prompt.',
  provider: 'mock-provider',
  processingMs: 42,
};

async function mockFornoRpc(page: Page) {
  let transactionCounter = 0;

  await page.route('**://forno.celo.org/**', async (route) => {
    const request = route.request();
    const payload = request.postDataJSON() as
      | { id?: number; method?: string; params?: unknown[] }
      | undefined;

    const method = payload?.method ?? '';
    const transactionHash = `0x${String(++transactionCounter).padStart(64, '0')}`;
    const baseResponse = {
      id: payload?.id ?? 1,
      jsonrpc: '2.0',
    };

    switch (method) {
      case 'eth_chainId':
        await route.fulfill({
          json: { ...baseResponse, result: '0xa4ec' },
        });
        return;
      case 'net_version':
        await route.fulfill({
          json: { ...baseResponse, result: '42220' },
        });
        return;
      case 'eth_getLogs':
        await route.fulfill({
          json: { ...baseResponse, result: [] },
        });
        return;
      case 'eth_getTransactionReceipt':
        const requestedHash =
          typeof payload?.params?.[0] === 'string' ? payload.params[0] : transactionHash;

        await route.fulfill({
          json: {
            ...baseResponse,
            result: {
              blockHash: `0x${'2'.repeat(64)}`,
              blockNumber: '0x1',
              contractAddress: null,
              cumulativeGasUsed: '0x5208',
              effectiveGasPrice: '0x3b9aca00',
              from: MOCK_ADDRESS,
              gasUsed: '0x5208',
              logs: [],
              logsBloom: `0x${'0'.repeat(512)}`,
              status: '0x1',
              to: MOCK_ADDRESS,
              transactionHash: requestedHash,
              transactionIndex: '0x0',
              type: '0x2',
            },
          },
        });
        return;
      case 'eth_blockNumber':
        await route.fulfill({
          json: { ...baseResponse, result: '0x1' },
        });
        return;
      default:
        await route.fulfill({
          json: { ...baseResponse, result: null },
        });
    }
  });
}

async function mockTaskGeneration(page: Page) {
  await page.route('**/api/task/generate', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      json: mockTaskResult,
    });
  });
}

async function mockTranslateGeneration(page: Page) {
  await page.route('**/api/task/generate', async (route) => {
    const payload = route.request().postDataJSON() as {
      prompt?: string;
      taskType?: string;
      targetLanguage?: string;
    };

    expect(payload.taskType).toBe('TRANSLATE');
    expect(payload.targetLanguage).toBe('Yoruba');

    await route.fulfill({
      contentType: 'application/json',
      json: {
        taskType: 'TRANSLATE' as const,
        output: 'A translated response for the test prompt.',
        provider: 'mock-provider',
        processingMs: 42,
      },
    });
  });
}

test('page loads and shows task cards', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /choose a task, pay in cUSD/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /short text, \$0\.01 cUSD/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /long text, \$0\.05 cUSD/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /image, \$0\.08 cUSD/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /translate, \$0\.02 cUSD/i })).toBeVisible();
});

test('wallet banner shows connect wallet when disconnected', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('button', { name: 'Connect wallet' })).toBeVisible();
});

test('wallet banner shows the connected wallet address after mock injection', async ({ page }) => {
  await installMockWallet(page);
  await mockFornoRpc(page);
  await page.goto('/');

  await expect(page.locator('.wallet-banner__badge')).toHaveText('MiniPay');

  await expect(page.getByText('0x1234...7890')).toBeVisible();
});

test('clicking a task card enables the prompt input', async ({ page }) => {
  await installMockWallet(page);
  await mockFornoRpc(page);
  await page.goto('/');

  await expect(page.locator('.wallet-banner__badge')).toHaveText('MiniPay');
  await page.getByRole('button', { name: /short text, \$0\.01 cUSD/i }).click();

  const prompt = page.getByLabel('Task prompt');
  await expect(prompt).toBeEnabled();
});

test('submitting a prompt without wallet shows an error', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: /short text, \$0\.01 cUSD/i }).click();
  const prompt = page.getByLabel('Task prompt');
  await prompt.fill('Write a short product tagline.');
  await page.getByRole('button', { name: 'Pay and generate' }).click();

  await expect(page.locator('.prompt-panel__error')).toHaveText('Connect your wallet to continue.');
});

test('blocks payment when the prompt exceeds the selected task limit', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: /short text, \$0\.01 cUSD/i }).click();

  const prompt = page.getByLabel('Task prompt');
  const payButton = page.getByRole('button', { name: 'Pay and generate' });

  await prompt.fill('a'.repeat(501));

  await expect(page.locator('.prompt-panel__error')).toHaveText(
    'Prompt too long. Max 500 characters for TEXT_SHORT.'
  );
  await expect(payButton).toBeDisabled();

  await prompt.fill('a'.repeat(500));

  await expect(page.locator('.prompt-panel__error')).toHaveCount(0);
  await expect(payButton).toBeEnabled();
});

test('payment modal shows the correct price for the selected task type', async ({ page }) => {
  await installMockWallet(page);
  await mockFornoRpc(page);
  await page.goto('/');

  await expect(page.locator('.wallet-banner__badge')).toHaveText('MiniPay');
  await page.getByRole('button', { name: /image, \$0\.08 cUSD/i }).click();
  await page.getByLabel('Task prompt').fill('Create a neon-lit robot poster.');
  await page.getByRole('button', { name: 'Pay and generate' }).click();

  await expect(page.getByRole('dialog', { name: 'Payment confirmation' })).toBeVisible();
  await expect(page.locator('.modal__amount')).toHaveText(/\$0\.08\s+cUSD/);
});

test('translate flow requires a target language and shows it end to end', async ({ page }) => {
  await installMockWallet(page);
  await mockFornoRpc(page);
  await mockTranslateGeneration(page);
  await page.goto('/');

  await expect(page.locator('.wallet-banner__badge')).toHaveText('MiniPay');
  await page.getByRole('button', { name: /translate, \$0\.02 cUSD/i }).click();
  await page.getByLabel('Task prompt').fill('Translate this phrase for me.');

  const payButton = page.getByRole('button', { name: 'Pay and generate' });
  await expect(payButton).toBeDisabled();

  await page.locator('#targetLanguage').selectOption('Yoruba');
  await expect(payButton).toBeEnabled();

  await payButton.click();
  await expect(page.getByRole('dialog', { name: 'Payment confirmation' })).toContainText(
    'Target language: Yoruba'
  );

  await page.getByRole('button', { name: /pay \$0\.02 cUSD/i }).click();

  await expect(page.getByText('Translation output', { exact: true })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText('Target language: Yoruba')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('A translated response for the test prompt.')).toBeVisible({
    timeout: 15_000,
  });
});

test('health endpoint returns 200', async ({ page }) => {
  const response = await page.request.get('/api/health');

  await expect(response.status()).toBe(200);
});

test('full connected flow renders the generated result', async ({ page }) => {
  await installMockWallet(page);
  await mockFornoRpc(page);
  await mockTaskGeneration(page);
  await page.goto('/');

  await expect(page.locator('.wallet-banner__badge')).toHaveText('MiniPay');
  await page.getByRole('button', { name: /short text, \$0\.01 cUSD/i }).click();
  await page.getByLabel('Task prompt').fill('Summarize the benefits of mobile-first payments.');
  await page.getByRole('button', { name: 'Pay and generate' }).click();
  await page.getByRole('button', { name: /pay \$0\.01 cUSD/i }).click();

  await expect(page.getByText('Text output', { exact: true })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('A concise generated response for the test prompt.')).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByLabel(/word count/i)).toBeVisible({ timeout: 15_000 });
});
