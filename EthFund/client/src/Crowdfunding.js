import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import CrowdfundingArtifact from "./artifacts/Crowdfunding.sol/Crowdfunding.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your actual deployed contract address

function Crowdfunding() {
  const [contract, setContract] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = (error, context) => {
    console.error(`Error in ${context}:`, error);
    if (error.code === "NETWORK_ERROR") {
      setError(`Network error. Please check your connection and try again.`);
    } else if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
      setError(`Transaction error. The operation might have failed.`);
    } else {
      setError(`${context} failed: ${error.message}`);
    }
  };

  const init = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const newContract = new ethers.Contract(
          contractAddress,
          CrowdfundingArtifact.abi,
          signer
        );
        setContract(newContract);
        console.log("Contract initialized:", newContract);

        const address = await signer.getAddress();
        setAccount(address);
      } catch (error) {
        handleError(error, "initializing contract");
      }
    } else {
      setError("Please install MetaMask!");
    }
  };

  useEffect(() => {
    init();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0]);
        init();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
      }
    };
  }, []);

  useEffect(() => {
    if (contract) {
      console.log("Contract initialized in useEffect:", contract);
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

    const title = event.target.title.value.trim();
    const description = event.target.description.value.trim();
    const goal = event.target.goal.value;
    const duration = event.target.duration.value;

    if (!title || !description || !goal || !duration) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setIsLoading(true);
      const tx = await contract.createCampaign(
        title,
        description,
        ethers.parseEther(goal),
        duration
      );
      await tx.wait();
      console.log("Campaign created successfully!");
      setError(null);
      getCampaigns();
    } catch (error) {
      handleError(error, "creating campaign");
    } finally {
      setIsLoading(false);
    }
  };

  const getCampaigns = async () => {
    if (!contract) {
      console.error("Contract is not initialized");
      return;
    }
    setIsLoading(true);
    try {
      const campaignCount = await contract.campaignCount();
      const totalCampaigns = campaignCount.toNumber();
      console.log("Total campaigns:", totalCampaigns);

      const fetchedCampaigns = [];
      for (let i = 1; i <= totalCampaigns; i++) {
        try {
          const campaign = await contract.getCampaignDetails(i);
          fetchedCampaigns.push({
            id: i,
            creator: campaign[0],
            title: campaign[1],
            description: campaign[2],
            goal: ethers.formatEther(campaign[3]),
            deadline: new Date(Number(campaign[4]) * 1000).toLocaleString(),
            amountRaised: ethers.formatEther(campaign[5]),
            claimed: campaign[6],
          });
        } catch (campaignError) {
          console.error(`Error fetching campaign ${i}:`, campaignError);
        }
      }
      console.log("All campaigns fetched:", fetchedCampaigns);
      setCampaigns(fetchedCampaigns);
    } catch (error) {
      handleError(error, "fetching campaigns");
    } finally {
      setIsLoading(false);
    }
  };

  const contributeToCompaign = async (campaignId, amount) => {
    if (!contract) return;
    try {
      setIsLoading(true);
      const tx = await contract.contribute(campaignId, {
        value: ethers.parseEther(amount),
      });
      await tx.wait();
      console.log("Contribution successful!");
      getCampaigns();
    } catch (error) {
      handleError(error, "contributing to campaign");
    } finally {
      setIsLoading(false);
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
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Campaign"}
          </button>
        </form>
      </div>

      <h2>Existing Campaigns</h2>
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
        disabled={isLoading}
      >
        {isLoading ? "Refreshing..." : "Refresh Campaigns"}
      </button>

      {isLoading && <p>Loading campaigns...</p>}
      {!isLoading &&
        campaigns.map((campaign) => (
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
            <p>
              <strong>Claimed:</strong> {campaign.claimed ? "Yes" : "No"}
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
                disabled={isLoading}
              >
                {isLoading ? "Contributing..." : "Contribute"}
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}

export default Crowdfunding;
