import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useWeb3Context } from "../context/Web3Context";
import { ethers } from "ethers";
import ProgressBar from "../components/ProgressBar";
import CountdownTimer from "../components/CountdownTimer";
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

function Campaigns() {
  const { contract } = useWeb3Context();
  const [campaigns, setCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    if (!contract) return;
    try {
      const campaignCount = await contract.numberOfCampaigns();
      console.log("Total campaigns:", campaignCount.toString());
      const fetchedCampaigns = [];

      for (let i = 0; i < campaignCount; i++) {
        try {
          const campaign = await contract.getCampaignDetails(i);
          fetchedCampaigns.push({
            id: i,
            owner: campaign[0],
            title: campaign[1],
            description: campaign[2],
            target: ethers.formatEther(campaign[3]),
            deadline: new Date(Number(campaign[4]) * 1000).toLocaleString(),
            amountCollected: ethers.formatEther(campaign[5]),
            ended: campaign[6],
            fundsWithdrawn: campaign[7],
            category: campaign[8],
          });
        } catch (error) {
          console.error(`Error fetching campaign ${i}:`, error);
        }
      }

      setCampaigns(fetchedCampaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      alert("Failed to fetch campaigns. See console for details.");
    }
  }, [contract]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const filteredCampaigns = campaigns.filter((campaign) => {
    return (
      (categoryFilter === "all" ||
        campaign.category.toString() === categoryFilter) &&
      (campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <>
      <section className="bg-gray-50 py-8 antialiased dark:bg-gray-700 md:py-12">
        <div className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
          <div className="mx-auto w-full px-4 2xl:px-0">
            {/* Heading & Filters */}
            <div className="mb-4 items-end justify-between space-y-4 sm:flex sm:space-y-0 md:mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                  Existing Campaigns
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsFilterModalOpen(true)}
                  type="button"
                  className="flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 sm:w-auto"
                >
                  <svg
                    className="-ms-0.5 me-2 h-4 w-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="2"
                      d="M18.796 4H5.204a1 1 0 0 0-.753 1.659l5.302 6.058a1 1 0 0 1 .247.659v4.874a.5.5 0 0 0 .2.4l3 2.25a.5.5 0 0 0 .8-.4v-7.124a1 1 0 0 1 .247-.659l5.302-6.059c.566-.646.106-1.658-.753-1.658Z"
                    />
                  </svg>
                  Filters
                </button>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category, index) => (
                    <option key={index} value={index}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {filteredCampaigns.length > 0 ? (
              <>
                {/* Campaigns Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredCampaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                    >
                      <div>
                        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                          {campaign.title}
                        </h3>
                        <p className="mb-4 text-sm text-gray-400 dark:text-gray-300">
                          {campaign.description}
                        </p>
                        <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Category: {categories[campaign.category]}
                        </p>
                        <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Target: {campaign.target} ETH
                        </p>
                        <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Collected: {campaign.amountCollected} ETH
                        </p>
                        <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Deadline: {campaign.deadline}
                        </p>
                        <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Status:{" "}
                          {campaign.fundsWithdrawn
                            ? "Funds Withdrawn"
                            : campaign.ended
                            ? "Ended"
                            : "Active"}
                        </p>
                        {!campaign.ended && !campaign.fundsWithdrawn && (
                          <p className="mb-4 text-sm font-medium text-gray-900 dark:text-white">
                            Time left:{" "}
                            <CountdownTimer deadline={campaign.deadline} />
                          </p>
                        )}
                      </div>
                      <div className="mt-auto">
                        <ProgressBar
                          current={parseFloat(campaign.amountCollected)}
                          target={parseFloat(campaign.target)}
                        />
                        <Link
                          to={`/campaign/${campaign.id}`}
                          className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                        >
                          View Details
                          <svg
                            className="ml-2 -mr-1 h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show More Button */}
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
                  >
                    Show more
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-8 text-center">
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  No campaigns found. Be the first to create one!
                </p>
                <Link
                  to="/create-campaign"
                  className="mt-4 inline-flex items-center rounded-lg bg-primary-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                >
                  Create Campaign
                  <svg
                    className="ml-2 -mr-1 h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </Link>
              </div>
            )}
          </div>

          {/* Filter Modal */}
          {isFilterModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900 bg-opacity-50">
              <div className="relative max-w-xl rounded-lg bg-white p-8 shadow dark:bg-gray-800">
                <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  Filters
                </h3>
                {/* Add your filter options here */}
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="mt-4 rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}

export default Campaigns;

// // pages/Campaigns.js
// import React, { useState, useEffect, useCallback } from "react";
// import { Link } from "react-router-dom";
// import { useWeb3Context } from "../context/Web3Context";
// import { ethers } from "ethers";
// import ProgressBar from "../components/ProgressBar";
// import CountdownTimer from "../components/CountdownTimer";

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

// function Campaigns() {
//   const { contract } = useWeb3Context();
//   const [campaigns, setCampaigns] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("all");

//   const fetchCampaigns = useCallback(async () => {
//     if (!contract) return;
//     try {
//       const campaignCount = await contract.numberOfCampaigns();
//       console.log("Total campaigns:", campaignCount.toString());
//       const fetchedCampaigns = [];

//       for (let i = 0; i < campaignCount; i++) {
//         try {
//           const campaign = await contract.getCampaignDetails(i);
//           fetchedCampaigns.push({
//             id: i,
//             owner: campaign[0],
//             title: campaign[1],
//             description: campaign[2],
//             target: ethers.formatEther(campaign[3]),
//             deadline: new Date(Number(campaign[4]) * 1000).toLocaleString(),
//             amountCollected: ethers.formatEther(campaign[5]),
//             ended: campaign[6],
//             fundsWithdrawn: campaign[7],
//             category: campaign[8],
//           });
//         } catch (error) {
//           console.error(`Error fetching campaign ${i}:`, error);
//         }
//       }

//       setCampaigns(fetchedCampaigns);
//     } catch (error) {
//       console.error("Error fetching campaigns:", error);
//       alert("Failed to fetch campaigns. See console for details.");
//     }
//   }, [contract]);

//   useEffect(() => {
//     fetchCampaigns();
//   }, [fetchCampaigns]);

//   const filteredCampaigns = campaigns.filter((campaign) => {
//     return (
//       (categoryFilter === "all" ||
//         campaign.category.toString() === categoryFilter) &&
//       (campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         campaign.description.toLowerCase().includes(searchTerm.toLowerCase()))
//     );
//   });

//   return (
//     <div className="container mx-auto px-4">
//       <h1 className="text-4xl font-bold mb-8">Existing Campaigns</h1>

//       <div className="mb-8">
//         <input
//           type="text"
//           placeholder="Search campaigns..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="p-2 border rounded mr-2"
//         />
//         <select
//           value={categoryFilter}
//           onChange={(e) => setCategoryFilter(e.target.value)}
//           className="p-2 border rounded"
//         >
//           <option value="all">All Categories</option>
//           {categories.map((category, index) => (
//             <option key={index} value={index}>
//               {category}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {filteredCampaigns.map((campaign) => (
//           <div key={campaign.id} className="border rounded p-4">
//             <h3 className="text-xl font-bold">{campaign.title}</h3>
//             <p>{campaign.description}</p>
//             <p>Category: {categories[campaign.category]}</p>
//             <p>Target: {campaign.target} ETH</p>
//             <p>Collected: {campaign.amountCollected} ETH</p>
//             <ProgressBar
//               current={parseFloat(campaign.amountCollected)}
//               target={parseFloat(campaign.target)}
//             />
//             <p>Deadline: {campaign.deadline}</p>
//             <p>
//               Status:{" "}
//               {campaign.fundsWithdrawn
//                 ? "Funds Withdrawn"
//                 : campaign.ended
//                 ? "Ended"
//                 : "Active"}
//             </p>
//             {!campaign.ended && !campaign.fundsWithdrawn && (
//               <p>
//                 Time left: <CountdownTimer deadline={campaign.deadline} />
//               </p>
//             )}
//             <Link
//               to={`/campaign/${campaign.id}`}
//               className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2 inline-block"
//             >
//               View Details
//             </Link>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default Campaigns;
