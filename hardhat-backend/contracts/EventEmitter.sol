// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.7;

error EventEmitter__Unauthorized();

contract EventEmitter {
    event ContractDeployed(
        address contractAddress,
        address sellerAddress
    );

    modifier calleeIsAnAuction(address contractAddress) {
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(contractAddress)
        }

        if (codeSize == 0) {
            revert EventEmitter__Unauthorized();
        }
        _;
    }

    // TODO check on frontend that contract is deployed
    function emitContractDeployed(address sellerAddress) public {
        emit ContractDeployed(msg.sender, sellerAddress);
    }
}