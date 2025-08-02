// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {UUPSUpgradeable} from "openzeppelin-contracts-upgradeable/contracts/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "openzeppelin-contracts-upgradeable/contracts/access/OwnableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "openzeppelin-contracts-upgradeable/contracts/utils/ReentrancyGuardUpgradeable.sol";
import {Initializable} from "openzeppelin-contracts-upgradeable/contracts/proxy/utils/Initializable.sol";

/**
 * @title ProofOfSkill
 * @author LabDecentral (Wildan Frananda)
 * @notice This contract allows visitors to provide endorsements
 * and reviews for the portfolio owner's skills.
 * This is a proof of concept running on the testnet.
 */
contract ProofOfSkill is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable {
    struct Review {
        address reviewer;
        string text;
        uint256 timestamp;
    }

    mapping(string => uint256) public skillEndorsements;
    Review[] public reviews;

    /**
     * @notice Emitted when a skill is successfully endorsed.
     * @param endorser The address that performed the endorsement.
     * @param skillName The name of the skill that was endorsed.
     * @param newEndorsementCount The new total endorsement count for the skill.
     */
    event SkillEndorsed(
        address indexed endorser,
        string skillName,
        uint256 newEndorsementCount
    );

    /**
     * @notice Emitted when a new review is successfully submitted.
     * @param reviewer The address that submitted the review.
     * @param reviewText The content of the review.
     */
    event ReviewLeft(address indexed reviewer, string reviewText);

    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializes the contract. Serves as a replacement for the constructor.
     * Can only be called once.
     */
    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
    }

    /**
     * @notice Endorse a specific skill.
     * @param skillName The name of the skill to endorse (e.g., "Solidity").
     */
    function endorseSkill(string memory skillName) external nonReentrant {
        require(bytes(skillName).length > 0, "Skill name cannot be empty");

        skillEndorsements[skillName]++;

        emit SkillEndorsed(msg.sender, skillName, skillEndorsements[skillName]);
    }

    /**
     * @notice Leave a new review.
     * @param reviewText The content of the review.
     */
    function leaveReview(string memory reviewText) external nonReentrant {
        require(bytes(reviewText).length > 0, "Review text cannot be empty");

        reviews.push(
            Review({
                reviewer: msg.sender,
                text: reviewText,
                timestamp: block.timestamp
            })
        );

        emit ReviewLeft(msg.sender, reviewText);
    }

    /**
     * @notice Get the total number of reviews that have been left.
     * @return uint256 The number of reviews.
     */
    function getReviewsCount() external view returns (uint256) {
        return reviews.length;
    }

    /**
     * @notice Security function that only allows the contract owner to perform upgrades.
     */
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}
