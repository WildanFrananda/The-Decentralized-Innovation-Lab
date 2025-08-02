// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {GenesisBlueprint} from "../src/GenesisBlueprint.sol";
import {ERC1967Proxy} from "openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title Test for GenesisBlueprint contract (Upgradable)
 * @author LabDecentral (Wildan Frananda)
 */
contract GenesisBlueprintUpgradableTest is Test {
    GenesisBlueprint public genesisBlueprint;
    address public owner = makeAddr("owner");
    address public user1 = makeAddr("user1");

    string internal constant COLLECTION_NAME = "Genesis Blueprint";
    string internal constant COLLECTION_SYMBOL = "GPB";

    function setUp() public {
        vm.startPrank(owner);

        GenesisBlueprint implementation = new GenesisBlueprint();

        bytes memory data = abi.encodeWithSelector(
            GenesisBlueprint.initialize.selector,
            COLLECTION_NAME,
            COLLECTION_SYMBOL
        );

        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), data);

        genesisBlueprint = GenesisBlueprint(address(proxy));

        vm.stopPrank();
    }

    function test_InitialState() public view {
        assertEq(genesisBlueprint.name(), COLLECTION_NAME, "Collection name should be set");
        assertEq(genesisBlueprint.symbol(), COLLECTION_SYMBOL, "Collection symbol should be set");
        assertEq(genesisBlueprint.owner(), owner, "Owner should be correct");
    }

    function test_OwnerCanMint() public {
        vm.prank(owner);
        uint256 tokenId = genesisBlueprint.safeMint(user1, "ipfs://my-uri");

        assertEq(genesisBlueprint.ownerOf(tokenId), user1, "Owner of NFT should be user1");
        assertEq(genesisBlueprint.tokenURI(tokenId), "ipfs://my-uri", "Token URI should be set");
        assertEq(genesisBlueprint.balanceOf(user1), 1, "User1 balance should be 1");
    }

    function test_Revert_When_NonOwnerMints() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(OwnableUpgradeable.OwnableUnauthorizedAccount.selector, user1));
        genesisBlueprint.safeMint(user1, "ipfs://another-uri");
    }
}
