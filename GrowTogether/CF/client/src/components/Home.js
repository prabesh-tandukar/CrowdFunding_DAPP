// pages/Home.js
import React from "react";
import { Link } from "react-router-dom";
import { useWeb3Context } from "../context/Web3Context";

function Home() {
  const { connected } = useWeb3Context();

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold mb-8">Welcome to Crowdfunding Dapp</h1>
      <p className="mb-4">
        Empower creators and support innovative projects through decentralized
        crowdfunding.
      </p>
      {connected ? (
        <div className="space-x-4">
          <Link
            to="/campaigns"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            View Campaigns
          </Link>
          <Link
            to="/create-campaign"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Create Campaign
          </Link>
        </div>
      ) : (
        <p>Please connect your wallet to get started.</p>
      )}
    </div>
  );
}

export default Home;
