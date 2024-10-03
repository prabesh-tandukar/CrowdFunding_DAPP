// pages/Campaigns.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWeb3Context } from "../context/Web3Context";
import { ethers } from "ethers";
import ProgressBar from "../components/ProgressBar";
import CountdownTimer from "../components/CountdownTimer";

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

function Campaigns() {
  const { contract } = useWeb3Context();
  const [campaigns, setCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    if (contract) {
      fetchCampaigns();
    }
  }, [contract]);

  async function fetchCampaigns() {
    try {
      const campaignCount = await contract.numberOfCampaigns();
      console.log("Total campaigns:", campaignCount.toString());
      const fetchedCampaigns = [];

      for (let i = 0; i < campaignCount; i++) {
        try {
          const campaign = await contract.getCampaignDetails(i);
          fetchedCampaigns.push({
            id: i,
            owner: campaign[0],
            title: campaign[1],
            description: campaign[2],
            target: ethers.formatEther(campaign[3]),
            deadline: new Date(Number(campaign[4]) * 1000).toLocaleString(),
            amountCollected: ethers.formatEther(campaign[5]),
            ended: campaign[6],
            fundsWithdrawn: campaign[7],
            category: campaign[8],
          });
        } catch (error) {
          console.error(`Error fetching campaign ${i}:`, error);
        }
      }

      setCampaigns(fetchedCampaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      alert("Failed to fetch campaigns. See console for details.");
    }
  }

  const filteredCampaigns = campaigns.filter((campaign) => {
    return (
      (categoryFilter === "all" ||
        campaign.category.toString() === categoryFilter) &&
      (campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold mb-8">Existing Campaigns</h1>

      <div className="mb-8">
        <input
          type="text"
          placeholder="Search campaigns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded mr-2"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All Categories</option>
          {categories.map((category, index) => (
            <option key={index} value={index}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} className="border rounded p-4">
            <h3 className="text-xl font-bold">{campaign.title}</h3>
            <p>{campaign.description}</p>
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
            <Link
              to={`/campaign/${campaign.id}`}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2 inline-block"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Campaigns;
