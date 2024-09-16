const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("CrowdfundingModule", (m) => {
  const crowdfunding = m.contract("Crowdfunding");

  return { crowdfunding };
});

// CrowdfundingModule#Crowdfunding - 0x5FbDB2315678afecb367f032d93F642f64180aa3
