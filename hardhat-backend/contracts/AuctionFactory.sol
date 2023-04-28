// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.7;

import "./Auction.sol";

contract AuctionFactory {
    uint256 private constant OPEN_INTERVAL_THRESHOLD = 24 * 3600;
    uint256 private constant MAXIMUM_INTERVAL = 7 * 24 * 3600;

    event AuctionDeployed(
        address contractAddress,
        address sellerAddress
    );

    function deployAuction(
        uint256 minimumBid,
        uint256 maximumNumberOfBidders,
        uint256 auctioneerCollateralAmount,
        uint256 interval
    ) public payable {
        if (interval < OPEN_INTERVAL_THRESHOLD) {
            revert Auction__IntervalBelowThreshold(interval, OPEN_INTERVAL_THRESHOLD);
        }

        if (interval > MAXIMUM_INTERVAL) {
            revert Auction__IntervalAboveMaximum(interval, MAXIMUM_INTERVAL);
        }

        if (msg.value < auctioneerCollateralAmount) {
            revert Auction__DidntCoverCollateral(msg.value, auctioneerCollateralAmount);
        }

        Auction auction = new Auction{value: msg.value}(minimumBid, maximumNumberOfBidders, auctioneerCollateralAmount, interval, msg.sender);
        emit AuctionDeployed(address(auction), msg.sender);
    }
}