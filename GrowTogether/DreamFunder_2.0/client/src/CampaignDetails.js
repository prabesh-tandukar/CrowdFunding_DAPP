import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import CountdownTimer from "./CountdownTimer";

function CampaignDetails({
  campaign,
  contract,
  onBack,
  onDonate,
  onWithdraw,
  signer,
}) {
  const [donors, setDonors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [canWithdraw, setCanWithdraw] = useState(false);
  const [feedback, setFeedback] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    fetchDonors();
    checkOwnership();
    checkWithdrawEligibility();
    fetchFeedback();
  }, [campaign.id, contract, signer]);

  async function checkOwnership() {
    if (signer) {
      try {
        const address = await signer.getAddress();
        setIsOwner(address.toLowerCase() === campaign.owner.toLowerCase());
      } catch (error) {
        console.error("Error checking ownership:", error);
      }
    }
  }

  async function checkWithdrawEligibility() {
    const now = new Date();
    const deadline = new Date(campaign.deadline);
    setCanWithdraw(
      isOwner &&
        !campaign.fundsWithdrawn &&
        (campaign.ended ||
          now > deadline ||
          parseFloat(campaign.amountCollected) >= parseFloat(campaign.target))
    );
  }

  async function fetchDonors() {
    setIsLoading(true);
    setError(null);
    try {
      const filter = contract.filters.DonationMade(campaign.id);
      const events = await contract.queryFilter(filter);

      const donorDetails = await Promise.all(
        events.map(async (event) => {
          const [campaignId, donor, amount] = event.args;
          const block = await event.getBlock();
          return {
            address: donor,
            amount: ethers.formatEther(amount),
            timestamp: new Date(block.timestamp * 1000).toLocaleString(),
          };
        })
      );

      setDonors(donorDetails);
    } catch (error) {
      console.error("Error fetching donors:", error);
      setError("Failed to fetch donor information. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchFeedback() {
    try {
      const feedbackData = await contract.getFeedback(campaign.id);
      setFeedback(
        feedbackData.map((fb) => ({
          user: fb.user,
          message: fb.message,
          timestamp: new Date(fb.timestamp * 1000).toLocaleString(),
        }))
      );
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setError("Failed to load feedback. Please try again later.");
    }
  }

  async function handleDonate() {
    if (
      !donationAmount ||
      isNaN(donationAmount) ||
      parseFloat(donationAmount) <= 0
    ) {
      alert("Please enter a valid donation amount.");
      return;
    }

    try {
      await onDonate(campaign.id, donationAmount);
      setDonationAmount("");
      fetchDonors();
      fetchFeedback();
    } catch (error) {
      console.error("Error donating:", error);
      alert("Failed to make donation. Please try again.");
    }
  }

  async function handleWithdraw() {
    try {
      await onWithdraw(campaign.id);
      alert("Funds withdrawn successfully!");
      // Refresh campaign details after withdrawal
      onBack();
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      if (error.reason) {
        alert(`Failed to withdraw funds: ${error.reason}`);
      } else {
        alert("Failed to withdraw funds. Please try again.");
      }
    }
  }

  async function handlePayReward(donor) {
    if (!window.confirm(`Are you sure you want to pay the reward to ${donor}?`))
      return;

    setIsActionLoading(true);
    try {
      const donationAmount = await contract.getDonationAmount(
        campaign.id,
        donor
      );
      const rewardAmount = donationAmount
        .mul(campaign.rewardPercentage)
        .div(100);
      await contract.payReward(campaign.id, donor, { value: rewardAmount });
      alert("Reward paid successfully!");
      fetchDonors();
      fetchFeedback();
    } catch (error) {
      console.error("Error paying reward:", error);
      alert("Failed to pay reward. Please try again.");
    }
  }

  async function handleRepayLoan(donor) {
    try {
      const loanAmount = await contract.getDonationAmount(campaign.id, donor);
      await contract.repayLoan(campaign.id, donor, { value: loanAmount });
      alert("Loan repaid successfully!");
      fetchDonors();
      fetchFeedback();
    } catch (error) {
      console.error("Error repaying loan:", error);
      alert("Failed to repay loan. Please try again.");
    }
  }

  async function handleAddComment(e) {
    e.preventDefault();
    try {
      await contract.addFeedback(campaign.id, newComment);
      alert("Comment added successfully!");
      fetchFeedback();
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    }
  }

  const campaignEnded =
    campaign.ended || new Date(campaign.deadline) < new Date();
  const targetReached =
    parseFloat(campaign.amountCollected) >= parseFloat(campaign.target);

  const campaignTypes = ["Reward", "Donation", "Lending"];

  // Helper function to get campaign type string
  const getCampaignTypeString = (typeIndex) => {
    return campaignTypes[typeIndex] || "Unknown";
  };

  return (
    <div className="container mx-auto px-4 md:px-0">
      <button
        onClick={onBack}
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Back to Campaigns
      </button>
      <h1 className="text-4xl font-bold mb-4">{campaign.title}!!!</h1>
      <div className="mb-4">
        <span
          className={`px-2 py-1 rounded text-white font-bold ${
            campaign.campaignType === 0
              ? "bg-blue-500"
              : campaign.campaignType === 1
              ? "bg-green-500"
              : "bg-yellow-500"
          }`}
        >
          {getCampaignTypeString(campaign.campaignType)} Campaign
        </span>
      </div>
      <p className="mb-2">
        <strong>Description:</strong> {campaign.description}
      </p>
      <p className="mb-2">
        <strong>Owner:</strong> {campaign.owner}
      </p>
      <p className="mb-2">
        <strong>Target:</strong> {campaign.target} ETH
      </p>
      <p className="mb-2">
        <strong>Deadline:</strong> {campaign.deadline}
      </p>
      <p className="mb-2">
        <strong>Amount Collected:</strong> {campaign.amountCollected} ETH
      </p>
      <p className="mb-2">
        <strong>Status:</strong>{" "}
        {campaign.fundsWithdrawn
          ? "Funds Withdrawn"
          : campaignEnded
          ? "Ended"
          : "Active"}
      </p>
      <p className="mb-2">
        <strong>Campaign Type:</strong> {campaignTypes[campaign.campaignType]}
      </p>
      {/* Campaign Type Specific Information */}
      {campaign.campaignType === 0 && (
        <p className="mb-2">
          <strong>Reward Percentage:</strong> {campaign.rewardPercentage}%
        </p>
      )}
      {campaign.campaignType === 2 && (
        <p className="mb-2">
          <strong>Loan Terms:</strong> Full repayment upon campaign completion
        </p>
      )}

      {!campaignEnded && (
        <p className="mb-2">
          <strong>Time left:</strong>{" "}
          <CountdownTimer deadline={campaign.deadline} />
        </p>
      )}

      {!campaignEnded && !campaign.fundsWithdrawn && (
        <div className="mt-4 mb-8">
          <input
            type="number"
            value={donationAmount}
            onChange={(e) => setDonationAmount(e.target.value)}
            placeholder="Amount to donate (ETH)"
            className="p-2 border rounded mr-2"
          />
          <button
            onClick={handleDonate}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Donate
          </button>
        </div>
      )}

      {canWithdraw && (
        <button
          onClick={handleWithdraw}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4 mb-8"
        >
          Withdraw Funds
        </button>
      )}

      <h2 className="text-2xl font-bold mb-4">Donors</h2>
      {isLoading ? (
        <p>Loading donor information...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : donors.length > 0 ? (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Address</th>
              <th className="border border-gray-300 p-2">Amount (ETH)</th>
              <th className="border border-gray-300 p-2">Timestamp</th>
              {isOwner && campaign.campaignType !== 1 && (
                <th className="border border-gray-300 p-2">Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {donors.map((donor, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">{donor.address}</td>
                <td className="border border-gray-300 p-2">{donor.amount}</td>
                <td className="border border-gray-300 p-2">
                  {donor.timestamp}
                </td>
                {isOwner && campaign.campaignType !== 1 && (
                  <td className="border border-gray-300 p-2">
                    {campaign.campaignType === 0 ? (
                      <button
                        onClick={() => handlePayReward(donor.address)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                      >
                        Pay Reward
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRepayLoan(donor.address)}
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded"
                      >
                        Repay Loan
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No donations yet.</p>
      )}

      <h2 className="text-2xl font-bold mt-8 mb-4">Feedback and Updates</h2>
      <div className="mb-4">
        {feedback.map((item, index) => (
          <div key={index} className="border-b py-2">
            <p>
              <strong>
                {item.user === campaign.owner ? "Owner" : "Donor"}:
              </strong>{" "}
              {item.message}
            </p>
            <p className="text-sm text-gray-500">{item.timestamp}</p>
          </div>
        ))}
      </div>
      {(isOwner ||
        donors.some(
          (donor) =>
            donor.address.toLowerCase() === signer.getAddress().toLowerCase()
        )) && (
        <form onSubmit={handleAddComment} className="mt-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment or update"
            className="w-full p-2 border rounded mb-2"
            rows="3"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Comment
          </button>
        </form>
      )}
    </div>
  );
}

export default CampaignDetails;
