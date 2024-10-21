import React from "react";

function HowItWorks() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">How CrowdFund Works</h1>
      <ol className="list-decimal list-inside space-y-4">
        <li>
          <strong>Connect your wallet:</strong> Use a Web3 wallet like MetaMask
          to interact with our platform.
        </li>
        <li>
          <strong>Create a campaign:</strong> Set up your project with a title,
          description, funding goal, and deadline.
        </li>
        <li>
          <strong>Share your campaign:</strong> Spread the word about your
          project to potential backers.
        </li>
        <li>
          <strong>Receive funds:</strong> Supporters can contribute to your
          campaign using cryptocurrency.
        </li>
        <li>
          <strong>Reach your goal:</strong> If your campaign meets its target,
          you can withdraw the funds to start your project.
        </li>
        <li>
          <strong>Update backers:</strong> Keep your supporters informed about
          your progress and use of funds.
        </li>
      </ol>
      <p className="mt-6">
        CrowdFund uses smart contracts to ensure that funds are only released
        when campaign goals are met, providing security and trust for both
        creators and backers.
      </p>
    </div>
  );
}

export default HowItWorks;
