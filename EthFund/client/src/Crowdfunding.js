import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import CrowdfundingArtifact from "./artifacts/Crowdfunding.sol/Crowdfunding.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function Crowdfunding() {
  const [contract, setContract] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            CrowdfundingArtifact.abi,
            signer
          );
          setContract(contract);
          console.log("Contract initialized:", contract);
        } catch (error) {
          console.error("Error initializing contract:", error);
          setError(
            "Failed to initialize contract. Please check your MetaMask connection."
          );
        }
      } else {
        setError("Please install MetaMask!");
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (contract) {
      console.log("Contract initialized in useEffect:", contract);
      console.log("Contract methods:", Object.keys(contract));

      // Correctly access campaignCount
      contract
        .campaignCount()
        .then((count) => {
          console.log("Campaign count:", count.toString());
        })
        .catch((error) =>
          console.error("Error fetching campaignCount:", error)
        );

      getCampaigns();
    }
  }, [contract]);

  const createCampaign = async (event) => {
    event.preventDefault();
    if (!contract) {
      setError(
        "Contract not initialized. Please check your MetaMask connection."
      );
      return;
    }

    const title = event.target.title.value;
    const description = event.target.description.value;
    const goal = ethers.parseEther(event.target.goal.value);
    const duration = event.target.duration.value;

    try {
      const tx = await contract.createCampaign(
        title,
        description,
        goal,
        duration
      );
      await tx.wait();
      console.log("Campaign created successfully!");
      setError(null);
      getCampaigns(); // Fetch campaigns after creating a new one
    } catch (error) {
      console.error("Error creating campaign:", error);
      setError(`Failed to create campaign: ${error.message}`);
    }
  };

  const getCampaigns = async () => {
    if (!contract) {
      console.error("Contract is not initialized");
      return;
    }
    try {
      console.log("Fetching campaign count...");
      const campaignCount = await contract.campaignCount();
      const totalCampaigns = campaignCount.toNumber();
      console.log("Campaign count:", totalCampaigns);

      const fetchedCampaigns = [];
      for (let i = 1; i <= totalCampaigns; i++) {
        console.log(`Fetching details for campaign ${i}...`);
        try {
          const campaign = await contract.getCampaignDetails(i);
          console.log(`Campaign ${i} details:`, campaign);
          fetchedCampaigns.push({
            id: i,
            title: campaign[1], // Accessing by index as getCampaignDetails returns an array
            description: campaign[2],
            goal: ethers.formatEther(campaign[3]),
            deadline: new Date(Number(campaign[4]) * 1000).toLocaleString(),
            amountRaised: ethers.formatEther(campaign[5]),
            creator: campaign[0],
          });
        } catch (campaignError) {
          console.error(`Error fetching campaign ${i}:`, campaignError);
        }
      }
      console.log("All campaigns fetched:", fetchedCampaigns);
      setCampaigns(fetchedCampaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setError(`Failed to fetch campaigns: ${error.message}`);
    }
  };

  const contributeToCompaign = async (campaignId, amount) => {
    if (!contract) return;
    try {
      const tx = await contract.contribute(campaignId, {
        value: ethers.parseEther(amount),
      });
      await tx.wait();
      console.log("Contribution successful!");
      getCampaigns(); // Refresh campaigns after contribution
    } catch (error) {
      console.error("Error contributing to campaign:", error);
      setError("Failed to contribute to campaign");
    }
  };

  const fetchCampaignCount = async () => {
    if (!contract) {
      console.error("Contract is not initialized");
      return;
    }
    try {
      const count = await contract.campaignCount();
      console.log("Campaign count:", count.toString());
      alert(`Campaign count: ${count.toString()}`);
    } catch (error) {
      console.error("Error fetching campaign count:", error);
      setError(`Failed to fetch campaign count: ${error.message}`);
    }
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#333" }}>Crowdfunding DApp</h1>
      {account && (
        <p style={{ textAlign: "right" }}>Connected Account: {account}</p>
      )}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      <div
        style={{
          background: "#f0f0f0",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h2>Create a New Campaign</h2>
        <form
          onSubmit={createCampaign}
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <input
            type="text"
            name="title"
            placeholder="Campaign Title"
            required
            style={{ padding: "8px" }}
          />
          <textarea
            name="description"
            placeholder="Campaign Description"
            required
            style={{ padding: "8px" }}
          ></textarea>
          <input
            type="number"
            name="goal"
            placeholder="Funding Goal (in ETH)"
            required
            style={{ padding: "8px" }}
          />
          <input
            type="number"
            name="duration"
            placeholder="Duration (in days)"
            required
            style={{ padding: "8px" }}
          />
          <button
            type="submit"
            style={{
              padding: "10px",
              background: "#4CAF50",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Create Campaign
          </button>
        </form>
      </div>

      <h2>Existing Campaigns</h2>
      <button
        onClick={fetchCampaignCount}
        style={{
          padding: "10px",
          background: "#FFA500",
          color: "white",
          border: "none",
          cursor: "pointer",
          marginRight: "10px",
        }}
      >
        Fetch Campaign Count
      </button>
      <button
        onClick={getCampaigns}
        style={{
          padding: "10px",
          background: "#008CBA",
          color: "white",
          border: "none",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        Refresh Campaigns
      </button>

      {campaigns.map((campaign) => (
        <div
          key={campaign.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            margin: "10px 0",
            padding: "15px",
          }}
        >
          <h3>{campaign.title}</h3>
          <p>{campaign.description}</p>
          <p>
            <strong>Goal:</strong> {campaign.goal} ETH
          </p>
          <p>
            <strong>Raised:</strong> {campaign.amountRaised} ETH
          </p>
          <p>
            <strong>Deadline:</strong> {campaign.deadline}
          </p>
          <p>
            <strong>Creator:</strong> {campaign.creator}
          </p>
          <div style={{ marginTop: "10px" }}>
            <input
              type="number"
              placeholder="Amount to contribute (ETH)"
              id={`contribute-${campaign.id}`}
              style={{ padding: "8px", marginRight: "10px" }}
            />
            <button
              onClick={() => {
                const amount = document.getElementById(
                  `contribute-${campaign.id}`
                ).value;
                contributeToCompaign(campaign.id, amount);
              }}
              style={{
                padding: "8px",
                background: "#4CAF50",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Contribute
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Crowdfunding;
