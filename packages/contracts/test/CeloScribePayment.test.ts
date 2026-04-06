import { expect } from "chai";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { ethers } from "hardhat";

const TASK_TYPE = {
  TEXT_SHORT: 0,
  TEXT_LONG: 1,
  IMAGE: 2,
  TRANSLATE: 3,
} as const;

describe("CeloScribePayment", function () {
  async function deployFixture() {
    const [owner, user, treasury, other] = await ethers.getSigners();

    const MockCUSD = await ethers.getContractFactory("MockCUSD");
    const mockCusd = await MockCUSD.deploy();
    await mockCusd.waitForDeployment();

    const Payment = await ethers.getContractFactory("CeloScribePayment");
    const payment = await Payment.deploy(await mockCusd.getAddress(), treasury.address);
    await payment.waitForDeployment();

    // Seed user with sufficient cUSD for all task payment tests.
    await mockCusd.mint(user.address, ethers.parseEther("10"));

    const prices = {
      short: await payment.PRICE_TEXT_SHORT(),
      long: await payment.PRICE_TEXT_LONG(),
      image: await payment.PRICE_IMAGE(),
      translate: await payment.PRICE_TRANSLATE(),
    };

    return { owner, user, treasury, other, mockCusd, payment, prices };
  }

  describe("payForTask", function () {
    it("reverts with InsufficientPayment if user has not approved enough cUSD", async function () {
      const { user, payment, mockCusd, prices } = await deployFixture();

      await mockCusd.connect(user).approve(await payment.getAddress(), prices.short - 1n);

      await expect(payment.connect(user).payForTask(TASK_TYPE.TEXT_SHORT)).to.be.revertedWithCustomError(
        payment,
        "InsufficientPayment"
      );
    });

    it("emits PaymentReceived with correct args on success", async function () {
      const { user, payment, mockCusd, prices } = await deployFixture();

      await mockCusd.connect(user).approve(await payment.getAddress(), prices.long);

      await expect(payment.connect(user).payForTask(TASK_TYPE.TEXT_LONG))
        .to.emit(payment, "PaymentReceived")
        .withArgs(user.address, TASK_TYPE.TEXT_LONG, prices.long, anyValue);
    });
  });
});
