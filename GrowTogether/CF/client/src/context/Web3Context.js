// context/Web3Context.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import Crowdfunding from "../artifacts/contracts/Crowdfunding.sol/Crowdfunding.json";

const Web3Context = createContext();

export function useWeb3Context() {
  return useContext(Web3Context);
}

export function Web3Provider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [connected, setConnected] = useState(false);
  const [userAddress, setUserAddress] = useState(null);

  const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

  async function connectWallet() {
    try {
      const web3Modal = new Web3Modal({
        network: "localhost",
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

      console.log("Connected to wallet");
      console.log("Contract address:", contractAddress);

      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setConnected(true);
      setUserAddress(address);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. See console for details.");
    }
  }

  useEffect(() => {
    if (signer) {
      signer.getAddress().then(setUserAddress);
    }
  }, [signer]);

  const value = {
    provider,
    signer,
    contract,
    connected,
    userAddress,
    connectWallet,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}
