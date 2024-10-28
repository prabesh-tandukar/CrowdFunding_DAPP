const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Crowdfunding Contract", function () {
  let crowdfunding;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
    crowdfunding = await Crowdfunding.deploy();
  });

  describe("Campaign Creation", function () {
    it("Should create a reward-based campaign", async function () {
      const currentTimestamp = (await ethers.provider.getBlock()).timestamp;
      const futureDeadline = currentTimestamp + 3600; // 1 hour from now

      await crowdfunding.createCampaign(
        "Test Campaign",
        "Test Description",
        ethers.parseEther("1.0"),
        futureDeadline,
        0, // Technology category
        0, // Reward type
        10 // 10% reward
      );

      const campaign = await crowdfunding.getCampaignDetails(0);
      expect(campaign[1]).to.equal("Test Campaign"); // Title
      expect(campaign[3]).to.equal(ethers.parseEther("1.0")); // Target
      expect(campaign[9]).to.equal(0); // Campaign type (Reward)
      expect(campaign[10]).to.equal(10); // Reward percentage
    });

    it("Should create a donation-based campaign", async function () {
      const currentTimestamp = (await ethers.provider.getBlock()).timestamp;
      const futureDeadline = currentTimestamp + 3600;

      await crowdfunding.createCampaign(
        "Donation Campaign",
        "Help needed",
        ethers.parseEther("2.0"),
        futureDeadline,
        1, // Arts category
        1, // Donation type
        0 // No reward
      );

      const campaign = await crowdfunding.getCampaignDetails(0);
      expect(campaign[9]).to.equal(1); // Campaign type (Donation)
      expect(campaign[10]).to.equal(0); // No reward
    });

    it("Should create a lending-based campaign", async function () {
      const currentTimestamp = (await ethers.provider.getBlock()).timestamp;
      const futureDeadline = currentTimestamp + 3600;

      await crowdfunding.createCampaign(
        "Lending Campaign",
        "Loan needed",
        ethers.parseEther("3.0"),
        futureDeadline,
        2, // Health category
        2, // Lending type
        0 // No reward
      );

      const campaign = await crowdfunding.getCampaignDetails(0);
      expect(campaign[9]).to.equal(2); // Campaign type (Lending)
    });

    it("Should revert if deadline is in the past", async function () {
      const currentTimestamp = (await ethers.provider.getBlock()).timestamp;
      const pastDeadline = currentTimestamp - 3600; // 1 hour ago

      await expect(
        crowdfunding.createCampaign(
          "Test Campaign",
          "Test Description",
          ethers.parseEther("1.0"),
          pastDeadline,
          0,
          0,
          10
        )
      ).to.be.revertedWith("Deadline must be in the future");
    });
  });

  describe("Donations", function () {
    beforeEach(async function () {
      const currentTimestamp = (await ethers.provider.getBlock()).timestamp;
      const futureDeadline = currentTimestamp + 3600;

      await crowdfunding.createCampaign(
        "Test Campaign",
        "Test Description",
        ethers.parseEther("1.0"),
        futureDeadline,
        0,
        0,
        10
      );
    });

    it("Should accept donations", async function () {
      await crowdfunding.connect(addr1).donateToCampaign(0, {
        value: ethers.parseEther("0.5"),
      });

      const campaign = await crowdfunding.getCampaignDetails(0);
      expect(campaign[5]).to.equal(ethers.parseEther("0.5")); // amountCollected

      const donationAmount = await crowdfunding.getDonationAmount(
        0,
        addr1.address
      );
      expect(donationAmount).to.equal(ethers.parseEther("0.5"));
    });

    it("Should track donors correctly", async function () {
      await crowdfunding.connect(addr1).donateToCampaign(0, {
        value: ethers.parseEther("0.5"),
      });

      const donors = await crowdfunding.getCampaignDonors(0);
      expect(donors).to.include(addr1.address);
    });

    it("Should not accept donations after deadline", async function () {
      // Fast forward time by 2 hours
      await ethers.provider.send("evm_increaseTime", [7200]);
      await ethers.provider.send("evm_mine");

      await expect(
        crowdfunding.connect(addr1).donateToCampaign(0, {
          value: ethers.parseEther("0.5"),
        })
      ).to.be.revertedWith("Campaign deadline has passed");
    });
  });

  describe("Rewards and Repayments", function () {
    beforeEach(async function () {
      const currentTimestamp = (await ethers.provider.getBlock()).timestamp;
      const futureDeadline = currentTimestamp + 3600;

      // Create reward campaign
      await crowdfunding.createCampaign(
        "Reward Campaign",
        "Test Description",
        ethers.parseEther("1.0"),
        futureDeadline,
        0,
        0, // Reward type
        10 // 10% reward
      );

      // Create lending campaign
      await crowdfunding.createCampaign(
        "Lending Campaign",
        "Test Description",
        ethers.parseEther("1.0"),
        futureDeadline,
        0,
        2, // Lending type
        0
      );
    });

    it("Should pay rewards correctly", async function () {
      // Make donation
      await crowdfunding.connect(addr1).donateToCampaign(0, {
        value: ethers.parseEther("1.0"),
      });

      // Get initial balance
      const initialBalance = await ethers.provider.getBalance(addr1.address);

      // Calculate reward amount (10% of 1 ETH)
      const rewardAmount = ethers.parseEther("0.1");

      // Pay reward
      await crowdfunding.payReward(0, addr1.address, {
        value: rewardAmount,
      });

      // Get final balance
      const finalBalance = await ethers.provider.getBalance(addr1.address);

      // Verify the reward was received (accounting for gas costs)
      expect(finalBalance).to.be.gt(initialBalance);

      // Verify donation amount
      const donationAmount = await crowdfunding.getDonationAmount(
        0,
        addr1.address
      );
      expect(donationAmount).to.equal(ethers.parseEther("1.0"));

      // Check if the reward event was emitted
      const events = await crowdfunding.queryFilter(
        crowdfunding.filters.RewardPaid()
      );
      expect(events.length).to.be.gt(0);
      expect(events[0].args.recipient).to.equal(addr1.address);
      expect(events[0].args.amount).to.equal(rewardAmount);
    });

    it("Should repay loans correctly", async function () {
      // Make loan
      await crowdfunding.connect(addr1).donateToCampaign(1, {
        value: ethers.parseEther("1.0"),
      });

      // Get initial balance
      const initialBalance = await ethers.provider.getBalance(addr1.address);

      // Repay loan
      const loanAmount = ethers.parseEther("1.0");
      await crowdfunding.repayLoan(1, addr1.address, {
        value: loanAmount,
      });

      // Get final balance
      const finalBalance = await ethers.provider.getBalance(addr1.address);

      // Verify the loan was repaid (accounting for gas costs)
      expect(finalBalance).to.be.gt(initialBalance);

      // Verify the donation amount is now 0 (loan repaid)
      const remainingLoanAmount = await crowdfunding.getDonationAmount(
        1,
        addr1.address
      );
      expect(remainingLoanAmount).to.equal(0);

      // Check if the loan repayment event was emitted
      const events = await crowdfunding.queryFilter(
        crowdfunding.filters.LoanRepaid()
      );
      expect(events.length).to.be.gt(0);
      expect(events[0].args.recipient).to.equal(addr1.address);
      expect(events[0].args.amount).to.equal(loanAmount);
    });

    it("Should not allow non-owner to pay rewards", async function () {
      await crowdfunding.connect(addr1).donateToCampaign(0, {
        value: ethers.parseEther("1.0"),
      });

      await expect(
        crowdfunding.connect(addr2).payReward(0, addr1.address, {
          value: ethers.parseEther("0.1"),
        })
      ).to.be.revertedWith("Only the campaign owner can pay rewards");
    });

    it("Should not allow non-owner to repay loans", async function () {
      await crowdfunding.connect(addr1).donateToCampaign(1, {
        value: ethers.parseEther("1.0"),
      });

      await expect(
        crowdfunding.connect(addr2).repayLoan(1, addr1.address, {
          value: ethers.parseEther("1.0"),
        })
      ).to.be.revertedWith("Only the campaign owner can repay loans");
    });

    it("Should not allow reward payment for non-reward campaigns", async function () {
      await crowdfunding.connect(addr1).donateToCampaign(1, {
        value: ethers.parseEther("1.0"),
      });

      await expect(
        crowdfunding.payReward(1, addr1.address, {
          value: ethers.parseEther("0.1"),
        })
      ).to.be.revertedWith("This is not a reward-based campaign");
    });

    it("Should not allow loan repayment for non-lending campaigns", async function () {
      await crowdfunding.connect(addr1).donateToCampaign(0, {
        value: ethers.parseEther("1.0"),
      });

      await expect(
        crowdfunding.repayLoan(0, addr1.address, {
          value: ethers.parseEther("1.0"),
        })
      ).to.be.revertedWith("This is not a lending-based campaign");
    });
  });

  describe("Feedback System", function () {
    beforeEach(async function () {
      const currentTimestamp = (await ethers.provider.getBlock()).timestamp;
      const futureDeadline = currentTimestamp + 3600;

      await crowdfunding.createCampaign(
        "Test Campaign",
        "Test Description",
        ethers.parseEther("1.0"),
        futureDeadline,
        0,
        0,
        10
      );
    });

    it("Should track all feedback properly", async function () {
      // Make donation
      await crowdfunding.connect(addr1).donateToCampaign(0, {
        value: ethers.parseEther("0.5"),
      });

      // Add feedback
      await crowdfunding.connect(addr1).addFeedback(0, "First comment");
      await crowdfunding.connect(addr1).addFeedback(0, "Second comment");

      const feedback = await crowdfunding.getFeedback(0);
      expect(feedback.length).to.equal(3); // 1 automatic + 2 custom
      expect(feedback[0].message).to.include("Donation of");
      expect(feedback[1].message).to.equal("First comment");
      expect(feedback[2].message).to.equal("Second comment");
    });

    it("Should not allow non-donors to add feedback", async function () {
      await expect(
        crowdfunding.connect(addr2).addFeedback(0, "Nice!")
      ).to.be.revertedWith("Only the owner or donors can add feedback");
    });

    it("Should allow campaign owner to add feedback", async function () {
      await crowdfunding.addFeedback(0, "Update from owner");

      const feedback = await crowdfunding.getFeedback(0);
      expect(feedback[0].user).to.equal(owner.address);
      expect(feedback[0].message).to.equal("Update from owner");
    });
  });

  describe("Campaign Withdrawal", function () {
    beforeEach(async function () {
      const currentTimestamp = (await ethers.provider.getBlock()).timestamp;
      const futureDeadline = currentTimestamp + 3600;

      await crowdfunding.createCampaign(
        "Test Campaign",
        "Test Description",
        ethers.parseEther("1.0"),
        futureDeadline,
        0,
        0,
        10
      );
    });

    it("Should allow owner to withdraw funds after target is met", async function () {
      await crowdfunding.connect(addr1).donateToCampaign(0, {
        value: ethers.parseEther("1.0"),
      });

      await crowdfunding.withdrawFunds(0);

      const campaign = await crowdfunding.getCampaignDetails(0);
      expect(campaign[7]).to.equal(true); // fundsWithdrawn
    });

    it("Should not allow withdrawal before target is met", async function () {
      await crowdfunding.connect(addr1).donateToCampaign(0, {
        value: ethers.parseEther("0.5"),
      });

      await expect(crowdfunding.withdrawFunds(0)).to.be.revertedWith(
        "Cannot withdraw before deadline unless target is met"
      );
    });

    it("Should not allow non-owner to withdraw", async function () {
      await crowdfunding.connect(addr1).donateToCampaign(0, {
        value: ethers.parseEther("1.0"),
      });

      await expect(
        crowdfunding.connect(addr1).withdrawFunds(0)
      ).to.be.revertedWith("Only the campaign owner can withdraw funds");
    });

    it("Should allow withdrawal after deadline", async function () {
      await crowdfunding.connect(addr1).donateToCampaign(0, {
        value: ethers.parseEther("0.5"),
      });

      // Fast forward time past deadline
      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine");

      await crowdfunding.withdrawFunds(0);

      const campaign = await crowdfunding.getCampaignDetails(0);
      expect(campaign[7]).to.equal(true); // fundsWithdrawn
    });
  });
});
