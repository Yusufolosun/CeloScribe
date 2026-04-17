import * as fs from 'fs';
import * as path from 'path';

import { ethers, run, network } from 'hardhat';

// cUSD addresses by network
const CUSD_ADDRESSES: Record<string, string> = {
  celo: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
  alfajores: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
  hardhat: '',
};

function requireEnv(name: string, networkName: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for ${networkName} deployments.`);
  }

  return value;
}

function resolveTreasuryAddress(networkName: string, deployerAddress: string): string {
  if (networkName === 'hardhat') {
    return deployerAddress;
  }

  const treasuryAddress = requireEnv('TREASURY_ADDRESS', networkName);

  if (!ethers.isAddress(treasuryAddress)) {
    throw new Error(`Invalid TREASURY_ADDRESS for ${networkName}: ${treasuryAddress}`);
  }

  if (treasuryAddress === ethers.ZeroAddress) {
    throw new Error('TREASURY_ADDRESS cannot be the zero address.');
  }

  return ethers.getAddress(treasuryAddress);
}

// ── Save deployment artifact ──────────────────────────────────────────────────

interface DeploymentArtifact {
  network: string;
  chainId: number;
  contractAddress: string;
  cusdAddress: string;
  treasuryAddress: string;
  deployerAddress: string;
  txHash: string;
  blockNumber: number;
  deployedAt: string; // ISO 8601
}

async function saveDeploymentArtifact(artifact: DeploymentArtifact): Promise<void> {
  const deploymentsDir = path.resolve(__dirname, '..', 'deployments');
  fs.mkdirSync(deploymentsDir, { recursive: true });

  const filename = path.join(deploymentsDir, `${artifact.network}.json`);
  fs.writeFileSync(filename, JSON.stringify(artifact, null, 2) + '\n');
  console.log(`[Deploy] 📄 Deployment artifact saved to: ${filename}`);
}

async function main() {
  const networkName = network.name;
  console.log(`\n[Deploy] Network: ${networkName}`);

  if (networkName === 'hardhat') {
    throw new Error('Use pnpm deploy:testnet or pnpm deploy:mainnet. Hardhat deployments are not supported.');
  }

  requireEnv('DEPLOYER_PRIVATE_KEY', networkName);
  requireEnv('CELOSCAN_API_KEY', networkName);

  const cusdAddress = CUSD_ADDRESSES[networkName];
  if (!cusdAddress) {
    throw new Error(`No cUSD address configured for network: ${networkName}`);
  }

  const [deployer] = await ethers.getSigners();
  console.log(`[Deploy] Deployer: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`[Deploy] Deployer CELO balance: ${ethers.formatEther(balance)} CELO`);

  if (balance === 0n) {
    throw new Error('Deployer CELO balance is 0. Fund the deployer before deploying.');
  }

  const treasuryAddress = resolveTreasuryAddress(networkName, deployer.address);

  console.log(`[Deploy] Deploying CeloScribePayment...`);
  console.log(`         cUSD: ${cusdAddress}`);
  console.log(`         Treasury: ${treasuryAddress}`);

  const factory = await ethers.getContractFactory('CeloScribePayment');
  const contract = await factory.deploy(cusdAddress, treasuryAddress);
  await contract.waitForDeployment();

  const deployedAddress = await contract.getAddress();
  const deployTx = contract.deploymentTransaction();

  console.log(`[Deploy] Contract deployed at: ${deployedAddress}`);
  console.log(`[Deploy] Tx hash: ${deployTx?.hash ?? 'unknown'}`);

  // Wait for 5 confirmations before verifying
  if (networkName !== 'hardhat') {
    console.log(`[Deploy] Waiting for 5 confirmations...`);
    await deployTx?.wait(5);

    console.log(`[Deploy] Verifying on Celoscan...`);
    try {
      await run('verify:verify', {
        address: deployedAddress,
        constructorArguments: [cusdAddress, treasuryAddress],
      });
      console.log(`[Deploy] Verified successfully.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('Already Verified')) {
        console.log(`[Deploy] Already verified.`);
      } else {
        console.error(`[Deploy] Verification failed:`, message);
      }
    }
  }

  // Output deployment summary
  console.log('\n─────────────────────────────────────────');
  console.log('DEPLOYMENT SUMMARY');
  console.log('─────────────────────────────────────────');
  console.log(`Network:   ${networkName}`);
  console.log(`Address:   ${deployedAddress}`);
  console.log(`cUSD:      ${cusdAddress}`);
  console.log(`Treasury:  ${treasuryAddress}`);
  console.log('─────────────────────────────────────────');
  console.log('ACTION REQUIRED: Copy contract address to .env.local as:');
  console.log(`NEXT_PUBLIC_CELOSCRIBE_CONTRACT_ADDRESS=${deployedAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });