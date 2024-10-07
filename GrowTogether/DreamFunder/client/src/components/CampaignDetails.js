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

function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contract, userAddress } = useWeb3Context();
  const [campaign, setCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
        category: campaignData[8],
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
      alert("Failed to withdraw funds. See console for details.");
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">{campaign.title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Campaign Details</h2>
            <p className="mb-4">{campaign.description}</p>
            <p className="mb-2">
              <strong>Category:</strong> {categories[campaign.category]}
            </p>
            <p className="mb-2">
              <strong>Target:</strong> {campaign.target} ETH
            </p>
            <p className="mb-2">
              <strong>Collected:</strong> {campaign.amountCollected} ETH
            </p>
            <p className="mb-2">
              <strong>Deadline:</strong> {campaign.deadline}
            </p>
            <p className="mb-4">
              <strong>Status:</strong>{" "}
              {campaign.fundsWithdrawn
                ? "Funds Withdrawn"
                : campaign.ended
                ? "Ended"
                : "Active"}
            </p>
            <ProgressBar
              current={parseFloat(campaign.amountCollected)}
              target={parseFloat(campaign.target)}
            />
            {!campaign.ended && !campaign.fundsWithdrawn && (
              <p className="mt-4">
                <strong>Time left:</strong>{" "}
                <CountdownTimer deadline={campaign.deadline} />
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Donations</h2>
            {donations.length > 0 ? (
              <ul className="space-y-2">
                {donations.map((donation, index) => (
                  <li key={index}>
                    {donation.donor} donated {donation.amount} ETH
                  </li>
                ))}
              </ul>
            ) : (
              <p>No donations yet.</p>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Make a Donation</h2>
            {!campaign.ended && !campaign.fundsWithdrawn ? (
              <div>
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="Amount to donate (ETH)"
                  className="w-full p-2 mb-4 border rounded"
                />
                <button
                  onClick={handleDonate}
                  className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Donate
                </button>
              </div>
            ) : (
              <p>This campaign is no longer accepting donations.</p>
            )}
          </div>

          {canWithdraw && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Withdraw Funds</h2>
              <button
                onClick={handleWithdraw}
                className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Withdraw Funds
              </button>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => navigate("/campaigns")}
        className="mt-8 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
      >
        Back to Campaigns
      </button>
    </div>
  );
}

export default CampaignDetails;
