import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3Context } from "../context/Web3Context";
import { ethers } from "ethers";
import Footer from "../components/Footer";

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

const steps = [
  {
    number: 1,
    title: "Fill in campaign details",
    description: "Provide basic information about your campaign.",
  },
  {
    number: 2,
    title: "Set funding goal",
    description: "Decide how much funding you need.",
  },
  {
    number: 3,
    title: "Choose deadline",
    description: "Set a time limit for your campaign.",
  },
  {
    number: 4,
    title: "Select category",
    description: "Pick a category that best fits your campaign.",
  },
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
    <>
      <div className=" mx-auto px-4 py-8 bg-white dark:bg-gray-800">
        <div className="flex flex-col md:flex-row gap-8 py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
          <div className="md:w-1/3">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              Create a New Campaign
            </h1>
            <p className="text-gray-500 sm:text-xl dark:text-gray-400 mb-8">
              Launch your fundraising campaign and connect with supporters
              around the world.
            </p>

            <div className="space-y-4 pl-6">
              {steps.map((step) => (
                <div key={step.number} className="flex items-start">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-bold mr-3">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:w-2/3">
            <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
              <div className="mb-5">
                <label
                  htmlFor="title"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Campaign Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Enter campaign title"
                  required
                />
              </div>
              <div className="mb-5">
                <label
                  htmlFor="description"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Campaign Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows="4"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Write campaign description here"
                  required
                ></textarea>
              </div>
              <div className="mb-5">
                <label
                  htmlFor="target"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Fund Target (ETH)
                </label>
                <input
                  type="number"
                  name="target"
                  id="target"
                  step="0.01"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Enter fund target"
                  required
                />
              </div>
              <div className="mb-5">
                <label
                  htmlFor="deadline"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Deadline
                </label>
                <input
                  type="datetime-local"
                  name="deadline"
                  id="deadline"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-5">
                <label
                  htmlFor="category"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Category
                </label>
                <select
                  name="category"
                  id="category"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                >
                  {categories.map((category, index) => (
                    <option key={index} value={index}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Campaign"}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default CreateCampaign;

// // pages/CreateCampaign.js
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useWeb3Context } from "../context/Web3Context";
// import { ethers } from "ethers";

// const categories = [
//   "Technology",
//   "Arts",
//   "Health",
//   "Education",
//   "Environment",
//   "Community",
//   "Business",
//   "Other",
// ];

// function CreateCampaign() {
//   const { contract } = useWeb3Context();
//   const [isLoading, setIsLoading] = useState(false);
//   const navigate = useNavigate();

//   async function handleSubmit(event) {
//     event.preventDefault();
//     setIsLoading(true);
//     const title = event.target.title.value;
//     const description = event.target.description.value;
//     const target = ethers.parseEther(event.target.target.value);
//     const deadline = Math.floor(
//       new Date(event.target.deadline.value).getTime() / 1000
//     );
//     const category = parseInt(event.target.category.value);

//     try {
//       const transaction = await contract.createCampaign(
//         title,
//         description,
//         target,
//         deadline,
//         category
//       );
//       await transaction.wait();
//       alert("Campaign created successfully!");
//       navigate("/campaigns");
//     } catch (error) {
//       console.error("Error creating campaign:", error);
//       alert("Failed to create campaign. See console for details.");
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   return (
//     <div className="container mx-auto px-4">
//       <h1 className="text-4xl font-bold mb-8">Create Campaign</h1>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input
//           type="text"
//           name="title"
//           placeholder="Campaign Title"
//           required
//           className="w-full p-2 border rounded"
//         />
//         <textarea
//           name="description"
//           placeholder="Campaign Description"
//           required
//           className="w-full p-2 border rounded"
//         ></textarea>
//         <input
//           type="number"
//           name="target"
//           placeholder="Fund Target (ETH)"
//           step="0.01"
//           required
//           className="w-full p-2 border rounded"
//         />
//         <input
//           type="datetime-local"
//           name="deadline"
//           required
//           className="w-full p-2 border rounded"
//         />
//         <select name="category" required className="w-full p-2 border rounded">
//           {categories.map((category, index) => (
//             <option key={index} value={index}>
//               {category}
//             </option>
//           ))}
//         </select>
//         <button
//           type="submit"
//           className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
//           disabled={isLoading}
//         >
//           {isLoading ? "Creating..." : "Create Campaign"}
//         </button>
//       </form>
//     </div>
//   );
// }

// export default CreateCampaign;
