import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWeb3Context } from "../context/Web3Context";
import { ethers } from "ethers";
import ProgressBar from "./ProgressBar";
import CountdownTimer from "./CountdownTimer";

const categories = [
  "Technology",
  "Arts",
  "Health",
  "Education",
  "Environment",
  "Community",
  "Business",
  "Other",
];

const campaignTypes = ["Reward", "Donation", "Lending"];

function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contract, userAddress } = useWeb3Context();
  const [campaign, setCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState([]);
  const [newComment, setNewComment] = useState("");

  const fetchCampaignDetails = useCallback(async () => {
    if (!contract) return;
    try {
      setIsLoading(true);
      const campaignData = await contract.getCampaignDetails(id);
      setCampaign({
        id: id,
        owner: campaignData[0],
        title: campaignData[1],
        description: campaignData[2],
        target: ethers.formatEther(campaignData[3]),
        deadline: new Date(Number(campaignData[4]) * 1000).toLocaleString(),
        amountCollected: ethers.formatEther(campaignData[5]),
        ended: campaignData[6],
        fundsWithdrawn: campaignData[7],
        category: Number(campaignData[8]),
        campaignType: Number(campaignData[9]),
        rewardPercentage: Number(campaignData[10]),
      });

      // Fetch donations for this campaign
      const donors = await contract.getCampaignDonors(id);
      const fetchedDonations = await Promise.all(
        donors.map(async (donor) => {
          const amount = await contract.getDonationAmount(id, donor);
          return {
            donor: donor,
            amount: ethers.formatEther(amount),
          };
        })
      );
      setDonations(fetchedDonations);

      // Fetch feedback
      const feedbackData = await contract.getFeedback(id);
      setFeedback(
        feedbackData.map((fb) => ({
          user: fb.user,
          message: fb.message,
          timestamp: new Date(Number(fb.timestamp) * 1000).toLocaleString(),
        }))
      );
    } catch (error) {
      console.error("Error fetching campaign details:", error);
    } finally {
      setIsLoading(false);
    }
  }, [contract, id]);

  useEffect(() => {
    fetchCampaignDetails();
  }, [fetchCampaignDetails]);

  const handleDonate = async () => {
    if (!contract) return;
    try {
      const parsedAmount = ethers.parseEther(donationAmount);
      const transaction = await contract.donateToCampaign(id, {
        value: parsedAmount,
      });
      await transaction.wait();
      alert("Donation successful!");
      fetchCampaignDetails();
      setDonationAmount("");
    } catch (error) {
      console.error("Error donating:", error);
      alert("Failed to donate. See console for details.");
    }
  };

  const handleWithdraw = async () => {
    if (!contract) return;
    try {
      const transaction = await contract.withdrawFunds(id);
      await transaction.wait();
      alert("Funds withdrawn successfully!");
      fetchCampaignDetails();
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      if (error.reason) {
        alert("Failed to withdraw funds: " + error.reason);
      } else {
        alert("Failed to withdraw funds. Please check console for details.");
      }
    }
  };

  const handlePayReward = async (donor) => {
    if (!contract) return;
    try {
      const donationAmount = await contract.getDonationAmount(id, donor);
      // Use getBigInt for ethers v6
      const rewardPercentage = ethers.getBigInt(campaign.rewardPercentage);
      const hundred = ethers.getBigInt(100);
      // Calculate reward
      const rewardAmount = (donationAmount * rewardPercentage) / hundred;

      console.log("Paying reward:", {
        donationAmount: ethers.formatEther(donationAmount),
        rewardPercentage: rewardPercentage.toString(),
        rewardAmount: ethers.formatEther(rewardAmount),
      });

      const transaction = await contract.payReward(id, donor, {
        value: rewardAmount,
      });
      await transaction.wait();
      alert("Reward paid successfully!");
      fetchCampaignDetails();
    } catch (error) {
      console.error("Error paying reward:", error);
      alert("Failed to pay reward: " + error.message);
    }
  };
  const calculateRewardAmount = (donationAmount, rewardPercentage) => {
    try {
      const donation = ethers.getBigInt(donationAmount);
      const percentage = ethers.getBigInt(rewardPercentage);
      const hundred = ethers.getBigInt(100);
      return (donation * percentage) / hundred;
    } catch (error) {
      console.error("Error calculating reward:", error);
      throw new Error("Failed to calculate reward amount");
    }
  };

  const handleRepayLoan = async (donor) => {
    if (!contract) return;
    try {
      const loanAmount = await contract.getDonationAmount(id, donor);

      console.log("Repaying loan:", {
        amount: ethers.formatEther(loanAmount),
      });

      const transaction = await contract.repayLoan(id, donor, {
        value: loanAmount,
      });
      await transaction.wait();
      alert("Loan repaid successfully!");
      fetchCampaignDetails();
    } catch (error) {
      console.error("Error repaying loan:", error);
      alert("Failed to repay loan: " + error.message);
    }
  };

  // Helper function to format amounts
  const formatAmount = (amount) => {
    return ethers.formatEther(amount);
  };

  // Helper function to parse amounts
  const parseAmount = (amount) => {
    return ethers.parseEther(amount.toString());
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!contract) return;
    try {
      const transaction = await contract.addFeedback(id, newComment);
      await transaction.wait();
      alert("Comment added successfully!");
      setNewComment("");
      fetchCampaignDetails();
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. See console for details.");
    }
  };

  if (isLoading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (!campaign) {
    return <div className="text-center mt-8">Campaign not found.</div>;
  }

  const canWithdraw =
    userAddress &&
    userAddress.toLowerCase() === campaign.owner.toLowerCase() &&
    !campaign.fundsWithdrawn &&
    (campaign.ended ||
      new Date() > new Date(campaign.deadline) ||
      parseFloat(campaign.amountCollected) >= parseFloat(campaign.target));

  const isOwner =
    userAddress && userAddress.toLowerCase() === campaign.owner.toLowerCase();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          {campaign.title}
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Campaign Details</h2>
              <p className="mb-4 text-gray-300">{campaign.description}</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-400">Category</p>
                  <p className="font-medium">{categories[campaign.category]}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Campaign Type</p>
                  <p className="font-medium">
                    {campaignTypes[parseInt(campaign.campaignType)]}
                  </p>
                  {parseInt(campaign.campaignType) === 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-400">Reward Percentage</p>
                      <p className="font-medium">
                        {campaign.rewardPercentage}%
                      </p>
                    </div>
                  )}
                  {parseInt(campaign.campaignType) === 2 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-400">Loan Terms</p>
                      <p className="font-medium">Full amount to be repaid</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-400">Target</p>
                  <p className="font-medium">{campaign.target} ETH</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Collected</p>
                  <p className="font-medium">{campaign.amountCollected} ETH</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Deadline</p>
                  <p className="font-medium">{campaign.deadline}</p>
                </div>
                {campaign.campaignType === 0 && (
                  <div>
                    <p className="text-sm text-gray-400">Reward Percentage</p>
                    <p className="font-medium">{campaign.rewardPercentage}%</p>
                  </div>
                )}
              </div>
              <ProgressBar
                current={parseFloat(campaign.amountCollected)}
                target={parseFloat(campaign.target)}
              />
              <p className="mt-4 text-sm text-gray-400">
                Status:
                <span className="ml-2 font-medium">
                  {campaign.fundsWithdrawn
                    ? "Funds Withdrawn"
                    : campaign.ended
                    ? "Ended"
                    : "Active"}
                </span>
              </p>
              {!campaign.ended && !campaign.fundsWithdrawn && (
                <p className="mt-2 text-sm">
                  <span className="text-gray-400">Time left:</span>{" "}
                  <CountdownTimer deadline={campaign.deadline} />
                </p>
              )}
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Donations</h2>
              {donations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          Donor Address
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Amount (ETH)
                        </th>
                        {isOwner &&
                          (parseInt(campaign.campaignType) === 0 ||
                            parseInt(campaign.campaignType) === 2) && (
                            <th scope="col" className="px-6 py-3">
                              Action
                            </th>
                          )}
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map((donation, index) => (
                        <tr key={index} className="border-b border-gray-700">
                          <td className="px-6 py-4 font-medium">
                            {`${donation.donor.slice(
                              0,
                              6
                            )}...${donation.donor.slice(-4)}`}
                          </td>
                          <td className="px-6 py-4">{donation.amount}</td>
                          {isOwner && (
                            <>
                              {parseInt(campaign.campaignType) === 0 && (
                                <td className="px-6 py-4">
                                  <button
                                    onClick={() =>
                                      handlePayReward(donation.donor)
                                    }
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-xs"
                                  >
                                    Pay Reward
                                  </button>
                                </td>
                              )}
                              {parseInt(campaign.campaignType) === 2 && (
                                <td className="px-6 py-4">
                                  <button
                                    onClick={() =>
                                      handleRepayLoan(donation.donor)
                                    }
                                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-xs"
                                  >
                                    Repay Loan
                                  </button>
                                </td>
                              )}
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400">No donations yet.</p>
              )}
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">
                Feedback and Updates
              </h2>
              <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
                {feedback.map((item, index) => (
                  <div key={index} className="bg-gray-700 p-3 rounded">
                    <p className="text-sm">
                      <strong>
                        {item.user === campaign.owner ? "Owner" : "Donor"}:
                      </strong>{" "}
                      {item.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {item.timestamp}
                    </p>
                  </div>
                ))}
              </div>
              {(isOwner ||
                donations.some(
                  (d) => d.donor.toLowerCase() === userAddress.toLowerCase()
                )) && (
                <form onSubmit={handleAddComment} className="mt-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment or update"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 mb-2"
                    rows="3"
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  >
                    Add Comment
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Make a Donation</h2>
              {!campaign.ended && !campaign.fundsWithdrawn ? (
                <div>
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="Amount to donate (ETH)"
                    className="w-full p-2 mb-4 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                  />
                  <button
                    onClick={handleDonate}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                  >
                    Donate
                  </button>
                </div>
              ) : (
                <p className="text-gray-400">
                  This campaign is no longer accepting donations.
                </p>
              )}
            </div>

            {canWithdraw && (
              <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Withdraw Funds</h2>
                <button
                  onClick={handleWithdraw}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  Withdraw Funds
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate("/campaigns")}
          className="mt-8 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Back to Campaigns
        </button>
      </div>
    </div>
  );
}

export default CampaignDetails;
