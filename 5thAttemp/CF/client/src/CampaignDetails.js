import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

function CampaignDetails({ campaign, contract, onBack, onDonate }) {
  const [donors, setDonors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDonors();
  }, []);

  async function fetchDonors() {
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
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching donors:", error);
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4">
      <button
        onClick={onBack}
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Back to Campaigns
      </button>
      <h1 className="text-4xl font-bold mb-4">{campaign.title}</h1>
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

      <button
        onClick={() =>
          onDonate(campaign.id, prompt("Enter amount to donate (in ETH):"))
        }
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 mb-8"
      >
        Donate to this Campaign
      </button>

      <h2 className="text-2xl font-bold mb-4">Donors</h2>
      {isLoading ? (
        <p>Loading donor information...</p>
      ) : donors.length > 0 ? (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Address</th>
              <th className="border border-gray-300 p-2">Amount (ETH)</th>
              <th className="border border-gray-300 p-2">Timestamp</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No donations yet.</p>
      )}
    </div>
  );
}

export default CampaignDetails;
