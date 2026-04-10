import { ethers, run, network } from 'hardhat';

// cUSD addresses by network
const CUSD_ADDRESSES: Record<string, string> = {
  celo: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
  alfajores: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
  hardhat: '', // Set dynamically in tests
};

async function main() {
  const networkName = network.name;
  console.log(`\n[Deploy] Network: ${networkName}`);

  const cusdAddress = CUSD_ADDRESSES[networkName];
  if (!cusdAddress) {
    throw new Error(`No cUSD address configured for network: ${networkName}`);
  }

  const [deployer] = await ethers.getSigners();
  console.log(`[Deploy] Deployer: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`[Deploy] Deployer CELO balance: ${ethers.formatEther(balance)} CELO`);

  // Treasury = deployer address initially. Update after deployment via setTreasury().
  const treasuryAddress = deployer.address;

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