// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.7;

error Auction__BidBelowMinimumBid(uint256 bid, uint256 minimumBid);
error Auction__HighestBidderCantWithdraw();
error Auction__TransactionFailed();
error Auction__MaximumNumbersOfBiddersReached(uint256 maximumNumberOfBidders);
error Auction__SellerCantEnterAuction();
error Auction__DidntEnterAuction();
error Auction__AuctionIsStillOpen();
error Auction__RoutingReservedForHighestBidder();
error Auction__OnlySellerCanCallFunction();

// TO DO
// destroy function (maybe let seller destroy preemptevely)
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


    constructor(uint256 minimumBid, uint256 maximumNumberOfBidders) {
        i_minimumBid = minimumBid;
        i_seller = msg.sender;
        i_maximumNumberOfBidders = maximumNumberOfBidders;
        s_isOpen = true;
        s_currentNumberOfBidders = 0;
    }

    function enterAuction() public payable {
        if (msg.sender == i_seller) {
            revert Auction__SellerCantEnterAuction();
        }

        if (s_currentNumberOfBidders == i_maximumNumberOfBidders) {
            revert Auction__MaximumNumbersOfBiddersReached(i_maximumNumberOfBidders);
        }

        if (msg.value < i_minimumBid) {
            revert Auction__BidBelowMinimumBid({
                bid: msg.value,
                minimumBid: i_minimumBid
            });
        }

        s_auctioneerToCurrentBid[msg.sender] = msg.value;
        if (msg.value > s_currentHighestBid) {
            s_currentHighestBid = msg.value;
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
        (bool success, ) = payable(msg.sender).call{value: currentBid}("");
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
            (bool success, ) = payable(auctioneer).call{value: bid}("");
            if (!success) {
                revert Auction__TransactionFailed();
            }
        }
    }

    function routeHighestBid() public auctionClosed {
        if (msg.sender != s_currentHighestBidder) {
            revert Auction__RoutingReservedForHighestBidder();
        }

        (bool success, ) = payable(i_seller).call{value: s_currentHighestBid}("");
        if (!success) {
            revert Auction__TransactionFailed();
        }

        destroyContract();
    }

    function destroyContract() internal {
        selfdestruct(payable(address(this)));
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

    function getMyCurrentBid() public view returns (uint256) {
        return s_auctioneerToCurrentBid[msg.sender];
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getCurrentHighestBid() public view returns (uint256) {
        return s_currentHighestBid;
    }

    function doIHaveTheHighestBid() public view returns (bool) {
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

}