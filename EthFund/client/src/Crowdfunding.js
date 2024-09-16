import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import CrowdfundingArtifact from "./artifacts/Crowdfunding.sol/Crowdfunding.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function Crowdfunding() {
  const [contract, setContract] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

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
        } catch (error) {
          console.error("Error initializing contract:", error);
        }
      } else {
        console.log("Please install MetaMask!");
      }
    };

    init();
  }, []);

  const createCampaign = async (event) => {
    event.preventDefault();
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
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
  };

  return (
    <div>
      <h1>Crowdfunding DApp</h1>
      <form onSubmit={createCampaign}>
        <input type="text" name="title" placeholder="Campaign Title" required />
        <input
          type="text"
          name="description"
          placeholder="Campaign Description"
          required
        />
        <input
          type="number"
          name="goal"
          placeholder="Funding Goal (in ETH)"
          required
        />
        <input
          type="number"
          name="duration"
          placeholder="Duration (in days)"
          required
        />
        <button type="submit">Create Campaign</button>
      </form>
    </div>
  );
}

export default Crowdfunding;
