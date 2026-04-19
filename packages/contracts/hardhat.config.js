require('@nomicfoundation/hardhat-toolbox');
require('@nomicfoundation/hardhat-verify');

// Load root .env first (template defaults), then .env.local (real secrets override).
// dotenv does NOT override existing env vars, so order matters: local wins.
require('dotenv').config({ path: '../../.env' });
require('dotenv').config({ path: '../../.env.local', override: true });

// ── TypeScript support for deploy.ts ─────────────────────────────────────────
// Use the local ts-node in contracts/node_modules rather than scanning the
// pnpm global store, which is fragile across version changes.
require('ts-node').register({ transpileOnly: true });

const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY?.trim();

const isCompileOrTest =
  process.argv.includes('compile') ||
  process.argv.includes('test') ||
  process.argv.includes('node');

if (!DEPLOYER_KEY && !isCompileOrTest && process.env.NODE_ENV !== 'test') {
  console.warn(
    '\n⚠  WARNING: DEPLOYER_PRIVATE_KEY not set.\n' +
    '   Set it in .env.local (never in .env — that file is committed).\n' +
    '   Deployment will fail without it.\n'
  );
}

/** @type {import('hardhat/config').HardhatUserConfig} */
const config = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      // viaIR reduces stack pressure and enables cross-function optimisations.
      viaIR: true,
    },
  },

  networks: {
    hardhat: {
      // Local in-process network — no accounts needed.
    },

    alfajores: {
      url: process.env.ALFAJORES_RPC_URL || 'https://alfajores-forno.celo-testnet.org',
      chainId: 44787,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      // Celo supports EIP-1559; 'auto' lets the node estimate correctly.
      gasPrice: 'auto',
      gas: 'auto',
      // Wait for at least 2 confirmations before resolving waitForDeployment().
      timeout: 120_000,
    },

    celo: {
      url: process.env.CELO_RPC_URL || process.env.NEXT_PUBLIC_CELO_RPC_URL || 'https://forno.celo.org',
      chainId: 42220,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      gasPrice: 'auto',
      gas: 'auto',
      timeout: 180_000,
    },
  },

  etherscan: {
    // Etherscan V2: single API key string (not per-network object).
    apiKey: process.env.CELOSCAN_API_KEY ?? '',
    customChains: [
      {
        network: 'alfajores',
        chainId: 44787,
        urls: {
          apiURL: 'https://api-alfajores.celoscan.io/api',
          browserURL: 'https://alfajores.celoscan.io',
        },
      },
      {
        network: 'celo',
        chainId: 42220,
        urls: {
          apiURL: 'https://api.celoscan.io/api',
          browserURL: 'https://celoscan.io',
        },
      },
    ],
  },

  // Sourcify as a secondary open-source verification target.
  sourcify: {
    enabled: true,
  },
};

module.exports = config;