// components/CampaignDetails.js
import React, { useState, useEffect } from "react";
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

function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contract, userAddress } = useWeb3Context();
  const [campaign, setCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState("");

  useEffect(() => {
    if (contract) {
      fetchCampaignDetails();
    }
  }, [contract, id]);

  async function fetchCampaignDetails() {
    try {
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
        category: campaignData[8],
      });
    } catch (error) {
      console.error("Error fetching campaign details:", error);
      alert("Failed to fetch campaign details. See console for details.");
    }
  }

  async function handleDonate() {
    try {
      const parsedAmount = ethers.parseEther(donationAmount);
      const transaction = await contract.donateToCampaign(id, {
        value: parsedAmount,
      });
      await transaction.wait();
      alert("Donation successful!");
      fetchCampaignDetails();
    } catch (error) {
      console.error("Error donating to campaign:", error);
      alert("Failed to donate. See console for details.");
    }
  }

  async function handleWithdraw() {
    try {
      const transaction = await contract.withdrawFunds(id);
      await transaction.wait();
      alert("Funds withdrawn successfully!");
      fetchCampaignDetails();
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      if (error.reason) {
        alert(`Failed to withdraw funds: ${error.reason}`);
      } else {
        alert("Failed to withdraw funds. See console for details.");
      }
    }
  }

  function canWithdraw() {
    if (!campaign || !userAddress) return false;
    const now = new Date();
    return (
      userAddress.toLowerCase() === campaign.owner.toLowerCase() &&
      !campaign.fundsWithdrawn &&
      (campaign.ended ||
        now > new Date(campaign.deadline) ||
        parseFloat(campaign.amountCollected) >= parseFloat(campaign.target))
    );
  }

  if (!campaign) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold mb-8">{campaign.title}</h1>
      <p className="mb-4">{campaign.description}</p>
      <p>Category: {categories[campaign.category]}</p>
      <p>Target: {campaign.target} ETH</p>
      <p>Collected: {campaign.amountCollected} ETH</p>
      <ProgressBar
        current={parseFloat(campaign.amountCollected)}
        target={parseFloat(campaign.target)}
      />
      <p>Deadline: {campaign.deadline}</p>
      <p>
        Status:{" "}
        {campaign.fundsWithdrawn
          ? "Funds Withdrawn"
          : campaign.ended
          ? "Ended"
          : "Active"}
      </p>
      {!campaign.ended && !campaign.fundsWithdrawn && (
        <p>
          Time left: <CountdownTimer deadline={campaign.deadline} />
        </p>
      )}
      {!campaign.ended && !campaign.fundsWithdrawn && (
        <div className="mt-4">
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
      {canWithdraw() && (
        <button
          onClick={handleWithdraw}
          className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mt-4"
        >
          Withdraw Funds
        </button>
      )}
      <button
        onClick={() => navigate("/campaigns")}
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4 ml-2"
      >
        Back to Campaigns
      </button>
    </div>
  );
}

export default CampaignDetails;
