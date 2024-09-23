import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import Crowdfunding from "./artifacts/contracts/Crowdfunding.sol/Crowdfunding.json";
import CampaignDetails from "./CampaignDetails";
import CountdownTimer from "./CountdownTimer";
import ProgressBar from "./ProgressBar";
import UserDashboard from "./UserDashboard";

const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // Replace with your actual contract address

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [connected, setConnected] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("all");
  const [showUserDashboard, setShowUserDashboard] = useState(false);
  const [userAddress, setUserAddress] = useState(null);

  useEffect(() => {
    if (contract) {
      fetchCampaigns();
      setupEventListeners();
    }
  }, [contract]);

  async function connectWallet() {
    try {
      const web3Modal = new Web3Modal({
        network: "localhost", // Use "localhost" for Hardhat
        cacheProvider: true,
      });
      const instance = await web3Modal.connect();
      const provider = new ethers.BrowserProvider(instance);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(
        contractAddress,
        Crowdfunding.abi,
        signer
      );

      const network = await provider.getNetwork();
      console.log(
        "Connected to network:",
        network.name,
        "Chain ID:",
        network.chainId
      );

      if (network.chainId !== 31337n) {
        alert("Please connect to the Hardhat network (Chain ID: 31337)");
        return;
      }
      // const contract = new ethers.Contract(
      //   contractAddress,
      //   Crowdfunding.abi,
      //   signer
      // );

      console.log("Connected to wallet");
      console.log("Contract address:", contractAddress);

      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setConnected(true);
      setUserAddress(address);

      try {
        const campaignCount = await contract.numberOfCampaigns();
        console.log("Number of campaigns:", campaignCount.toString());
      } catch (error) {
        console.error("Error calling numberOfCampaigns:", error);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. See console for details.");
    }
  }

  function setupEventListeners() {
    if (contract) {
      contract.on(
        "CampaignCreated",
        (campaignId, owner, title, target, deadline) => {
          console.log("New campaign created:", {
            campaignId,
            owner,
            title,
            target,
            deadline,
          });
          fetchCampaigns();
        }
      );

      contract.on("DonationMade", (campaignId, donor, amount) => {
        console.log("New donation made:", { campaignId, donor, amount });
        fetchCampaigns();
      });

      return () => {
        contract.removeAllListeners("CampaignCreated");
        contract.removeAllListeners("DonationMade");
      };
    }
  }

  async function fetchCampaigns() {
    try {
      const campaignCount = await contract.numberOfCampaigns();
      console.log("Total campaigns:", campaignCount.toString());
      const fetchedCampaigns = [];

      for (let i = 0; i < campaignCount; i++) {
        try {
          const campaign = await contract.getCampaignDetails(i);
          const isEnded = await contract.isCampaignEnded(i);
          fetchedCampaigns.push({
            id: i,
            owner: campaign[0],
            title: campaign[1],
            description: campaign[2],
            target: ethers.formatEther(campaign[3]),
            deadline: new Date(Number(campaign[4]) * 1000).toLocaleString(),
            amountCollected: ethers.formatEther(campaign[5]),
            ended: isEnded,
          });
        } catch (error) {
          console.error(`Error fetching campaign ${i}:`, error);
          if (error.reason) console.error("Error reason:", error.reason);
        }
      }

      setCampaigns(fetchedCampaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      if (error.reason) console.error("Error reason:", error.reason);
      if (error.code) console.error("Error code:", error.code);
      if (error.method) console.error("Error method:", error.method);
      alert("Failed to fetch campaigns. See console for details.");
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
      const transaction = await contract.createCampaign(
        title,
        description,
        target,
        deadline
      );
      console.log("Transaction sent:", transaction.hash);
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
      alert("Failed to create campaign. See console for details.");
    } finally {
      setIsLoading(false);
    }
  }

  async function donateToCampaign(id, amount) {
    try {
      const parsedAmount = ethers.parseEther(amount);
      const transaction = await contract.donateToCampaign(id, {
        value: parsedAmount,
      });
      console.log("Donation transaction sent:", transaction.hash);
      const receipt = await transaction.wait();
      console.log("Donation transaction mined:", receipt);
      if (receipt.status === 1) {
        console.log("Donation successful");
        fetchCampaigns();
      } else {
        console.error("Donation transaction failed");
      }
    } catch (error) {
      console.error("Error donating to campaign:", error);
      alert("Failed to donate. See console for details.");
    }
  }

  async function withdrawFunds(campaignId) {
    try {
      const transaction = await contract.withdrawFunds(campaignId);
      console.log("Withdrawal transaction sent:", transaction.hash);
      const receipt = await transaction.wait();
      console.log("Withdrawal transaction mined:", receipt);
      if (receipt.status === 1) {
        console.log("Funds withdrawn successfully");
        fetchCampaigns();
      } else {
        console.error("Withdrawal transaction failed");
      }
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      alert("Failed to withdraw funds. See console for details.");
    }
  }

  async function checkNetworkAndContract() {
    if (provider) {
      try {
        const network = await provider.getNetwork();
        console.log(
          "Connected to network:",
          network.name,
          "Chain ID:",
          network.chainId
        );

        if (network.chainId !== 31337n) {
          alert("Please connect to the Hardhat network (Chain ID: 31337)");
          return false;
        }

        const code = await provider.getCode(contractAddress);
        if (code === "0x") {
          console.error("No contract deployed at the specified address");
          alert(
            "No contract found at the specified address. Please check your contract deployment."
          );
          return false;
        }

        console.log("Contract is deployed and network is correct");
        return true;
      } catch (error) {
        console.error("Error checking network and contract:", error);
        alert("Failed to check network and contract. See console for details.");
        return false;
      }
    } else {
      alert("Provider not initialized. Please connect your wallet first.");
      return false;
    }
  }

  async function checkConnection() {
    if (provider && signer) {
      try {
        const network = await provider.getNetwork();
        const blockNumber = await provider.getBlockNumber();
        const signerAddress = await signer.getAddress();
        const balance = await provider.getBalance(signerAddress);

        console.log(
          "Connected to network:",
          network.name,
          "Chain ID:",
          network.chainId
        );
        console.log("Current block number:", blockNumber);
        console.log("Connected address:", signerAddress);
        console.log("Account balance:", ethers.formatEther(balance), "ETH");

        alert(
          `Connected to ${network.name} (Chain ID: ${
            network.chainId
          })\nBlock: ${blockNumber}\nAddress: ${signerAddress}\nBalance: ${ethers.formatEther(
            balance
          )} ETH`
        );
      } catch (error) {
        console.error("Error checking connection:", error);
        alert("Failed to check connection. See console for details.");
      }
    } else {
      alert("Not connected. Please connect your wallet first.");
    }
  }

  async function checkContractDeployment() {
    try {
      const code = await provider.getCode(contractAddress);
      if (code === "0x") {
        console.error("No contract deployed at the specified address");
        alert(
          "No contract found at the specified address. Please check your contract deployment."
        );
      } else {
        console.log("Contract is deployed at the specified address");
        alert("Contract is deployed correctly.");
      }
    } catch (error) {
      console.error("Error checking contract deployment:", error);
      alert("Failed to check contract deployment. See console for details.");
    }
  }

  function viewCampaignDetails(campaign) {
    setSelectedCampaign(campaign);
  }

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase());

    const isActive = new Date(campaign.deadline) > new Date();

    switch (filterOption) {
      case "active":
        return matchesSearch && isActive;
      case "ended":
        return matchesSearch && campaign.ended;
      default:
        return matchesSearch;
    }
  });

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

  if (showUserDashboard) {
    return (
      <UserDashboard
        contract={contract}
        userAddress={userAddress}
        onBack={() => setShowUserDashboard(false)}
      />
    );
  }

  if (selectedCampaign) {
    return (
      <CampaignDetails
        campaign={selectedCampaign}
        contract={contract}
        onBack={() => setSelectedCampaign(null)}
        onDonate={donateToCampaign}
        onWithdraw={withdrawFunds}
        signer={signer}
      />
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold mb-8">Crowdfunding Dapp</h1>

      <button
        onClick={() => setShowUserDashboard(true)}
        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        View Your Dashboard
      </button>

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
            step="0.01"
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

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Search and Filter Campaigns</h2>
        <input
          type="text"
          placeholder="Search campaigns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded mr-2"
        />
        <select
          value={filterOption}
          onChange={(e) => setFilterOption(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All Campaigns</option>
          <option value="active">Active Campaigns</option>
          <option value="ended">Ended Campaigns</option>
        </select>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Existing Campaigns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCampaigns.map((campaign) => (
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
              <p>
                Status:{" "}
                {campaign.ended
                  ? "Ended"
                  : new Date(campaign.deadline) < new Date()
                  ? "Deadline Passed"
                  : "Active"}
              </p>
              {!campaign.ended && (
                <p>
                  Time left: <CountdownTimer deadline={campaign.deadline} />
                </p>
              )}
              <button
                onClick={() =>
                  donateToCampaign(
                    campaign.id,
                    prompt("Enter amount to donate (in ETH):")
                  )
                }
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2 mr-2 ${
                  campaign.ended ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={campaign.ended}
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

      <div className="mt-8">
        <button
          onClick={checkConnection}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mr-4"
        >
          Check Connection
        </button>
        <button
          onClick={fetchCampaigns}
          className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
        >
          Refresh Campaigns
        </button>

        <button
          onClick={checkNetworkAndContract}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded ml-4"
        >
          Check Network and Contract
        </button>
      </div>
    </div>
  );
}

export default App;
