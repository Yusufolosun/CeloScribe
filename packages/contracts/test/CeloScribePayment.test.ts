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

    it("reverts with InsufficientPayment if user balance is below the required amount", async function () {
      const { user, other, payment, mockCusd, prices } = await deployFixture();

      await mockCusd.connect(user).approve(await payment.getAddress(), prices.short);
      await mockCusd.connect(user).transfer(other.address, ethers.parseEther("10"));

      await expect(payment.connect(user).payForTask(TASK_TYPE.TEXT_SHORT))
        .to.be.revertedWithCustomError(payment, "InsufficientPayment")
        .withArgs(prices.short, 0n);
    });

    it("emits PaymentReceived with correct args on success", async function () {
      const { user, payment, mockCusd, prices } = await deployFixture();

      await mockCusd.connect(user).approve(await payment.getAddress(), prices.long);

      await expect(payment.connect(user).payForTask(TASK_TYPE.TEXT_LONG))
        .to.emit(payment, "PaymentReceived")
        .withArgs(user.address, TASK_TYPE.TEXT_LONG, prices.long, anyValue);
    });

    it("increments totalPaymentsReceived correctly", async function () {
      const { user, payment, mockCusd, prices } = await deployFixture();

      await mockCusd.connect(user).approve(await payment.getAddress(), prices.image);
      await payment.connect(user).payForTask(TASK_TYPE.IMAGE);

      expect(await payment.totalPaymentsReceived()).to.equal(prices.image);
    });

    it("reverts when paused", async function () {
      const { owner, user, payment, mockCusd, prices } = await deployFixture();

      await mockCusd.connect(user).approve(await payment.getAddress(), prices.short);
      await payment.connect(owner).pause();

      await expect(payment.connect(user).payForTask(TASK_TYPE.TEXT_SHORT)).to.be.revertedWithCustomError(
        payment,
        "EnforcedPause"
      );
    });

    it("works for all 4 task types with correct amounts", async function () {
      const { user, payment, mockCusd, prices } = await deployFixture();

      const expectedTotal = prices.short + prices.long + prices.image + prices.translate;

      await mockCusd.connect(user).approve(await payment.getAddress(), expectedTotal);

      await payment.connect(user).payForTask(TASK_TYPE.TEXT_SHORT);
      await payment.connect(user).payForTask(TASK_TYPE.TEXT_LONG);
      await payment.connect(user).payForTask(TASK_TYPE.IMAGE);
      await payment.connect(user).payForTask(TASK_TYPE.TRANSLATE);

      expect(await payment.totalPaymentsReceived()).to.equal(expectedTotal);
    });
  });

  describe("priceOf", function () {
    it("returns correct constant for each TaskType", async function () {
      const { payment, prices } = await deployFixture();

      expect(await payment.priceOf(TASK_TYPE.TEXT_SHORT)).to.equal(prices.short);
      expect(await payment.priceOf(TASK_TYPE.TEXT_LONG)).to.equal(prices.long);
      expect(await payment.priceOf(TASK_TYPE.IMAGE)).to.equal(prices.image);
      expect(await payment.priceOf(TASK_TYPE.TRANSLATE)).to.equal(prices.translate);
    });
  });

  describe("withdrawToTreasury", function () {
    it("transfers full contract balance to treasury and emits TreasuryWithdrawal", async function () {
      const { owner, user, treasury, payment, mockCusd, prices } = await deployFixture();

      await mockCusd.connect(user).approve(await payment.getAddress(), prices.image);
      await payment.connect(user).payForTask(TASK_TYPE.IMAGE);

      const before = await mockCusd.balanceOf(treasury.address);

      await expect(payment.connect(owner).withdrawToTreasury())
        .to.emit(payment, "TreasuryWithdrawal")
        .withArgs(treasury.address, prices.image);

      const after = await mockCusd.balanceOf(treasury.address);
      expect(after - before).to.equal(prices.image);
      expect(await mockCusd.balanceOf(await payment.getAddress())).to.equal(0n);
    });

    it("reverts with ZeroBalance if balance is 0", async function () {
      const { owner, payment } = await deployFixture();

      await expect(payment.connect(owner).withdrawToTreasury()).to.be.revertedWithCustomError(
        payment,
        "ZeroBalance"
      );
    });

    it("reverts if called by non-owner", async function () {
      const { user, payment } = await deployFixture();

      await expect(payment.connect(user).withdrawToTreasury()).to.be.revertedWithCustomError(
        payment,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe("setTreasury", function () {
    it("updates treasury address and emits TreasuryUpdated", async function () {
      const { owner, treasury, other, payment } = await deployFixture();

      await expect(payment.connect(owner).setTreasury(other.address))
        .to.emit(payment, "TreasuryUpdated")
        .withArgs(treasury.address, other.address);

      expect(await payment.treasury()).to.equal(other.address);
    });

    it("reverts with ZeroAddress if address is zero", async function () {
      const { owner, payment } = await deployFixture();

      await expect(payment.connect(owner).setTreasury(ethers.ZeroAddress)).to.be.revertedWithCustomError(
        payment,
        "ZeroAddress"
      );
    });

    it("reverts if called by non-owner", async function () {
      const { user, other, payment } = await deployFixture();

      await expect(payment.connect(user).setTreasury(other.address)).to.be.revertedWithCustomError(
        payment,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe("pause / unpause", function () {
    it("owner can pause and unpause", async function () {
      const { owner, payment } = await deployFixture();

      await payment.connect(owner).pause();
      expect(await payment.paused()).to.equal(true);

      await payment.connect(owner).unpause();
      expect(await payment.paused()).to.equal(false);
    });

    it("non-owner cannot pause", async function () {
      const { user, payment } = await deployFixture();

      await expect(payment.connect(user).pause()).to.be.revertedWithCustomError(
        payment,
        "OwnableUnauthorizedAccount"
      );
    });
  });
});
