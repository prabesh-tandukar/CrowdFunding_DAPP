import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="p-4 bg-white md:p-8 lg:p-10 dark:bg-gray-900">
      <div className="mx-auto max-w-screen-xl text-center">
        <Link
          to="/"
          className="flex justify-center items-center text-2xl font-semibold text-gray-900 dark:text-white"
        >
          <svg
            className="mr-2 h-8"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          DreamFunder
        </Link>
        <p className="my-6 text-gray-500 dark:text-gray-400">
          Empowering innovators and creators to bring their dreams to life
          through community-driven crowdfunding.
        </p>
        <ul className="flex flex-wrap justify-center items-center mb-6 text-gray-900 dark:text-white">
          <li>
            <Link to="/about" className="mr-4 hover:underline md:mr-6">
              About
            </Link>
          </li>
          <li>
            <Link to="/how-it-works" className="mr-4 hover:underline md:mr-6">
              How It Works
            </Link>
          </li>
          <li>
            <Link to="/campaigns" className="mr-4 hover:underline md:mr-6">
              Campaigns
            </Link>
          </li>
          <li>
            <Link
              to="/create-campaign"
              className="mr-4 hover:underline md:mr-6"
            >
              Start a Campaign
            </Link>
          </li>

          {/* <li>
            <Link to="/contact" className="mr-4 hover:underline md:mr-6">
              Contact
            </Link>
          </li> */}
        </ul>
        <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
          © 2024{" "}
          <a href="#" className="hover:underline">
            DreamFund™
          </a>
          . All Rights Reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
