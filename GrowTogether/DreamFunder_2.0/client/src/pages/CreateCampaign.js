import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3Context } from "../context/Web3Context";
import { ethers } from "ethers";
import Footer from "../components/Footer";
import TermsAndConditionsModal from "../components/TermsAndConditionsModal";

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
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const openTermsModal = (e) => {
    e.preventDefault();
    setIsTermsModalOpen(true);
  };

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
      <div className=" mx-auto px-4 py-6 bg-white dark:bg-gray-700">
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
          <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-6">
              Create New Campaign
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Campaign Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter a catchy title for your campaign"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Campaign Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows="4"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your campaign in detail. What are your goals? How will the funds be used?"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="target"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Fund Target (ETH)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="target"
                      id="target"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      Ξ
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="deadline"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Campaign Deadline
                  </label>
                  <input
                    type="datetime-local"
                    name="deadline"
                    id="deadline"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Category
                </label>
                <select
                  name="category"
                  id="category"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="" disabled selected>
                    Select a category
                  </option>
                  {categories.map((category, index) => (
                    <option key={index} value={index}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  required
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
                  I agree to the{" "}
                  <a
                    href="#"
                    onClick={openTermsModal}
                    className="text-blue-500 hover:underline"
                  >
                    terms and conditions
                  </a>
                </label>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Campaign...
                  </span>
                ) : (
                  "Create Campaign"
                )}
              </button>
            </form>
            <TermsAndConditionsModal
              isOpen={isTermsModalOpen}
              onClose={() => setIsTermsModalOpen(false)}
            />
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
