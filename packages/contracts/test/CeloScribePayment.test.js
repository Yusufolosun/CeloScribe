const { expect } = require("chai");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { ethers } = require("hardhat");

const TASK_TYPE = {
  TEXT_SHORT: 0,
  TEXT_LONG: 1,
  IMAGE: 2,
  TRANSLATE: 3,
};

describe("CeloScribePayment", function () {
  async function deployFixture() {
    const [owner, user, treasury, other] = await ethers.getSigners();

    const mockCusdFactory = await ethers.getContractFactory("MockCUSD");
    const mockCusd = await mockCusdFactory.deploy();
    await mockCusd.waitForDeployment();

    const mockCusdDeployment = mockCusd.deploymentTransaction();
    if (!mockCusdDeployment) {
      throw new Error("MockCUSD deployment did not return a deployment transaction.");
    }

    const mockCusdReceipt = await mockCusdDeployment.wait();
    if (!mockCusdReceipt) {
      throw new Error("MockCUSD deployment did not return a transaction receipt.");
    }

    if (!mockCusdReceipt.contractAddress) {
      throw new Error("MockCUSD deployment did not return a contract address.");
    }

    const mockCusdAddress = mockCusdReceipt.contractAddress;

    const paymentFactory = await ethers.getContractFactory("CeloScribePayment");
    const payment = await paymentFactory.deploy(mockCusdAddress, treasury.address);
    await payment.waitForDeployment();

    const paymentDeployment = payment.deploymentTransaction();
    if (!paymentDeployment) {
      throw new Error("CeloScribePayment deployment did not return a deployment transaction.");
    }

    const paymentReceipt = await paymentDeployment.wait();
    if (!paymentReceipt) {
      throw new Error("CeloScribePayment deployment did not return a transaction receipt.");
    }

    if (!paymentReceipt.contractAddress) {
      throw new Error("CeloScribePayment deployment did not return a contract address.");
    }

    const paymentAddress = paymentReceipt.contractAddress;

    // Seed user with sufficient cUSD for all task payment tests.
    await mockCusd.mint(user.address, ethers.parseEther("10"));

    const prices = {
      short: await payment.PRICE_TEXT_SHORT(),
      long: await payment.PRICE_TEXT_LONG(),
      image: await payment.PRICE_IMAGE(),
      translate: await payment.PRICE_TRANSLATE(),
    };

    return { owner, user, treasury, other, mockCusd, payment, paymentAddress, prices };
  }

  describe("payForTask", function () {
    it("reverts with InsufficientPayment if user has not approved enough cUSD", async function () {
      const { user, payment, mockCusd, paymentAddress, prices } = await deployFixture();

      await mockCusd.connect(user).approve(paymentAddress, prices.short - 1n);

      await expect(payment.connect(user).payForTask(TASK_TYPE.TEXT_SHORT)).to.be.revertedWithCustomError(
        payment,
        "InsufficientPayment"
      );
    });

    it("reverts with InsufficientPayment if user balance is below the required amount", async function () {
      const { user, other, payment, mockCusd, paymentAddress, prices } = await deployFixture();

      await mockCusd.connect(user).approve(paymentAddress, prices.short);
      await mockCusd.connect(user).transfer(other.address, ethers.parseEther("10"));

      await expect(payment.connect(user).payForTask(TASK_TYPE.TEXT_SHORT))
        .to.be.revertedWithCustomError(payment, "InsufficientPayment")
        .withArgs(prices.short, 0n);
    });

    it("emits PaymentReceived with correct args on success", async function () {
      const { user, payment, mockCusd, paymentAddress, prices } = await deployFixture();

      await mockCusd.connect(user).approve(paymentAddress, prices.long);

      await expect(payment.connect(user).payForTask(TASK_TYPE.TEXT_LONG))
        .to.emit(payment, "PaymentReceived")
        .withArgs(user.address, TASK_TYPE.TEXT_LONG, prices.long, anyValue);
    });

    it("increments totalPaymentsReceived correctly", async function () {
      const { user, payment, mockCusd, paymentAddress, prices } = await deployFixture();

      await mockCusd.connect(user).approve(paymentAddress, prices.image);
      await payment.connect(user).payForTask(TASK_TYPE.IMAGE);

      expect(await payment.totalPaymentsReceived()).to.equal(prices.image);
    });

    it("reverts when paused", async function () {
      const { owner, user, payment, mockCusd, paymentAddress, prices } = await deployFixture();

      await mockCusd.connect(user).approve(paymentAddress, prices.short);
      await payment.connect(owner).pause();

      await expect(payment.connect(user).payForTask(TASK_TYPE.TEXT_SHORT)).to.be.revertedWithCustomError(
        payment,
        "EnforcedPause"
      );
    });

    it("works for all 4 task types with correct amounts", async function () {
      const { user, payment, mockCusd, paymentAddress, prices } = await deployFixture();

      const expectedTotal = prices.short + prices.long + prices.image + prices.translate;

      await mockCusd.connect(user).approve(paymentAddress, expectedTotal);

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
      const { owner, user, treasury, payment, mockCusd, paymentAddress, prices } = await deployFixture();

      await mockCusd.connect(user).approve(paymentAddress, prices.image);
      await payment.connect(user).payForTask(TASK_TYPE.IMAGE);

      const before = await mockCusd.balanceOf(treasury.address);

      await expect(payment.connect(owner).withdrawToTreasury())
        .to.emit(payment, "TreasuryWithdrawal")
        .withArgs(treasury.address, prices.image);

      const after = await mockCusd.balanceOf(treasury.address);
      expect(after - before).to.equal(prices.image);
      expect(await mockCusd.balanceOf(paymentAddress)).to.equal(0n);
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

    it("non-owner cannot unpause", async function () {
      const { user, payment } = await deployFixture();

      await expect(payment.connect(user).unpause()).to.be.revertedWithCustomError(
        payment,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe("renounceOwnership", function () {
    it("reverts with RenounceOwnershipDisabled", async function () {
      const { owner, payment } = await deployFixture();

      await expect(payment.connect(owner).renounceOwnership()).to.be.revertedWithCustomError(
        payment,
        "RenounceOwnershipDisabled"
      );
    });
  });

  describe("rescueToken", function () {
    it("owner can rescue non-cUSD tokens", async function () {
      const { owner, payment, paymentAddress } = await deployFixture();

      // Deploy another mock token
      const dummyTokenFactory = await ethers.getContractFactory("MockCUSD");
      const dummyToken = await dummyTokenFactory.deploy();
      await dummyToken.waitForDeployment();
      const dummyAddress = await dummyToken.getAddress();

      await dummyToken.mint(paymentAddress, ethers.parseEther("100"));
      expect(await dummyToken.balanceOf(paymentAddress)).to.equal(ethers.parseEther("100"));

      await payment.connect(owner).rescueToken(dummyAddress, ethers.parseEther("100"));
      expect(await dummyToken.balanceOf(owner.address)).to.equal(ethers.parseEther("100"));
      expect(await dummyToken.balanceOf(paymentAddress)).to.equal(0n);
    });

    it("reverts with InvalidToken if trying to rescue cUSD", async function () {
      const { owner, payment, mockCusd } = await deployFixture();
      const mockCusdAddress = await mockCusd.getAddress();

      await expect(payment.connect(owner).rescueToken(mockCusdAddress, 100n)).to.be.revertedWithCustomError(
        payment,
        "InvalidToken"
      );
    });

    it("reverts if called by non-owner", async function () {
      const { user, other, payment } = await deployFixture();

      await expect(payment.connect(user).rescueToken(other.address, 100n)).to.be.revertedWithCustomError(
        payment,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe("Views (contractBalance, version)", function () {
    it("contractBalance returns correct amount", async function () {
      const { user, payment, mockCusd, paymentAddress, prices } = await deployFixture();

      await mockCusd.connect(user).approve(paymentAddress, prices.short);
      await payment.connect(user).payForTask(TASK_TYPE.TEXT_SHORT);

      expect(await payment.contractBalance()).to.equal(prices.short);
    });

    it("version returns '1'", async function () {
      const { payment } = await deployFixture();
      expect(await payment.version()).to.equal("1");
    });
  });
});