// components/UserDashboard.js
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

  useEffect(() => {
    if (contract && userAddress) {
      fetchUserCampaigns();
      fetchUserDonations();
    }
  }, [contract, userAddress]);

  const fetchUserCampaigns = useCallback(async () => {
    if (!contract || !userAddress) return;
    try {
      const campaignCount = await contract.numberOfCampaigns();
      const userCampaigns = [];

      for (let i = 0; i < campaignCount; i++) {
        const campaign = await contract.getCampaignDetails(i);
        if (campaign[0].toLowerCase() === userAddress.toLowerCase()) {
          userCampaigns.push({
            id: i,
            title: campaign[1],
            target: ethers.formatEther(campaign[3]),
            amountCollected: ethers.formatEther(campaign[5]),
            deadline: new Date(Number(campaign[4]) * 1000).toLocaleString(),
            ended: campaign[6],
            fundsWithdrawn: campaign[7],
          });
        }
      }

      setUserCampaigns(userCampaigns);
    } catch (error) {
      console.error("Error fetching user campaigns:", error);
    }
  }, [contract, userAddress]);

  const fetchUserDonations = useCallback(async () => {
    if (!contract || !userAddress) return;
    try {
      const donationCount = await contract.getDonationCount(userAddress);
      const userDonations = [];

      for (let i = 0; i < donationCount; i++) {
        const donation = await contract.getDonationDetails(userAddress, i);
        userDonations.push({
          campaignId: donation[0],
          amount: ethers.formatEther(donation[1]),
        });
      }

      setUserDonations(userDonations);
    } catch (error) {
      console.error("Error fetching user donations:", error);
    }
  }, [contract, userAddress]);

  useEffect(() => {
    fetchUserCampaigns();
    fetchUserDonations();
  }, [fetchUserCampaigns, fetchUserDonations]);

  return (
    <>
      <section className="mx-auto px-4 py-8 bg-white dark:bg-gray-700">
        <div className="lex flex-col md:flex-row gap-8 py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            Your Dashboard
          </h1>

          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Your Campaigns
          </h2>
          {userCampaigns.length > 0 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {userCampaigns.map((campaign) => (
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
            </>
          ) : (
            <p className="text-gray-500 sm:text-xl dark:text-gray-200 mb-8">
              You haven't created any campaigns yet.
            </p>
          )}

          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Your Donations
          </h2>
          {userDonations.length > 0 ? (
            <ul>
              {userDonations.map((donation, index) => (
                <li key={index} className="mb-2">
                  <Link
                    to={`/campaign/${donation.campaignId}`}
                    className="text-blue-500 hover:underline"
                  >
                    Campaign #{donation.campaignId}
                  </Link>
                  <span className="ml-2">{donation.amount} ETH</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 sm:text-xl dark:text-gray-200 mb-8">
              You haven't made any donations yet.
            </p>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}

export default UserDashboard;
