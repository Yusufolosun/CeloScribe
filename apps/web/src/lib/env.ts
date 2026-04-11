/**
 * Type-safe environment variable access.
 * This module validates all required server-side env vars at import time.
 * If any required variable is missing, the process throws immediately.
 *
 * NEVER import this file in client-side code.
 * NEVER expose DEEPSEEK_API_KEY, ANTHROPIC_API_KEY, or FAL_API_KEY to the browser.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(
      `[env] Missing required environment variable: ${name}. ` +
        `Check .env.local and ensure it is set.`
    );
  }
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const env = {
  // AI Providers
  DEEPSEEK_API_KEY: requireEnv('DEEPSEEK_API_KEY'),
  ANTHROPIC_API_KEY: requireEnv('ANTHROPIC_API_KEY'),
  FAL_API_KEY: requireEnv('FAL_API_KEY'),

  // Blockchain
  CELO_RPC_URL: optionalEnv('NEXT_PUBLIC_CELO_RPC_URL', 'https://forno.celo.org'),
  CONTRACT_ADDRESS: requireEnv('NEXT_PUBLIC_CELOSCRIBE_CONTRACT_ADDRESS'),

  // Thirdweb
  THIRDWEB_SECRET_KEY: requireEnv('THIRDWEB_SECRET_KEY'),

  // App
  NODE_ENV: optionalEnv('NODE_ENV', 'development'),
} as const;
