import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useWeb3Context } from "../context/Web3Context";
import { ethers } from "ethers";
import Footer from "./Footer";
import ProgressBar from "../components/ProgressBar";
import CountdownTimer from "../components/CountdownTimer";

function UserDashboard() {
  const { contract, userAddress } = useWeb3Context();
  const [userCampaigns, setUserCampaigns] = useState([]);
  const [userDonations, setUserDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserCampaigns = useCallback(async () => {
    if (!contract || !userAddress) return;
    try {
      setIsLoading(true);
      setError(null);
      const campaignCount = await contract.numberOfCampaigns();
      const userCampaigns = [];

      for (let i = 0; i < campaignCount; i++) {
        const campaign = await contract.getCampaignDetails(i);
        if (campaign[0].toLowerCase() === userAddress.toLowerCase()) {
          const donors = await contract.getCampaignDonors(i);
          const donations = await Promise.all(
            donors.map(async (donor) => {
              const amount = await contract.getDonationAmount(i, donor);
              return {
                donor: donor,
                amount: ethers.formatEther(amount),
              };
            })
          );

          userCampaigns.push({
            id: i,
            title: campaign[1],
            description: campaign[2],
            target: ethers.formatEther(campaign[3]),
            deadline: new Date(Number(campaign[4]) * 1000).toLocaleString(),
            amountCollected: ethers.formatEther(campaign[5]),
            ended: campaign[6],
            fundsWithdrawn: campaign[7],
            category: campaign[8],
            donors: donations,
          });
        }
      }

      setUserCampaigns(userCampaigns);
    } catch (error) {
      console.error("Error fetching user campaigns:", error);
      setError("Failed to fetch user campaigns. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [contract, userAddress]);

  const fetchUserDonations = useCallback(async () => {
    if (!contract || !userAddress) return;
    try {
      setIsLoading(true);
      setError(null);
      const campaignCount = await contract.numberOfCampaigns();
      const userDonations = [];

      for (let i = 0; i < campaignCount; i++) {
        const amount = await contract.getDonationAmount(i, userAddress);
        if (amount > 0) {
          // Changed from amount.gt(0) to amount > 0
          const campaignDetails = await contract.getCampaignDetails(i);
          userDonations.push({
            campaignId: i,
            campaignTitle: campaignDetails[1],
            campaignDescription: campaignDetails[2],
            target: ethers.formatEther(campaignDetails[3]),
            amountCollected: ethers.formatEther(campaignDetails[5]),
            deadline: new Date(Number(campaignDetails[4]) * 1000),
            amount: ethers.formatEther(amount),
            donationDate: new Date(),
          });
        }
      }

      setUserDonations(userDonations);
    } catch (error) {
      console.error("Error fetching user donations:", error);
      setError("Failed to fetch user donations. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [contract, userAddress]);

  useEffect(() => {
    if (contract && userAddress) {
      fetchUserCampaigns();
      fetchUserDonations();
    }
  }, [contract, userAddress, fetchUserCampaigns, fetchUserDonations]);

  if (isLoading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <section className="flex-grow bg-gray-50 py-4 antialiased dark:bg-gray-700 md:py-6">
        <div className="py-4 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6 h-full flex flex-col">
          <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
            Your Dashboard
          </h1>

          <div className="space-y-12 flex-grow">
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                Your Campaigns
              </h2>
              {userCampaigns.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {userCampaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex flex-col justify-between rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
                    >
                      <div>
                        <h3 className="mb-2 text-xl font-bold text-white">
                          {campaign.title}
                        </h3>
                        <p className="mb-4 text-sm text-gray-400 line-clamp-2">
                          {campaign.description}
                        </p>
                        <div className="space-y-2 text-sm">
                          <p className="flex justify-between">
                            <span className="text-gray-400">Target:</span>
                            <span className="text-gray-200">
                              {campaign.target} ETH
                            </span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-gray-400">Collected:</span>
                            <span className="text-gray-200">
                              {campaign.amountCollected} ETH
                            </span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-gray-400">Deadline:</span>
                            <span className="text-gray-200">
                              {new Date(campaign.deadline).toLocaleDateString()}
                            </span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-gray-400">Status:</span>
                            <span
                              className={`font-medium ${
                                campaign.fundsWithdrawn
                                  ? "text-gray-400"
                                  : campaign.ended
                                  ? "text-red-400"
                                  : "text-green-400"
                              }`}
                            >
                              {campaign.fundsWithdrawn
                                ? "Funds Withdrawn"
                                : campaign.ended
                                ? "Ended"
                                : "Active"}
                            </span>
                          </p>
                          {!campaign.ended && !campaign.fundsWithdrawn && (
                            <p className="flex justify-between">
                              <span className="text-gray-400">Time left:</span>
                              <span className="text-gray-200">
                                <CountdownTimer deadline={campaign.deadline} />
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-6 space-y-4">
                        <ProgressBar
                          current={parseFloat(campaign.amountCollected)}
                          target={parseFloat(campaign.target)}
                        />
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2">
                            Donors
                          </h4>
                          {campaign.donors.length > 0 ? (
                            <ul className="space-y-1 max-h-40 overflow-y-auto">
                              {campaign.donors.map((donation, index) => (
                                <li
                                  key={index}
                                  className="text-sm text-gray-400"
                                >
                                  <span className="text-gray-300">
                                    {donation.donor.slice(0, 6)}...
                                    {donation.donor.slice(-4)}:
                                  </span>{" "}
                                  {donation.amount} ETH
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-400">
                              No donations yet
                            </p>
                          )}
                        </div>
                        <Link
                          to={`/campaign/${campaign.id}`}
                          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-800 transition-colors duration-300"
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
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-200 sm:text-xl">
                  You haven't created any campaigns yet.
                </p>
              )}
            </div>

            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                Your Donations
              </h2>
              {userDonations.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {userDonations.map((donation, index) => (
                    <div
                      key={index}
                      className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                    >
                      <div>
                        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                          {donation.campaignTitle}
                        </h3>
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                          {donation.campaignDescription.length > 100
                            ? `${donation.campaignDescription.substring(
                                0,
                                100
                              )}...`
                            : donation.campaignDescription}
                        </p>
                        <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Your Donation:{" "}
                          <span className="text-green-600 dark:text-green-400">
                            {donation.amount} ETH
                          </span>
                        </p>
                        <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Campaign Target: {donation.target} ETH
                        </p>
                        <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Amount Collected: {donation.amountCollected} ETH
                        </p>
                        <ProgressBar
                          current={parseFloat(donation.amountCollected)}
                          target={parseFloat(donation.target)}
                        />
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Donated on:{" "}
                          {donation.donationDate.toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Campaign ends:{" "}
                          {donation.deadline.toLocaleDateString()}
                        </p>
                      </div>
                      <Link
                        to={`/campaign/${donation.campaignId}`}
                        className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                      >
                        View Campaign
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
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-200 sm:text-xl">
                  You haven't made any donations yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default UserDashboard;
