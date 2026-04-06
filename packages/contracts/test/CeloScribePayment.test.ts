import { expect } from "chai";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { ethers } from "hardhat";

const TASK_TYPE = {
  TEXT_SHORT: 0,
  TEXT_LONG: 1,
  IMAGE: 2,
  TRANSLATE: 3,
} as const;