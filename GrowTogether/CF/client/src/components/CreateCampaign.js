// pages/CreateCampaign.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3Context } from "../context/Web3Context";
import { ethers } from "ethers";

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

function CreateCampaign() {
  const { contract } = useWeb3Context();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    const title = event.target.title.value;
    const description = event.target.description.value;
    const target = ethers.parseEther(event.target.target.value);
    const deadline = Math.floor(
      new Date(event.target.deadline.value).getTime() / 1000
    );
    const category = parseInt(event.target.category.value);

    try {
      const transaction = await contract.createCampaign(
        title,
        description,
        target,
        deadline,
        category
      );
      await transaction.wait();
      alert("Campaign created successfully!");
      navigate("/campaigns");
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Failed to create campaign. See console for details.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold mb-8">Create Campaign</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <select name="category" required className="w-full p-2 border rounded">
          {categories.map((category, index) => (
            <option key={index} value={index}>
              {category}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create Campaign"}
        </button>
      </form>
    </div>
  );
}

export default CreateCampaign;
