const hre = require("hardhat");

async function main() {
  const Crowdfunding = await hre.ethers.getContractFactory("Crowdfunding");
  const crowdfunding = await Crowdfunding.deploy();

  await crowdfunding.waitForDeployment();

  console.log("Crowdfunding deployed to:", await crowdfunding.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

//   Crowdfunding deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
