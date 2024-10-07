import React from "react";
import { Link } from "react-router-dom";

const CampaignCreationSteps = () => {
  const steps = [
    {
      title: "Project Details",
      description: "Define your project's title, category, and funding goal.",
    },
    {
      title: "Campaign Story",
      description: "Share your story, explain your project, and upload media.",
    },
    {
      title: "Rewards",
      description: "Set up enticing rewards for your backers.",
    },
    {
      title: "Review & Launch",
      description: "Review your campaign details and launch when ready.",
    },
  ];

  return (
    <section className="bg-white dark:bg-gray-800">
      <div className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
              Launch Your Crowdfunding Campaign
            </h2>
            <p className="mb-6 font-light text-gray-500 md:text-lg dark:text-gray-400">
              Creating your campaign is easy with our step-by-step process.
              Follow these steps to bring your idea to life and connect with
              potential backers.
            </p>
            <Link
              to="/create-campaign"
              className="inline-flex items-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900"
            >
              Create Your Campaign
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
          </div>
          <ol className="relative text-gray-500 border-s border-gray-200 dark:border-gray-700 dark:text-gray-400">
            {steps.map((step, index) => (
              <li key={index} className="mb-10 ms-6">
                <span
                  className={`absolute flex items-center justify-center w-8 h-8 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 ${
                    index === 0
                      ? "bg-primary-100 dark:bg-primary-900"
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}
                >
                  {index === 0 ? (
                    <svg
                      className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 16 12"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M1 5.917 5.724 10.5 15 1.5"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 16"
                    >
                      <path d="M18 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM6.5 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3.014 13.021l.157-.625A3.427 3.427 0 0 1 6.5 9.571a3.426 3.426 0 0 1 3.322 2.805l.159.622-6.967.023ZM16 12h-3a1 1 0 0 1 0-2h3a1 1 0 0 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Z" />
                    </svg>
                  )}
                </span>
                <h3 className="font-medium leading-tight">{step.title}</h3>
                <p className="text-sm">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default CampaignCreationSteps;
