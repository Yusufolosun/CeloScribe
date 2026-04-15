const fs = require('fs');
const path = require('path');

function registerTypeScriptSupport() {
  const pnpmStoreDir = path.resolve(__dirname, '../../node_modules/.pnpm');
  const tsNodeDir = fs
    .readdirSync(pnpmStoreDir)
    .find((entry) => entry.startsWith('ts-node@'));

  if (!tsNodeDir) {
    throw new Error('Unable to locate ts-node in the pnpm store.');
  }

  require(path.join(pnpmStoreDir, tsNodeDir, 'node_modules', 'ts-node', 'register', 'transpile-only'));
}

registerTypeScriptSupport();

require('@nomicfoundation/hardhat-toolbox');
require('@nomicfoundation/hardhat-verify');
require('dotenv').config({ path: '../../.env.local' });

const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const isCompileOrTestCommand = process.argv.includes('compile') || process.argv.includes('test');

if (!DEPLOYER_KEY && !isCompileOrTestCommand && process.env.NODE_ENV !== 'test') {
  console.warn(
    'WARNING: DEPLOYER_PRIVATE_KEY not set. Deployment will fail. Set it in .env.local.'
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
      viaIR: true,
    },
  },
  networks: {
    hardhat: {},
    alfajores: {
      url: 'https://alfajores-forno.celo-testnet.org',
      chainId: 44787,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      gasPrice: 'auto',
    },
    celo: {
      url: 'https://forno.celo.org',
      chainId: 42220,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      gasPrice: 'auto',
    },
  },
  etherscan: {
    apiKey: {
      alfajores: process.env.CELOSCAN_API_KEY ?? '',
      celo: process.env.CELOSCAN_API_KEY ?? '',
    },
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
};

module.exports = config;