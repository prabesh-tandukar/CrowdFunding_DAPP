import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import ProgressBar from "./ProgressBar";

function UserDashboard({ contract, userAddress, onBack }) {
  const [userCampaigns, setUserCampaigns] = useState([]);
  const [userDonations, setUserDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (contract && userAddress) {
      fetchUserData();
    }
  }, [contract, userAddress]);

  async function fetchUserData() {
    setIsLoading(true);
    try {
      console.log("Fetching user data for address:", userAddress);
      const campaigns = await fetchUserCampaigns();
      const donations = await fetchUserDonations();
      setUserCampaigns(campaigns);
      setUserDonations(donations);
      console.log("Fetched user campaigns:", campaigns);
      console.log("Fetched user donations:", donations);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchUserCampaigns() {
    const campaignCount = await contract.numberOfCampaigns();
    console.log("Total number of campaigns:", campaignCount.toString());
    const userCampaigns = [];

    for (let i = 0; i < campaignCount; i++) {
      const campaign = await contract.getCampaignDetails(i);
      console.log(`Campaign ${i} owner:`, campaign[0]);
      console.log(`User address:`, userAddress);
      if (campaign[0].toLowerCase() === userAddress.toLowerCase()) {
        userCampaigns.push({
          id: i,
          title: campaign[1],
          description: campaign[2],
          target: ethers.formatEther(campaign[3]),
          deadline: new Date(Number(campaign[4]) * 1000).toLocaleString(),
          amountCollected: ethers.formatEther(campaign[5]),
        });
      }
    }

    return userCampaigns;
  }

  async function fetchUserDonations() {
    const campaignCount = await contract.numberOfCampaigns();
    const userDonations = [];

    for (let i = 0; i < campaignCount; i++) {
      const donationAmount = await contract.getDonationAmount(i, userAddress);
      console.log(
        `Donation amount for campaign ${i}:`,
        donationAmount.toString()
      );
      if (donationAmount > 0) {
        const campaign = await contract.getCampaignDetails(i);
        userDonations.push({
          campaignId: i,
          campaignTitle: campaign[1],
          amount: ethers.formatEther(donationAmount),
        });
      }
    }

    return userDonations;
  }

  if (isLoading) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <button
        onClick={onBack}
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Back to Campaigns
      </button>
      <h1 className="text-4xl font-bold mb-8">User Dashboard</h1>

      <h2 className="text-2xl font-bold mb-4">Your Campaigns</h2>
      {userCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userCampaigns.map((campaign) => (
            <div key={campaign.id} className="border rounded p-4">
              <h3 className="text-xl font-bold">{campaign.title}</h3>
              <p>{campaign.description}</p>
              <p>Target: {campaign.target} ETH</p>
              <p>Collected: {campaign.amountCollected} ETH</p>
              <ProgressBar
                current={parseFloat(campaign.amountCollected)}
                target={parseFloat(campaign.target)}
              />
              <p>Deadline: {campaign.deadline}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>You haven't created any campaigns yet.</p>
      )}

      <h2 className="text-2xl font-bold my-4">Your Donations</h2>
      {userDonations.length > 0 ? (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Campaign</th>
              <th className="border border-gray-300 p-2">Amount (ETH)</th>
            </tr>
          </thead>
          <tbody>
            {userDonations.map((donation, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">
                  {donation.campaignTitle}
                </td>
                <td className="border border-gray-300 p-2">
                  {donation.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>You haven't made any donations yet.</p>
      )}
    </div>
  );
}

export default UserDashboard;
