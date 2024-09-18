// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Crowdfunding {
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        mapping(address => uint256) donations;
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public numberOfCampaigns = 0;

    event CampaignCreated(uint256 indexed campaignId, address indexed owner, string title, uint256 target, uint256 deadline);
    event DonationMade(uint256 indexed campaignId, address indexed donor, uint256 amount);

    function createCampaign(string memory _title, string memory _description, uint256 _target, uint256 _deadline) public returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_target > 0, "Target amount must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        uint256 campaignId = numberOfCampaigns;
        Campaign storage campaign = campaigns[campaignId];

        campaign.owner = msg.sender;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;

        numberOfCampaigns++;

        emit CampaignCreated(campaignId, msg.sender, _title, _target, _deadline);

        return campaignId;
    }

    function donateToCampaign(uint256 _id) public payable {
        uint256 amount = msg.value;
        Campaign storage campaign = campaigns[_id];

        campaign.donations[msg.sender] += amount;
        campaign.amountCollected += amount;

        emit DonationMade(_id, msg.sender, amount);
    }

    function withdrawFunds(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(campaign.owner == msg.sender, "Only the campaign owner can withdraw funds");
        require(campaign.amountCollected >= campaign.target, "The campaign target has not been met");
        require(block.timestamp > campaign.deadline, "The campaign deadline has not passed");

        uint256 amountToWithdraw = campaign.amountCollected;
        campaign.amountCollected = 0;

        (bool sent, ) = payable(campaign.owner).call{value: amountToWithdraw}("");
        require(sent, "Failed to withdraw funds");
    }

    function getCampaignDetails(uint256 _id) public view returns (
        address owner,
        string memory title,
        string memory description,
        uint256 target,
        uint256 deadline,
        uint256 amountCollected
    ) {
        Campaign storage campaign = campaigns[_id];
        return (
            campaign.owner,
            campaign.title,
            campaign.description,
            campaign.target,
            campaign.deadline,
            campaign.amountCollected
        );
    }

    function getDonationAmount(uint256 _id, address _donor) public view returns (uint256) {
        return campaigns[_id].donations[_donor];
    }
}