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
        bool fundsWithdrawn;
        uint8 category;
        mapping(address => uint256) donations;
        address[] donors;
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public numberOfCampaigns = 0;

    event CampaignCreated(uint256 indexed campaignId, address indexed owner, string title, uint256 target, uint256 deadline, uint8 category);
    event DonationMade(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event Withdrawal(uint256 indexed campaignId, address indexed owner, uint256 amount);
    event CampaignEnded(uint256 indexed campaignId, bool goalReached);

    function createCampaign(string memory _title, string memory _description, uint256 _target, uint256 _deadline, uint8 _category) public returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_target > 0, "Target amount must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_category < 10, "Invalid category");

        uint256 campaignId = numberOfCampaigns;
        Campaign storage campaign = campaigns[campaignId];

        campaign.owner = msg.sender;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.ended = false;
        campaign.fundsWithdrawn = false;
        campaign.category = _category;

        numberOfCampaigns++;

        emit CampaignCreated(campaignId, msg.sender, _title, _target, _deadline, _category);
        
        return campaignId;
    }

    function donateToCampaign(uint256 _id) public payable {
        require(_id < numberOfCampaigns, "Campaign does not exist");
        Campaign storage campaign = campaigns[_id];
        if (campaign.donations[msg.sender] == 0) {
            campaign.donors.push(msg.sender); 
        }
        require(!campaign.ended, "Campaign has ended");
        require(block.timestamp <= campaign.deadline, "Campaign deadline has passed");

        campaign.donations[msg.sender] += msg.value;
        campaign.amountCollected += msg.value;

        emit DonationMade(_id, msg.sender, msg.value);

        if (campaign.amountCollected >= campaign.target) {
            endCampaign(_id);
        }
    }
    
    // New function to get the number of donors for a campaign
    function getDonorCount(uint256 _id) public view returns (uint256) {
        require(_id < numberOfCampaigns, "Campaign does not exist");
        return campaigns[_id].donors.length;
    }

    // New function to get donor details for a campaign
    function getDonorDetails(uint256 _id, uint256 _index) public view returns (address donor, uint256 amount) {
        require(_id < numberOfCampaigns, "Campaign does not exist");
        require(_index < campaigns[_id].donors.length, "Donor index out of bounds");
        
        Campaign storage campaign = campaigns[_id];
        donor = campaign.donors[_index];
        amount = campaign.donations[donor];
        return (donor, amount);
    }

    function getCampaignDonors(uint256 _id) public view returns (address[] memory) {
        require(_id < numberOfCampaigns, "Campaign does not exist");
        return campaigns[_id].donors;
    }

    function getDonationAmount(uint256 _id, address _donor) public view returns (uint256) {
        require(_id < numberOfCampaigns, "Campaign does not exist");
        return campaigns[_id].donations[_donor];
    }

    function endCampaign(uint256 _id) internal {
        Campaign storage campaign = campaigns[_id];
        campaign.ended = true;
        emit CampaignEnded(_id, campaign.amountCollected >= campaign.target);
    }

    function withdrawFunds(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only the campaign owner can withdraw funds");
        require(campaign.ended || block.timestamp > campaign.deadline || campaign.amountCollected >= campaign.target, "Cannot withdraw before deadline unless target is met");
        require(!campaign.fundsWithdrawn, "Funds have already been withdrawn");
        require(campaign.amountCollected > 0, "No funds to withdraw");

        uint256 amountToWithdraw = campaign.amountCollected;
        campaign.amountCollected = 0;
        campaign.fundsWithdrawn = true;
        campaign.ended = true;

        (bool sent, ) = payable(campaign.owner).call{value: amountToWithdraw}("");
        require(sent, "Failed to send Ether");

        emit Withdrawal(_id, campaign.owner, amountToWithdraw);
    }

    function getCampaignDetails(uint256 _id) public view returns (
        address owner,
        string memory title,
        string memory description,
        uint256 target,
        uint256 deadline,
        uint256 amountCollected,
        bool ended,
        bool fundsWithdrawn,
        uint8 category
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
            campaign.ended,
            campaign.fundsWithdrawn,
            campaign.category
        );
    }

    

    function isCampaignEnded(uint256 _id) public view returns (bool) {
        require(_id < numberOfCampaigns, "Campaign does not exist");
        Campaign storage campaign = campaigns[_id];
        return campaign.ended || block.timestamp > campaign.deadline || campaign.amountCollected >= campaign.target;
    }
}