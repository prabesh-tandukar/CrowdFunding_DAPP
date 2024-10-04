// components/UserDashboard.js
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useWeb3Context } from "../context/Web3Context";
import { ethers } from "ethers";

function UserDashboard() {
  const { contract, userAddress } = useWeb3Context();
  const [userCampaigns, setUserCampaigns] = useState([]);
  const [userDonations, setUserDonations] = useState([]);

  useEffect(() => {
    if (contract && userAddress) {
      fetchUserCampaigns();
      fetchUserDonations();
    }
  }, [contract, userAddress]);

  const fetchUserCampaigns = useCallback(async () => {
    if (!contract || !userAddress) return;
    try {
      const campaignCount = await contract.numberOfCampaigns();
      const userCampaigns = [];

      for (let i = 0; i < campaignCount; i++) {
        const campaign = await contract.getCampaignDetails(i);
        if (campaign[0].toLowerCase() === userAddress.toLowerCase()) {
          userCampaigns.push({
            id: i,
            title: campaign[1],
            target: ethers.formatEther(campaign[3]),
            amountCollected: ethers.formatEther(campaign[5]),
            ended: campaign[6],
            fundsWithdrawn: campaign[7],
          });
        }
      }

      setUserCampaigns(userCampaigns);
    } catch (error) {
      console.error("Error fetching user campaigns:", error);
    }
  }, [contract, userAddress]);

  const fetchUserDonations = useCallback(async () => {
    if (!contract || !userAddress) return;
    try {
      const donationCount = await contract.getDonationCount(userAddress);
      const userDonations = [];

      for (let i = 0; i < donationCount; i++) {
        const donation = await contract.getDonationDetails(userAddress, i);
        userDonations.push({
          campaignId: donation[0],
          amount: ethers.formatEther(donation[1]),
        });
      }

      setUserDonations(userDonations);
    } catch (error) {
      console.error("Error fetching user donations:", error);
    }
  }, [contract, userAddress]);

  useEffect(() => {
    fetchUserCampaigns();
    fetchUserDonations();
  }, [fetchUserCampaigns, fetchUserDonations]);

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold mb-8">Your Dashboard</h1>

      <h2 className="text-2xl font-bold mb-4">Your Campaigns</h2>
      {userCampaigns.length > 0 ? (
        <ul>
          {userCampaigns.map((campaign) => (
            <li key={campaign.id} className="mb-2">
              <Link
                to={`/campaign/${campaign.id}`}
                className="text-blue-500 hover:underline"
              >
                {campaign.title}
              </Link>
              <span className="ml-2">
                ({campaign.amountCollected} / {campaign.target} ETH)
              </span>
              <span className="ml-2">
                {campaign.ended ? "Ended" : "Active"}
              </span>
              <span className="ml-2">
                {campaign.fundsWithdrawn
                  ? "Funds Withdrawn"
                  : "Funds Available"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>You haven't created any campaigns yet.</p>
      )}

      <h2 className="text-2xl font-bold my-4">Your Donations</h2>
      {userDonations.length > 0 ? (
        <ul>
          {userDonations.map((donation, index) => (
            <li key={index} className="mb-2">
              <Link
                to={`/campaign/${donation.campaignId}`}
                className="text-blue-500 hover:underline"
              >
                Campaign #{donation.campaignId}
              </Link>
              <span className="ml-2">{donation.amount} ETH</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>You haven't made any donations yet.</p>
      )}
    </div>
  );
}

export default UserDashboard;
