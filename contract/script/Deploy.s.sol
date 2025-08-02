// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ProofOfSkill} from "../src/ProofOfSkill.sol";
import {ERC1967Proxy} from "openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract DeployUpgradableScript is Script {
    function run() external returns (address) {
        uint deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        ProofOfSkill implementation = new ProofOfSkill();
        console.log("Implementation deployed at:", address(implementation));

        bytes memory data = abi.encodeWithSelector(
            ProofOfSkill.initialize.selector
        );

        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), data);
        console.log("Proxy deployed at:", address(proxy));

        vm.stopBroadcast();

        return address(proxy);
    }
}
