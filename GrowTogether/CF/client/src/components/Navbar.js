// components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import { useWeb3Context } from "../context/Web3Context";

function Navbar() {
  const { connectWallet, connected, userAddress } = useWeb3Context();

  return (
    <nav className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">
          Crowdfunding Dapp
        </Link>
        <div className="space-x-4">
          <Link to="/" className="text-white">
            Home
          </Link>
          <Link to="/campaigns" className="text-white">
            Campaigns
          </Link>
          <Link to="/create-campaign" className="text-white">
            Create Campaign
          </Link>
          <Link to="/dashboard" className="text-white">
            Dashboard
          </Link>
          {!connected ? (
            <button
              onClick={connectWallet}
              className="bg-white text-blue-500 px-4 py-2 rounded"
            >
              Connect Wallet
            </button>
          ) : (
            <span className="text-white">
              Connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
