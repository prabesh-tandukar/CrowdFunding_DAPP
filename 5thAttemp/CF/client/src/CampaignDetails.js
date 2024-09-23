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

  useEffect(() => {
    fetchDonors();
    checkOwnership();
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
    } catch (error) {
      console.error("Error donating:", error);
      alert("Failed to make donation. Please try again.");
    }
  }

  async function handleWithdraw() {
    try {
      await onWithdraw(campaign.id);
      alert("Funds withdrawn successfully!");
      onBack();
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      alert("Failed to withdraw funds. Please try again.");
    }
  }

  const campaignEnded = new Date(campaign.deadline) < new Date();
  const targetReached =
    parseFloat(campaign.amountCollected) >= parseFloat(campaign.target);

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
      <p className="mb-2">
        <strong>Status:</strong> {campaignEnded ? "Ended" : "Active"}
      </p>

      {!campaign.ended && (
        <p className="mb-2">
          <strong>Time left:</strong>{" "}
          <CountdownTimer deadline={campaign.deadline} />
        </p>
      )}

      {!campaignEnded && (
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

      {isOwner &&
        campaign.ended &&
        parseFloat(campaign.amountCollected) > 0 && (
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
