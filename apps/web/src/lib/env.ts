/**
 * Type-safe environment variable access.
 * This module validates required server-side env vars when they are first requested.
 * If any required variable is missing, the call site throws immediately.
 *
 * NEVER import this file in client-side code.
 * NEVER expose DEEPSEEK_API_KEY, ANTHROPIC_API_KEY, or FAL_API_KEY to the browser.
 */
import { type Address, getAddress, isAddress } from 'viem';

export interface ServerEnv {
  DEEPSEEK_API_KEY: string;
  ANTHROPIC_API_KEY: string | undefined;
  FAL_API_KEY: string;
  CELO_RPC_URL: string;
  CONTRACT_ADDRESS: Address;
  PAYMENT_MIN_CONFIRMATIONS: number | undefined;
  THIRDWEB_SECRET_KEY: string;
  NODE_ENV: string;
}

export type ServerEnvName = keyof ServerEnv;

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

function requireAddressEnv(name: string): Address {
  const value = requireEnv(name);

  if (!isAddress(value)) {
    throw new Error(`[env] Invalid address environment variable: ${name}. Received: ${value}`);
  }

  return getAddress(value);
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

function optionalNumberEnv(name: string): number | undefined {
  const value = process.env[name];

  if (!value || value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`[env] Invalid numeric environment variable: ${name}. Received: ${value}`);
  }

  return parsed;
}

function createServerEnv(): ServerEnv {
  return {
    // AI Providers
    DEEPSEEK_API_KEY: requireEnv('DEEPSEEK_API_KEY'),
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY?.trim() || undefined,
    FAL_API_KEY: requireEnv('FAL_API_KEY'),

    // Blockchain
    CELO_RPC_URL: optionalEnv('NEXT_PUBLIC_CELO_RPC_URL', 'https://forno.celo.org'),
    CONTRACT_ADDRESS: requireAddressEnv('NEXT_PUBLIC_CELOSCRIBE_CONTRACT_ADDRESS'),
    PAYMENT_MIN_CONFIRMATIONS: optionalNumberEnv('PAYMENT_MIN_CONFIRMATIONS'),

    // Thirdweb
    THIRDWEB_SECRET_KEY: requireEnv('THIRDWEB_SECRET_KEY'),

    // App
    NODE_ENV: optionalEnv('NODE_ENV', 'development'),
  };
}

let cachedEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (!cachedEnv) {
    cachedEnv = createServerEnv();
  }

  return cachedEnv;
}

export function resetServerEnvForTests(): void {
  cachedEnv = null;
}

export function hasServerEnv(name: ServerEnvName): boolean {
  const value = getServerEnv()[name];
  return typeof value === 'string' ? value.trim() !== '' : value !== undefined;
}
