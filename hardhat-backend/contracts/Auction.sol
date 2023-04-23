// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

error Auction__BidBelowMinimumBid(uint256 amountSent, uint256 minimumBid, uint256 collateralAmount);
error Auction__ZeroStartingBid(uint256 amountSent, uint256 collateralAmount);
error Auction__RedundantZeroBidIncrease();
error Auction__DidntCoverCollateral(uint256 amountSent, uint256 collateralAmount);
error Auction__HighestBidderCantWithdraw();
error Auction__TransactionFailed();
error Auction__MaximumNumbersOfBiddersReached(uint256 maximumNumberOfBidders);
error Auction__SellerCantCallFunction();
error Auction__DidntEnterAuction();
error Auction__AuctionIsStillOpen();
error Auction__RoutingReservedForHighestBidder();
error Auction__OnlySellerCanCallFunction();
error Auction__IntervalBelowThreshold(uint256 interval, uint256 threshold);
error Auction__AuctionIsClosed();
error Auction__ThresholdNotReached(uint256 timeUntilThreshold);
error Auction__UpkeepNotNeeded();
error Auction__IntervalAboveMaximum(uint256 interval, uint256 maxInterval);
error Auction__AlreadyEnteredAuction();

contract Auction is AutomationCompatibleInterface {
    mapping(address => uint256) private s_auctioneerToCurrentBid;
    address[] private s_auctioneers;
    address private s_currentHighestBidder;
    uint256 private s_currentHighestBid;
    uint256 private s_currentNumberOfBidders;
    uint256 private  s_closeTimestamp;
    bool public s_isOpen;
    address private immutable i_seller;
    uint256 private immutable i_minimumBid;
    uint256 private immutable i_maximumNumberOfBidders;
    uint256 private immutable i_auctioneerCollateralAmount;
    uint256 private immutable i_sellerCollateralAmount;
    uint256 private immutable i_interval;
    uint256 private immutable i_startTimestamp;
    uint256 private constant OPEN_INTERVAL_THRESHOLD = 24 * 3600;
    //uint256 private constant OPEN_INTERVAL_THRESHOLD = 0;
    uint256 private constant CLOSED_INTERVAL = 7 * 24 * 3600;
    uint256 private constant MAXIMUM_INTERVAL = 7 * 24 * 3600;

    event ContractDeployed(
        address contractAddress
    );

    constructor(
        uint256 minimumBid,
        uint256 maximumNumberOfBidders,
        uint256 auctioneerCollateralAmount,
        uint256 interval
    ) payable {
        if (interval < OPEN_INTERVAL_THRESHOLD) {
            revert Auction__IntervalBelowThreshold(interval, OPEN_INTERVAL_THRESHOLD);
        }

        if (interval > MAXIMUM_INTERVAL) {
            revert Auction__IntervalAboveMaximum(interval, MAXIMUM_INTERVAL);
        }

        i_minimumBid = minimumBid;
        i_seller = msg.sender;
        i_maximumNumberOfBidders = maximumNumberOfBidders;
        i_auctioneerCollateralAmount = auctioneerCollateralAmount;
        i_sellerCollateralAmount = msg.value;
        i_interval = interval;
        i_startTimestamp = block.timestamp;
        s_isOpen = true;
        s_currentNumberOfBidders = 0;
        emit ContractDeployed(address(this));
    }

    modifier auctionClosed() {
        if (s_isOpen) {
            revert Auction__AuctionIsStillOpen();
        }
        _;
    }

    modifier auctionOpen() {
        if (!s_isOpen) {
            revert Auction__AuctionIsClosed();
        }
        _;
    }

    modifier onlySeller() {
        if (msg.sender != i_seller) {
            revert Auction__OnlySellerCanCallFunction();
        }
        _;
    }

    modifier notSeller() {
        if (msg.sender == i_seller) {
            revert Auction__SellerCantCallFunction();
        }
        _;
    }

    function enterAuction() public payable notSeller auctionOpen {
        if (s_auctioneerToCurrentBid[msg.sender] > 0) {
            revert Auction__AlreadyEnteredAuction();
        }

        if (s_currentNumberOfBidders == i_maximumNumberOfBidders) {
            revert Auction__MaximumNumbersOfBiddersReached(
                i_maximumNumberOfBidders
            );
        }

        if (msg.value < i_auctioneerCollateralAmount) {
            revert Auction__DidntCoverCollateral({
                amountSent: msg.value,
                collateralAmount: i_auctioneerCollateralAmount
            });
        }

        uint256 startingBid = msg.value - i_auctioneerCollateralAmount;
        if (startingBid == 0) {
            revert Auction__ZeroStartingBid({
                amountSent: msg.value,
                collateralAmount: i_auctioneerCollateralAmount
            });
        }

        if (startingBid < i_minimumBid) {
            revert Auction__BidBelowMinimumBid({
                amountSent: msg.value,
                minimumBid: i_minimumBid,
                collateralAmount: i_auctioneerCollateralAmount
            });
        }

        s_auctioneerToCurrentBid[msg.sender] = startingBid;
        if (startingBid > s_currentHighestBid) {
            s_currentHighestBid = startingBid;
            s_currentHighestBidder = msg.sender;
        }

        s_currentNumberOfBidders++;
        s_auctioneers.push(msg.sender);
    }

    function increaseBid() public payable auctionOpen {
        uint256 currentBid = s_auctioneerToCurrentBid[msg.sender];
        if (currentBid == 0) {
            revert Auction__DidntEnterAuction();
        }

        if (msg.value == 0) {
            revert Auction__RedundantZeroBidIncrease();
        }

        currentBid += msg.value;
        s_auctioneerToCurrentBid[msg.sender] = currentBid;
        if (currentBid > s_currentHighestBid) {
            s_currentHighestBid = currentBid;
            s_currentHighestBidder = msg.sender;
        }
    }

    function leaveAuction() public auctionOpen {
        if (msg.sender == s_currentHighestBidder) {
            revert Auction__HighestBidderCantWithdraw();
        }

        uint256 currentBid = s_auctioneerToCurrentBid[msg.sender];
        if (currentBid == 0) {
            revert Auction__DidntEnterAuction();
        }

        s_auctioneerToCurrentBid[msg.sender] = 0;
        s_currentNumberOfBidders -= 1;
        (bool success, ) = payable(msg.sender).call{
            value: currentBid + i_auctioneerCollateralAmount
        }("");

        if (!success) {
            revert Auction__TransactionFailed();
        }
    }

    function closeAuction() public onlySeller auctionOpen {
        if (!canICloseAuction()) {
            revert Auction__ThresholdNotReached(getTimeUntilThreshold());
        }

        if (s_currentHighestBid == 0) {
            (bool success, ) = payable(i_seller).call{
                value: i_sellerCollateralAmount
            }("");

            if (!success) {
                revert Auction__TransactionFailed();
            }

            destroyContract();
        }

        s_isOpen = false;
        s_closeTimestamp = block.timestamp;
        address[] memory auctioneers = s_auctioneers;
        for (uint256 index = 0; index < auctioneers.length; index++) {
            address auctioneer = auctioneers[index];
            uint256 bid = s_auctioneerToCurrentBid[auctioneer];
            if (bid == 0 || auctioneer == s_currentHighestBidder) {
                continue;
            }

            s_auctioneerToCurrentBid[auctioneer] = 0;
            (bool success, ) = payable(auctioneer).call{
                value: bid + i_auctioneerCollateralAmount
            }("");

            if (!success) {
                revert Auction__TransactionFailed();
            }
        }
    }

    function routeHighestBid() public auctionClosed {
        if (msg.sender != s_currentHighestBidder) {
            revert Auction__RoutingReservedForHighestBidder();
        }

        (bool success, ) = payable(i_seller).call{
            value: s_currentHighestBid + i_sellerCollateralAmount
        }("");

        if (!success) {
            revert Auction__TransactionFailed();
        }

        (success, ) = payable(s_currentHighestBidder).call{
            value: i_auctioneerCollateralAmount
        }("");

        if (!success) {
            revert Auction__TransactionFailed();
        }

        destroyContract();
    }

    function burnAllStoredValue() public auctionClosed onlySeller {
        destroyContract();
    }

    function checkUpkeep(bytes memory)
        public
        view
        override
        returns (bool upkeepNeeded, bytes memory)
    {
        if (s_isOpen) {
            upkeepNeeded = getTimePassedSinceStart() >= i_interval;
        } else {
            upkeepNeeded = getTimePassedSinceAuctionClosed() >= CLOSED_INTERVAL;
        }

        return (upkeepNeeded, "0x0");
    }

    function performUpkeep(bytes calldata) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert Auction__UpkeepNotNeeded();
        }

        if (s_isOpen) {
            closeAuction();
        } else {
            destroyContract();
        }
    }

    function destroyContract() internal {
        selfdestruct(payable(address(this)));
    }

    function getAuctionWinner()
        public
        view
        auctionClosed
        onlySeller
        returns (address)
    {
        return s_currentHighestBidder;
    }

    function getMyCurrentBid() public view notSeller returns (uint256) {
        return s_auctioneerToCurrentBid[msg.sender];
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getCurrentHighestBid() public view returns (uint256) {
        return s_currentHighestBid;
    }

    function doIHaveTheHighestBid() public view notSeller returns (bool) {
        return msg.sender == s_currentHighestBidder;
    }

    function getMinimumBid() public view returns (uint256) {
        return i_minimumBid;
    }

    function getSellerAddress() public view returns (address) {
        return i_seller;
    }

    function isOpen() public view returns (bool) {
        return s_isOpen;
    }

    function getNumberOfBidders() public view returns (uint256) {
        return s_currentNumberOfBidders;
    }

    function getMaximumNumberOfBidders() public view returns (uint256) {
        return i_maximumNumberOfBidders;
    }

    function getAuctioneerCollateralAmount() public view returns (uint256) {
        return i_auctioneerCollateralAmount;
    }

    function getSellerCollateralAmount() public view returns (uint256) {
        return i_sellerCollateralAmount;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }

    function getStartTimestamp() public view returns (uint256) {
        return i_startTimestamp;
    }

    function getOpenThreshold() public pure returns (uint256) {
        return OPEN_INTERVAL_THRESHOLD;
    }

    function getTimePassedSinceStart() public view returns (uint256) {
        return block.timestamp - i_startTimestamp;
    }

    function getTimeUntilClosing() public view auctionOpen returns (uint256) {
        return i_interval - getTimePassedSinceStart();
    }

    function getTimeUntilThreshold() public view returns (uint256) {
        return (getTimePassedSinceStart() >= OPEN_INTERVAL_THRESHOLD) ? 0 : (OPEN_INTERVAL_THRESHOLD - getTimePassedSinceStart());
    }

    function getCloseTimestamp() public view auctionClosed returns (uint256) {
        return s_closeTimestamp;
    }

    function getTimePassedSinceAuctionClosed() public view auctionClosed returns (uint256) {
        return block.timestamp - s_closeTimestamp;
    }

    function getClosedInterval() public pure returns (uint256) {
        return CLOSED_INTERVAL;
    }

    function getTimeUntilDestroy() public view auctionClosed returns (uint256) {
        return CLOSED_INTERVAL - getTimePassedSinceAuctionClosed();
    }

    function canICloseAuction() public view onlySeller returns (bool) {
        return getTimeUntilThreshold() == 0;
    }

}
