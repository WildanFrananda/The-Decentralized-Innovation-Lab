// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {GenesisBlueprint} from "../src/GenesisBlueprint.sol";
import {ERC1967Proxy} from "openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract DeployGenesisScript is Script {
    function run() external returns (address) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        GenesisBlueprint implementation = new GenesisBlueprint();
        console.log("GenesisBlueprint Implementation deployed at:", address(implementation));

        bytes memory data = abi.encodeWithSelector(
            GenesisBlueprint.initialize.selector,
            "Genesis Blueprint",
            "GPB"
        );

        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), data);
        console.log("GenesisBlueprint Proxy deployed at:", address(proxy));

        vm.stopBroadcast();

        return address(proxy);
    }
}
