import React from "react";
import { Link } from "react-router-dom";
import { useWeb3Context } from "../context/Web3Context";
import CrowdfundingFeatures from "../components/CrowdfundingFeatures";
import CampaignCreationSteps from "../components/CampaignCreationSteps";
import Footer from "../components/Footer";

function HomePage() {
  const { connected, connectWallet } = useWeb3Context();

  return (
    <div>
      <section className="bg-white dark:bg-gray-700">
        <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12">
          <Link
            to="how-it-works"
            className="inline-flex justify-between items-center py-1 px-1 pr-4 mb-7 text-sm text-gray-700 bg-gray-100 rounded-full dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
            role="alert"
          >
            <span className="text-xs bg-primary-600 rounded-full text-white px-4 py-1.5 mr-3">
              New
            </span>
            <span className="text-sm font-medium">
              See how DreamFunder crowdfunding works !
            </span>
            <svg
              className="ml-2 w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              ></path>
            </svg>
          </Link>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
            Welcome to DreamFunder
          </h1>
          <p className="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
            Empower creators and support innovative projects through
            decentralized crowdfunding.
          </p>
          <div className="flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
            {connected ? (
              <>
                <Link
                  to="/campaigns"
                  className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900"
                >
                  View Campaigns
                  <svg
                    className="ml-2 -mr-1 w-5 h-5"
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
                <Link
                  to="/create-campaign"
                  className="inline-block border border-blue-400 text-blue-400 font-semibold py-2 px-4 rounded hover:bg-blue-400 hover:text-gray-900 transition duration-300"
                >
                  Create Campaign
                </Link>
              </>
            ) : (
              <p
                className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                onClick={connectWallet}
              >
                Please connect your wallet to get started.
              </p>
            )}
          </div>
        </div>
      </section>
      <CrowdfundingFeatures />
      <CampaignCreationSteps />
      <Footer />
    </div>
  );
}

export default HomePage;
