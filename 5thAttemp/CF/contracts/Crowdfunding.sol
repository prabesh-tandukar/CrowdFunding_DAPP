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
        bool ended;
        mapping(address => uint256) donations;
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public numberOfCampaigns = 0;

    event CampaignCreated(uint256 indexed campaignId, address indexed owner, string title, uint256 target, uint256 deadline);
    event DonationMade(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event FundsWithdrawn(uint256 indexed campaignId, address indexed owner, uint256 amount);
    event CampaignEnded(uint256 indexed campaignId, bool goalReached);

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
        campaign.ended = false;

        

        emit CampaignCreated(campaignId, msg.sender, _title, _target, _deadline);

        numberOfCampaigns++;
        return campaignId;
    }

    function donateToCampaign(uint256 _id) public payable {
        require(_id < numberOfCampaigns, "Campaign does not exist");
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp <= campaign.deadline, "Campaign has ended");

        campaign.donations[msg.sender] += msg.value;
        campaign.amountCollected += msg.value;

        emit DonationMade(_id, msg.sender, msg.value);
        if (campaign.amountCollected >= campaign.target) {
            endCampaign(_id);
        }
    }

    function endCampaign(uint256 _id) internal {
        Campaign storage campaign = campaigns[_id];
        campaign.ended = true;
        emit CampaignEnded(_id, campaign.amountCollected >= campaign.target);
    }

    function withdrawFunds(uint256 _id) public {
        require(_id < numberOfCampaigns, "Campaign does not exist");
        Campaign storage campaign = campaigns[_id];
        require(campaign.owner == msg.sender, "Only the campaign owner can withdraw funds");
        require(campaign.amountCollected >= campaign.target, "The campaign target has not been met");
        require(block.timestamp > campaign.deadline, "The campaign deadline has not passed");

        uint256 amountToWithdraw = campaign.amountCollected;
        campaign.amountCollected = 0;

        (bool sent, ) = payable(campaign.owner).call{value: amountToWithdraw}("");
        require(sent, "Failed to withdraw funds");

        emit FundsWithdrawn(_id, campaign.owner, amountToWithdraw);
    }

    function getCampaignDetails(uint256 _id) public view returns (
        address owner,
        string memory title,
        string memory description,
        uint256 target,
        uint256 deadline,
        uint256 amountCollected,
        bool ended
    ) {
        require(_id < numberOfCampaigns, "Campaign does not exist");
        Campaign storage campaign = campaigns[_id];
        return (
            campaign.owner,
            campaign.title,
            campaign.description,
            campaign.target,
            campaign.deadline,
            campaign.amountCollected,
            campaign.ended
        );
    }

    function getDonationAmount(uint256 _id, address _donor) public view returns (uint256) {
        require(_id < numberOfCampaigns, "Campaign does not exist");
        return campaigns[_id].donations[_donor];
    }

     function isCampaignEnded(uint256 _id) public view returns (bool) {
        Campaign storage campaign = campaigns[_id];
        return campaign.ended || block.timestamp > campaign.deadline || campaign.amountCollected >= campaign.target;
    }
}