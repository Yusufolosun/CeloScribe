// Hardhat Runtime Environment type augmentation.
// When running via `hardhat run`, the hardhat-toolbox plugin injects `ethers`,
// `run`, and `network` into the 'hardhat' module. This declaration makes those
// imports visible to `tsc --noEmit` without requiring the full HRE bootstrap.
import 'hardhat/types/runtime';

import type { HardhatEthersHelpers } from '@nomicfoundation/hardhat-ethers/types';
import type { ethers as EthersT } from 'ethers';

declare module 'hardhat/types/runtime' {
  interface HardhatRuntimeEnvironment {
    ethers: typeof EthersT & HardhatEthersHelpers;
  }
}
