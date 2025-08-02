// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {ProofOfSkill} from "../src/ProofOfSkill.sol";
import {ERC1967Proxy} from "openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title Test for ProofOfSkill contract
 * @author LabDecentral (Wildan Frananda)
 * @notice This test verifies all main functions of the ProofOfSkill contract.
 */
contract ProofOfSkillTest is Test {
    ProofOfSkill public proofOfSkill;
    address public owner = makeAddr("owner");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");

    function setUp() public {
        vm.startPrank(owner);

        ProofOfSkill implementation = new ProofOfSkill();
        bytes memory data = abi.encodeWithSelector(
            ProofOfSkill.initialize.selector
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), data);
        proofOfSkill = ProofOfSkill(address(proxy));

        vm.stopPrank();
    }

        function test_OwnerIsSetCorrectly() public view {
        assertEq(proofOfSkill.owner(), owner, "Owner should be set correctly");
    }

    function test_EndorseSkill_Succeeds() public {
        vm.prank(user1);
        proofOfSkill.endorseSkill("Solidity");
        assertEq(proofOfSkill.skillEndorsements("Solidity"), 1, "Endorsement count should be 1");
    }
    
    function test_Revert_When_EndorseEmptySkill() public {
        vm.prank(user1);
        vm.expectRevert("Skill name cannot be empty");
        proofOfSkill.endorseSkill("");
    }

    function test_LeaveReview_Succeeds() public {
        string memory reviewText = "Great portfolio!";
        vm.prank(user2);
        proofOfSkill.leaveReview(reviewText);
        
        assertEq(proofOfSkill.getReviewsCount(), 1, "Reviews count should be 1");
        (address reviewer, string memory text, uint256 timestamp) = proofOfSkill.reviews(0);
        
        assertEq(reviewer, user2, "Reviewer address is incorrect");
        assertEq(text, reviewText, "Review text is incorrect");
        assertTrue(timestamp > 0, "Timestamp should be set");
    }

    function test_Revert_When_LeaveEmptyReview() public {
        vm.prank(user2);
        vm.expectRevert("Review text cannot be empty");
        proofOfSkill.leaveReview("");
    }
}