const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")

async function equal(a, b) {
    assert.equal((await a).toString(), b.toString())
}

describe("Auction", function () {
    let seller
    let auctioneer1
    let auction
    let accounts

    async function auctioneer1EnterAuction() {
        await auction.connect(auctioneer1).enterAuction({
            value: ethers.utils.parseEther("0.3")
        })
    }

    async function auctioneerHasHighestBid(accountIndex) {
        for (let index = 1; index <= 5; index++) {
            if (index == accountIndex) {
                await equal(auction.connect(accounts[index]).doIHaveTheHighestBid(), true)
            } else {
                await equal(auction.connect(accounts[index]).doIHaveTheHighestBid(), false)
            }
        }
    }

    async function testHighestBid(accountIndex, value) {
        await auctioneerHasHighestBid(accountIndex)
        await equal(auction.getCurrentHighestBid(), ethers.utils.parseEther(value.toString()))
    }

    async function bidOfAccountEquals(accountIndex, bid) {
        await equal(auction.connect(accounts[accountIndex]).getMyCurrentBid(), ethers.utils.parseEther(bid.toString()))
    }

    beforeEach(async () => {
        accounts = await ethers.getSigners()
        auctioneer1 = accounts[1]
        seller = (await getNamedAccounts()).seller
        await deployments.fixture(["all"])
        auction = await ethers.getContract("Auction", seller)
    })

    describe("constructor", function () {
        it("sets the fields correctly", async () => {
            await equal(auction.getMinimumBid(), ethers.utils.parseEther("0.01"))
            await equal(auction.getSellerAddress(), seller)
            await equal(auction.getAuctioneerCollateralAmount(), ethers.utils.parseEther("0.1"))
            await equal(auction.isOpen(), true)
            await equal(auction.getNumberOfBidders(), 0)
            await equal(auction.getMaximumNumberOfBidders(), 5)
            await equal(auction.getSellerCollateralAmount(), ethers.utils.parseEther("0.1"))
        }) 
    })

    describe("enterAuction", function () {
        it("fails when seller tries to enter", async () => {
            await expect(auction.enterAuction()).to.be.revertedWithCustomError(
                auction,
                "Auction__SellerCantCallFunction"
            )
        })

        it("fails when message value is below collateral amount", async () => {
            await expect(auction.connect(auctioneer1).enterAuction(
                {
                    value: ethers.utils.parseEther("0.09")
                })
            ).to.be.revertedWithCustomError(
                auction,
                "Auction__DidntCoverCollateral"
            )
        })

        it("fails when bid is zero", async () => {
            await expect(auction.connect(auctioneer1).enterAuction(
                {
                    value: ethers.utils.parseEther("0.1")
                })
            ).to.be.revertedWithCustomError(
                auction,
                "Auction__ZeroStartingBid"
            )
        })

        it("fails when bid is below minimum bid", async () => {
            await expect(auction.connect(auctioneer1).enterAuction(
                {
                    value: ethers.utils.parseEther("0.105")
                })
            ).to.be.revertedWithCustomError(
                auction,
                "Auction__BidBelowMinimumBid"
            )
        })

        it("adds bid to mapping", async () => {
            await equal(auction.connect(auctioneer1).doIHaveTheHighestBid(), false)
            await auctioneer1EnterAuction();
            await testHighestBid(1, 0.2)
        })

        it("increments number of bidders", async () => {
            await auctioneer1EnterAuction();
            await equal(auction.connect(auctioneer1).getNumberOfBidders(), 1)
        })

        it("modifies highest bid", async () => {
            await auction.connect(accounts[2]).enterAuction({
                value: ethers.utils.parseEther("0.15")
            })

            await testHighestBid(2, 0.05)
            await auction.connect(accounts[3]).enterAuction({
                value: ethers.utils.parseEther("0.11")
            })

            await bidOfAccountEquals(3, 0.01)
            await testHighestBid(2, 0.05)
            await auction.connect(accounts[4]).enterAuction({
                value: ethers.utils.parseEther("0.18")
            })

            await testHighestBid(4, 0.08)
            await auction.connect(accounts[5]).enterAuction({
                value: ethers.utils.parseEther("0.13")
            })

            await bidOfAccountEquals(5, 0.03)
            await testHighestBid(4, 0.08)
            await auctioneer1EnterAuction();
            await testHighestBid(1, 0.2)
        })

        it("fails when the maximum number of bidders is reached", async () => {
            for (let index = 2; index <= 6; index++) {
                await equal(auction.getNumberOfBidders(), index - 2)
                await auction.connect(accounts[index]).enterAuction({
                    value: ethers.utils.parseEther("0.15")
                })
            }

            await equal(auction.getNumberOfBidders(), await auction.getMaximumNumberOfBidders())
            await expect(auction.connect(auctioneer1).enterAuction(
                {
                    value: ethers.utils.parseEther("1.5")
                })
            ).to.be.revertedWithCustomError(
                auction,
                "Auction__MaximumNumbersOfBiddersReached"
            )
        })
    })

    describe("increaseBid", function () {
        it("fails when auctioneer didnt enter auction", async () => {
            await expect(auction.connect(auctioneer1).increaseBid(
                {
                    value: ethers.utils.parseEther("0.5")
                })
            ).to.be.revertedWithCustomError(
                auction,
                "Auction__DidntEnterAuction"
            )
        })

        it("fails when increase value is zero", async () => {
            await auctioneer1EnterAuction()
            await expect(auction.connect(auctioneer1).increaseBid(
                {
                    value: ethers.utils.parseEther("0")
                })
            ).to.be.revertedWithCustomError(
                auction,
                "Auction__RedundantZeroBidIncrease"
            )
        })

        it("increases bid in mapping", async () => {
            await auctioneer1EnterAuction();
            await auction.connect(auctioneer1).increaseBid({
                value: ethers.utils.parseEther("0.5")
            })

            testHighestBid(1, 2.5)
        })

        it("modifies highest bid", async () => {
            for (let index = 1; index <= 3; index++) {
                await auction.connect(accounts[index]).enterAuction({
                    value: ethers.utils.parseEther("0.11")
                })
            }

            await auction.connect(accounts[2]).increaseBid({
                value: ethers.utils.parseEther("0.04")
            })

            await testHighestBid(2, 0.05)
            await auction.connect(accounts[3]).increaseBid({
                value: ethers.utils.parseEther("0.01")
            })

            await bidOfAccountEquals(3, 0.02)
            await testHighestBid(2, 0.05)
            await auction.connect(auctioneer1).increaseBid({
                value: ethers.utils.parseEther("1.9")
            })

            testHighestBid(1, 2)
        })
    })

    describe("leaveAuction", function () {
        it("fails when the caller is the highest bidder", async () => {
            await auctioneer1EnterAuction()
            await expect(auction.connect(auctioneer1).leaveAuction())
            .to.be.revertedWithCustomError(
                auction,
                "Auction__HighestBidderCantWithdraw"
            )
        })

        it("fails when caller didnt enter auction", async () => {
            await expect(auction.connect(auctioneer1).leaveAuction())
            .to.be.revertedWithCustomError(
                auction,
                "Auction__DidntEnterAuction"
            )
        })
    })

    describe("getMyCurrentBid", function () {
        it("fails when caller is the seller", async () => {
            await expect(auction.enterAuction(
                {
                    value: ethers.utils.parseEther("1.5")
                })
            ).to.be.revertedWithCustomError(
                auction,
                "Auction__SellerCantCallFunction"
            )
        })
    })

    describe("doIHaveTheHighestBid", function () {
        it("fails when caller is the seller", async () => {
            await expect(auction.enterAuction(
                {
                    value: ethers.utils.parseEther("1.5")
                })
            ).to.be.revertedWithCustomError(
                auction,
                "Auction__SellerCantCallFunction"
            )
        })
    })
})