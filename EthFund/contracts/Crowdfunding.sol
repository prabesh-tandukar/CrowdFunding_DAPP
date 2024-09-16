// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Crowdfunding is ReentrancyGuard {
    struct Campaign {
        address payable creator;
        string title;
        string description;
        uint256 goal;
        uint256 deadline;
        uint256 amountRaised;
        bool claimed;
        mapping(address => uint256) contributions;
    }

    uint256 private campaignCount;
    mapping(uint256 => Campaign) public campaigns;

    event CampaignCreated(uint256 campaignId, address creator, string title, uint256 goal, uint256 deadline);
    event ContributionMade(uint256 campaignId, address contributor, uint256 amount);
    event FundsClaimed(uint256 campaignId, address creator, uint256 amount);
    event FundsRefunded(uint256 campaignId, address contributor, uint256 amount);

    function createCampaign(string memory _title, string memory _description, uint256 _goal, uint256 _durationInDays) external {
        require(_goal > 0, "Goal must be greater than 0");
        require(_durationInDays > 0, "Duration must be greater than 0");

        campaignCount++;
        uint256 newCampaignId = campaignCount;

        Campaign storage newCampaign = campaigns[newCampaignId];
        newCampaign.creator = payable(msg.sender);
        newCampaign.title = _title;
        newCampaign.description = _description;
        newCampaign.goal = _goal;
        newCampaign.deadline = block.timestamp + (_durationInDays * 1 days);

        emit CampaignCreated(newCampaignId, msg.sender, _title, _goal, newCampaign.deadline);
    }

    function contribute(uint256 _campaignId) external payable nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp < campaign.deadline, "Campaign has ended");
        require(msg.value > 0, "Contribution must be greater than 0");

        campaign.contributions[msg.sender] += msg.value;
        campaign.amountRaised += msg.value;

        emit ContributionMade(_campaignId, msg.sender, msg.value);
    }

    function claimFunds(uint256 _campaignId) external nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.sender == campaign.creator, "Only the creator can claim funds");
        require(block.timestamp >= campaign.deadline, "Campaign has not ended yet");
        require(campaign.amountRaised >= campaign.goal, "Funding goal not reached");
        require(!campaign.claimed, "Funds have already been claimed");

        campaign.claimed = true;
        uint256 amountToTransfer = campaign.amountRaised;
        campaign.amountRaised = 0;

        (bool sent, ) = campaign.creator.call{value: amountToTransfer}("");
        require(sent, "Failed to send funds to creator");

        emit FundsClaimed(_campaignId, campaign.creator, amountToTransfer);
    }

    function refund(uint256 _campaignId) external nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp >= campaign.deadline, "Campaign has not ended yet");
        require(campaign.amountRaised < campaign.goal, "Funding goal was reached");
        
        uint256 contributionAmount = campaign.contributions[msg.sender];
        require(contributionAmount > 0, "No contribution found");

        campaign.contributions[msg.sender] = 0;
        campaign.amountRaised -= contributionAmount;

        (bool sent, ) = payable(msg.sender).call{value: contributionAmount}("");
        require(sent, "Failed to send refund");

        emit FundsRefunded(_campaignId, msg.sender, contributionAmount);
    }

    function getCampaignDetails(uint256 _campaignId) external view returns (
        address creator,
        string memory title,
        string memory description,
        uint256 goal,
        uint256 deadline,
        uint256 amountRaised,
        bool claimed
    ) {
        Campaign storage campaign = campaigns[_campaignId];
        return (
            campaign.creator,
            campaign.title,
            campaign.description,
            campaign.goal,
            campaign.deadline,
            campaign.amountRaised,
            campaign.claimed
        );
    }

    function getContribution(uint256 _campaignId, address _contributor) external view returns (uint256) {
        return campaigns[_campaignId].contributions[_contributor];
    }
}