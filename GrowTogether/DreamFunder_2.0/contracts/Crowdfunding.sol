// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Crowdfunding {
    enum CampaignType { Reward, Donation, Lending}

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
        CampaignType campaignType;
        uint256 rewardPercentage;
        mapping(address => uint256) donations;
        address[] donors;
    }

    struct Feedback {
        address user;
        string message;
        uint256 timestamp;
    }

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => Feedback[]) public campaignFeedback;
     mapping(uint256 => mapping(address => uint256)) public donations;
     mapping(uint256 => mapping(address => bool)) public hasUserDonated;
     mapping(uint256 => address[]) public campaignDonors;
    uint256 public numberOfCampaigns = 0;

    event CampaignCreated(uint256 indexed campaignId, address indexed owner, string title, uint256 target, uint256 deadline, uint8 category, CampaignType campaignType);
    event DonationMade(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event Withdrawal(uint256 indexed campaignId, address indexed owner, uint256 amount);
    event CampaignEnded(uint256 indexed campaignId, bool goalReached);
    event RewardPaid(uint256 indexed campaignId, address indexed recipient, uint256 amount);
    event LoanRepaid(uint256 indexed campaignId, address indexed recipient, uint256 amount);
    event FeedbackAdded(uint256 indexed campaignId, address indexed user, string message);

    function createCampaign(string memory _title, string memory _description, uint256 _target, uint256 _deadline, uint8 _category, CampaignType _campaignType, uint256 _rewardPercentage) public returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_target > 0, "Target amount must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_category < 10, "Invalid category");

        if(_campaignType == CampaignType.Reward) {
            require(_rewardPercentage > 0 && _rewardPercentage <= 100, "Invalid reward percentage");
        } else {
            require(_rewardPercentage == 0, "Reward percentage should be 0 for non-reward campaigns");
        }

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
        campaign.campaignType = _campaignType;
        campaign.rewardPercentage = _rewardPercentage;

        numberOfCampaigns++;

        emit CampaignCreated(campaignId, msg.sender, _title, _target, _deadline, _category, _campaignType);
        
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
         hasUserDonated[_id][msg.sender] = true;

        

         // Add donor to the list if not already present
        if (donations[_id][msg.sender] == msg.value) {
            campaignDonors[_id].push(msg.sender);
        }

        if (campaign.amountCollected >= campaign.target) {
            endCampaign(_id);
        }

        emit DonationMade(_id, msg.sender, msg.value);
        addFeedback(_id, string(abi.encodePacked("Donation of ", uint2str(msg.value), " wei made")));
    }

    function payReward(uint256 _id, address _donor) public payable {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only the campaign owner can pay rewards");
        require(campaign.campaignType == CampaignType.Reward, "This is not a reward-based campaign");
        
        uint256 donationAmount = campaign.donations[_donor];
        require(donationAmount > 0, "This address has not donated to the campaign");

        uint256 rewardAmount = (donationAmount * campaign.rewardPercentage) / 100;
        require(msg.value >= rewardAmount, "Insufficient reward amount");

        payable(_donor).transfer(rewardAmount);

        emit RewardPaid(_id, _donor, rewardAmount);
    }

    function repayLoan(uint256 _id, address _donor) public payable {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only the campaign owner can repay loans");
        require(campaign.campaignType == CampaignType.Lending, "This is not a lending-based campaign");

        uint256 loanAmount = campaign.donations[_donor];
        require(loanAmount > 0, "This address has not lent to the campaign");
        require(msg.value >= loanAmount, "Insufficient repayment amount");

        payable(_donor).transfer(loanAmount);
        campaign.donations[_donor] = 0;

         emit LoanRepaid(_id, _donor, loanAmount);
    }

    function addFeedback(uint256 _id, string memory _message) public {
        require(_id < numberOfCampaigns, "Campaign does not exist");
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner || campaign.donations[msg.sender] > 0, "Only the owner or donors can add feedback");
        
        campaignFeedback[_id].push(Feedback({
            user: msg.sender,
            message: _message,
            timestamp: block.timestamp
        }));

        emit FeedbackAdded(_id, msg.sender, _message);
    }

    function getFeedback(uint256 _id) public view returns (Feedback[] memory) {
        require(_id < numberOfCampaigns, "Campaign does not exist");
        return campaignFeedback[_id];
    }

    function getAllDonors(uint256 _id) public view returns (address[] memory, uint256[] memory) {
        address[] memory donors = campaignDonors[_id];
        uint256[] memory amounts = new uint256[](donors.length);

        for (uint i = 0; i < donors.length; i++) {
            amounts[i] = donations[_id][donors[i]];
        }

        return (donors, amounts);
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
        uint8 category,
        CampaignType campaignType,
        uint256 rewardPercentage
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
            campaign.category,
            campaign.campaignType,
            campaign.rewardPercentage
        );
    }

    

    function isCampaignEnded(uint256 _id) public view returns (bool) {
        require(_id < numberOfCampaigns, "Campaign does not exist");
        Campaign storage campaign = campaigns[_id];
        return campaign.ended || block.timestamp > campaign.deadline || campaign.amountCollected >= campaign.target;
    }

    function uint2str(uint256 _i) internal pure returns (string memory str) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + j % 10));
            j /= 10;
        }
        str = string(bstr);
    }
}