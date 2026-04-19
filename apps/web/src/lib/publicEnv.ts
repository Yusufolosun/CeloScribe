import { type Address, getAddress, isAddress } from 'viem';

const PUBLIC_ENV = {
  NEXT_PUBLIC_CELOSCRIBE_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CELOSCRIBE_CONTRACT_ADDRESS,
  NEXT_PUBLIC_CELO_RPC_URL: process.env.NEXT_PUBLIC_CELO_RPC_URL,
  NEXT_PUBLIC_THIRDWEB_CLIENT_ID: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
} as const;

type PublicEnvName = keyof typeof PUBLIC_ENV;

export function requirePublicEnv(name: PublicEnvName): string {
  const value = PUBLIC_ENV[name];

  if (!value || value.trim() === '') {
    throw new Error(
      `[env] Missing required public environment variable: ${name}. ` +
        `Check .env.local and ensure it is set.`
    );
  }

  return value;
}

export function requirePublicAddressEnv(name: 'NEXT_PUBLIC_CELOSCRIBE_CONTRACT_ADDRESS'): Address {
  const value = requirePublicEnv(name);

  if (!isAddress(value)) {
    throw new Error(
      `[env] Invalid public address environment variable: ${name}. ` +
        `Expected a checksummed Celo address, received: ${value}`
    );
  }

  return getAddress(value);
}

export function optionalPublicEnv(name: PublicEnvName, fallback: string): string {
  return PUBLIC_ENV[name] ?? fallback;
}
