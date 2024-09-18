import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import Crowdfunding from "./artifacts/contracts/Crowdfunding.sol/Crowdfunding.json";
import CampaignDetails from "./CampaignDetails";

const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [connected, setConnected] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    if (contract) {
      fetchCampaigns();
    }
  }, [contract]);

  async function connectWallet() {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.BrowserProvider(connection);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        Crowdfunding.abi,
        signer
      );

      console.log("Connected to wallet");
      console.log("Contract address:", await contract.getAddress());

      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setConnected(true);

      // Test contract call
      try {
        const campaignCount = await contract.numberOfCampaigns();
        console.log("Number of campaigns:", campaignCount.toString());
      } catch (error) {
        console.error("Error calling numberOfCampaigns:", error);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  }

  async function fetchCampaigns() {
    try {
      const campaignCount = await contract.numberOfCampaigns();
      const fetchedCampaigns = [];

      for (let i = 0; i < campaignCount; i++) {
        const campaign = await contract.getCampaignDetails(i);
        fetchedCampaigns.push({
          id: i,
          owner: campaign[0],
          title: campaign[1],
          description: campaign[2],
          target: ethers.formatEther(campaign[3]),
          deadline: new Date(Number(campaign[4]) * 1000).toLocaleString(),
          amountCollected: ethers.formatEther(campaign[5]),
        });
      }

      setCampaigns(fetchedCampaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  }

  async function createCampaign(event) {
    event.preventDefault();
    setIsLoading(true);
    const title = event.target.title.value;
    const description = event.target.description.value;
    const target = ethers.parseEther(event.target.target.value);
    const deadline = Math.floor(
      new Date(event.target.deadline.value).getTime() / 1000
    );

    console.log("Creating campaign with:", {
      title,
      description,
      target: target.toString(),
      deadline,
    });

    try {
      console.log("Calling contract.createCampaign...");
      const transaction = await contract.createCampaign(
        title,
        description,
        target,
        deadline
      );

      console.log("Transaction sent:", transaction.hash);
      console.log("Waiting for transaction to be mined...");
      const receipt = await transaction.wait();
      console.log("Transaction mined:", receipt);

      if (receipt.status === 1) {
        console.log("Campaign created successfully");
        fetchCampaigns();
      } else {
        console.error("Transaction failed");
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      if (error.reason) {
        console.error("Error reason:", error.reason);
      }
      alert(
        "An error occurred while creating the campaign. Please check the console for more details."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function donateToCampaign(id, amount) {
    try {
      const transaction = await contract.donateToCampaign(id, {
        value: ethers.parseEther(amount),
      });
      await transaction.wait();
      fetchCampaigns();
    } catch (error) {
      console.error("Error donating to campaign:", error);
    }
  }

  async function testContract() {
    try {
      console.log("Testing contract...");
      const campaignCount = await contract.numberOfCampaigns();
      console.log("Number of campaigns:", campaignCount.toString());

      // Try to create a test campaign
      const testTransaction = await contract.createCampaign(
        "Test Campaign",
        "This is a test campaign",
        ethers.parseEther("1"),
        Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      );

      console.log("Test transaction sent:", testTransaction.hash);
      const receipt = await testTransaction.wait();
      console.log("Test transaction mined:", receipt);

      const newCampaignCount = await contract.numberOfCampaigns();
      console.log("New number of campaigns:", newCampaignCount.toString());

      // Fetch and log details of the newly created campaign
      const newCampaign = await contract.getCampaignDetails(
        newCampaignCount - 1
      );
      console.log("New campaign details:", newCampaign);
    } catch (error) {
      console.error("Error testing contract:", error);
      if (error.reason) {
        console.error("Error reason:", error.reason);
      }
    }
  }

  function viewCampaignDetails(campaign) {
    setSelectedCampaign(campaign);
  }

  if (!connected) {
    return (
      <div className="flex items-center justify-center h-screen">
        <button
          onClick={connectWallet}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Connect to Wallet
        </button>
      </div>
    );
  }

  if (selectedCampaign) {
    return (
      <CampaignDetails
        campaign={selectedCampaign}
        contract={contract}
        onBack={() => setSelectedCampaign(null)}
        onDonate={donateToCampaign}
      />
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold mb-8">Crowdfunding Dapp</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Create Campaign</h2>
        <form onSubmit={createCampaign} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Campaign Title"
            required
            className="w-full p-2 border rounded"
          />
          <textarea
            name="description"
            placeholder="Campaign Description"
            required
            className="w-full p-2 border rounded"
          ></textarea>
          <input
            type="number"
            name="target"
            placeholder="Fund Target (ETH)"
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="datetime-local"
            name="deadline"
            required
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Campaign"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Existing Campaigns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="border rounded p-4">
              <h3 className="text-xl font-bold">{campaign.title}</h3>
              <p>{campaign.description}</p>
              <p>Target: {campaign.target} ETH</p>
              <p>Deadline: {campaign.deadline}</p>
              <p>Collected: {campaign.amountCollected} ETH</p>
              <button
                onClick={() =>
                  donateToCampaign(
                    campaign.id,
                    prompt("Enter amount to donate (in ETH):")
                  )
                }
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
              >
                Donate
              </button>
              <button
                onClick={() => viewCampaignDetails(campaign)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={testContract}
        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mt-4"
      >
        Test Contract
      </button>
    </div>
  );
}

export default App;
