// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.7;

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

// TO DO
// timer (after x time to close the auction)

contract Auction {

    mapping(address => uint256) private s_auctioneerToCurrentBid;
    address[] private s_auctioneers;
    address private s_currentHighestBidder;
    uint256 private s_currentHighestBid;
    uint256 private s_currentNumberOfBidders;
    bool public s_isOpen;
    address private immutable i_seller;
    uint256 private immutable i_minimumBid;
    uint256 private immutable i_maximumNumberOfBidders;
    uint256 private immutable i_auctioneerCollateralAmount;
    uint256 private immutable i_sellerCollateralAmount;


    constructor(uint256 minimumBid, uint256 maximumNumberOfBidders, uint256 auctioneerCollateralAmount) payable {
        i_minimumBid = minimumBid;
        i_seller = msg.sender;
        i_maximumNumberOfBidders = maximumNumberOfBidders;
        i_auctioneerCollateralAmount = auctioneerCollateralAmount;
        i_sellerCollateralAmount = msg.value;
        s_isOpen = true;
        s_currentNumberOfBidders = 0;
    }

    modifier auctionClosed {
        if (s_isOpen) {
            revert Auction__AuctionIsStillOpen();
        }
        _;
    }

    modifier onlySeller {
        if (msg.sender != i_seller) {
            revert Auction__OnlySellerCanCallFunction();
        }
        _;
    }

    modifier notSeller {
        if (msg.sender == i_seller) {
            revert Auction__SellerCantCallFunction();
        }
        _;
    }

    function enterAuction() notSeller public payable {
        if (s_currentNumberOfBidders == i_maximumNumberOfBidders) {
            revert Auction__MaximumNumbersOfBiddersReached(i_maximumNumberOfBidders);
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

    function increaseBid() public payable {
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

    function leaveAuction() public {
        if (msg.sender == s_currentHighestBidder) {
            revert Auction__HighestBidderCantWithdraw();
        }

        uint256 currentBid = s_auctioneerToCurrentBid[msg.sender];
        if (currentBid == 0) {
            revert Auction__DidntEnterAuction();
        }

        s_auctioneerToCurrentBid[msg.sender] = 0;
        s_currentNumberOfBidders -= 1;
        (bool success, ) = payable(msg.sender).call{value: currentBid + i_auctioneerCollateralAmount}("");
        if (!success) {
            revert Auction__TransactionFailed();
        }
    }

    // TODO put below time limit
    function closeAuction() public onlySeller {
        if (s_currentHighestBid == 0) {
            destroyContract();
        }

        s_isOpen = false;
        address[] memory auctioneers = s_auctioneers;
        for (uint256 index = 0; index < auctioneers.length; index++) {
            address auctioneer = auctioneers[index];
            uint256 bid = s_auctioneerToCurrentBid[auctioneer];
            if (bid == 0 || auctioneer == s_currentHighestBidder) {
                continue;
            }

            s_auctioneerToCurrentBid[auctioneer] = 0;
            (bool success, ) = payable(auctioneer).call{value: bid + i_auctioneerCollateralAmount}("");
            if (!success) {
                revert Auction__TransactionFailed();
            }
        }
    }

    function routeHighestBid() public auctionClosed {
        if (msg.sender != s_currentHighestBidder) {
            revert Auction__RoutingReservedForHighestBidder();
        }

        (bool success, ) = payable(i_seller).call{value: s_currentHighestBid + i_sellerCollateralAmount}("");
        if (!success) {
            revert Auction__TransactionFailed();
        }

        (success, ) = payable(s_currentHighestBidder).call{value: i_auctioneerCollateralAmount}("");
        if (!success) {
            revert Auction__TransactionFailed();
        }

        destroyContract();
    }

    function burnAllStoredValue() public auctionClosed onlySeller {
        destroyContract();
    }

    function destroyContract() internal {
        selfdestruct(payable(address(this)));
    }

    function getAuctionWinner() public auctionClosed onlySeller view returns (address) {
        return s_currentHighestBidder;
    }

    function getMyCurrentBid() notSeller public view returns (uint256) {
        return s_auctioneerToCurrentBid[msg.sender];
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getCurrentHighestBid() public view returns (uint256) {
        return s_currentHighestBid;
    }

    function doIHaveTheHighestBid() notSeller public view returns (bool) {
        return (msg.sender == s_currentHighestBidder);
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

}