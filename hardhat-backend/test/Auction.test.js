const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const COLLATERAL_AMOUNT = ethers.utils.parseEther("0.1")
const MINIMUM_BID = ethers.utils.parseEther("0.01")
const INTERVAL = 7 * 24 * 3600
const DAY = 24 * 3600

async function equal(a, b) {
    assert.equal((await a).toString(), b.toString())
}

describe("Auction", function () {
    let seller
    let auctioneer1
    let auction
    let accounts

    async function auctioneer1EnterAuction() {
        return await auction.connect(auctioneer1).enterAuction({
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

    async function getBalance(accountIndex) {
        return await auction.provider.getBalance(accounts[accountIndex].address)
    }

    async function getContractBalance() {
        return await auction.provider.getBalance(auction.address)
    }

    async function getGasCost(transactionResponse) {
        const { gasUsed, effectiveGasPrice } = await transactionResponse.wait()
        return gasUsed.mul(effectiveGasPrice)
    }

    async function isContractDestroyed() {
        return (await auction.provider.getCode(auction.address)).toString() == "0x"
    }

    async function checkBalance(accountIndex, expectedBalance, gasCost) {
        await equal(getBalance(accountIndex), expectedBalance.sub(gasCost))
    }

    async function increaseTime(time) {
        await network.provider.send("evm_increaseTime", [time])
        await network.provider.request({ method: "evm_mine", params: [] })
    }

    async function closeAuction() {
        await increaseTime(DAY)
        return await auction.closeAuction()
    }

    async function assertTime(time, expectedTimeFactor) {
        assert(time >= DAY * (expectedTimeFactor - 0.1))
        assert(time < DAY * (expectedTimeFactor + 0.1))
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
            await equal(auction.getMinimumBid(), MINIMUM_BID)
            await equal(auction.getSellerAddress(), seller)
            await equal(auction.getAuctioneerCollateralAmount(), COLLATERAL_AMOUNT)
            await equal(auction.isOpen(), true)
            await equal(auction.getNumberOfBidders(), 0)
            await equal(auction.getMaximumNumberOfBidders(), 5)
            await equal(auction.getSellerCollateralAmount(), COLLATERAL_AMOUNT)
            await equal(auction.getInterval(), INTERVAL)
            await equal(auction.getOpenThreshold(), DAY)
            await equal(auction.getClosedInterval(), INTERVAL)
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
                    value: COLLATERAL_AMOUNT
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
                    value: ethers.utils.parseEther("0.3")
                })
            ).to.be.revertedWithCustomError(
                auction,
                "Auction__MaximumNumbersOfBiddersReached"
            )
        })

        it("fails when auction is closed", async () => {
            await auctioneer1EnterAuction();
            await closeAuction();
            await expect(auction.connect(accounts[2]).enterAuction(
                {
                    value: ethers.utils.parseEther("0.15")
                })
            ).to.be.revertedWithCustomError(
                auction,
                "Auction__AuctionIsClosed"
            )
        })
    })

    describe("increaseBid", function () {
        it("fails when auctioneer didn't enter auction", async () => {
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

        it("fails when caller didn't enter auction", async () => {
            await expect(auction.connect(auctioneer1).leaveAuction())
            .to.be.revertedWithCustomError(
                auction,
                "Auction__DidntEnterAuction"
            )
        })

        it("removes bid from mapping and decreases number of bidders", async () => {
            await equal(auction.connect(auctioneer1).getNumberOfBidders(), 0)
            await auctioneer1EnterAuction()
            await bidOfAccountEquals(1, 0.2)
            await auction.connect(accounts[2]).enterAuction({
                value: ethers.utils.parseEther("0.15")
            })

            await equal(auction.getNumberOfBidders(), 2)
            await bidOfAccountEquals(2, 0.05)
            await auction.connect(accounts[2]).leaveAuction()
            await bidOfAccountEquals(2, 0)
            await equal(auction.getNumberOfBidders(), 1)
        })

        it("sends money back to auctioneer", async () => {
            balanceAuctioneer2 = await getBalance(2)
            await auctioneer1EnterAuction()
            let transactionResponse = await auction.connect(accounts[2]).enterAuction({
                value: ethers.utils.parseEther("0.15")
            })

            let gasCost = await getGasCost(transactionResponse)
            transactionResponse = await auction.connect(accounts[2]).leaveAuction()
            gasCost = gasCost.add(await getGasCost(transactionResponse))
            await checkBalance(2, balanceAuctioneer2, gasCost)
        })
    })

    describe("closeAuction", function () {
        it("fails when is called by an auctioneer", async () => {
            await expect(auction.connect(auctioneer1).closeAuction()).to.be.revertedWithCustomError(
                auction,
                "Auction__OnlySellerCanCallFunction"
            )
        })

        it("fails when threshold timestamp wasn't reached", async () => {
            await expect(auction.closeAuction()).to.be.revertedWithCustomError(
                auction,
                "Auction__ThresholdNotReached"
            )
        })

        it("destroys the contract if there are no bids", async () => {
            await closeAuction()
            await equal(isContractDestroyed(), true)
        })

        it("closes the auction", async () => {
            await auctioneer1EnterAuction()
            await closeAuction()
            await equal(auction.isOpen(), false)
        })

        it("sends money back to the auctioneers that lost", async () => {
            let gasCosts = []
            let balances = []
            let transactionResponse
            for (let index = 2; index <= 5; index++) {
                balances[index] = await getBalance(index)
                transactionResponse = await auction.connect(accounts[index]).enterAuction({
                    value: ethers.utils.parseEther("0.15")
                })

                gasCosts[index] = await getGasCost(transactionResponse)
            }

            balances[1] = await getBalance(1)
            transactionResponse = await auctioneer1EnterAuction()
            gasCosts[1] = await getGasCost(transactionResponse)
            await closeAuction()
            for (let index = 2; index <= 5; index++) {
                await checkBalance(index, balances[index], gasCosts[index])
                await equal(auction.connect(accounts[index]).getMyCurrentBid(), 0)
            }

            await checkBalance(1, balances[1].sub(ethers.utils.parseEther("0.3")), gasCosts[1])
        })
    })

    describe("routeHighestBid", function () {
        it("fails when auction is open", async () => {
            await expect(
                auction.connect(auctioneer1).routeHighestBid()
            ).to.be.revertedWithCustomError(
                auction,
                "Auction__AuctionIsStillOpen"
            )
        })

        it("fails when caller isn't the highest bidder", async () => {
            await auctioneer1EnterAuction()
            transactionResponse = await auction.connect(accounts[2]).enterAuction({
                value: ethers.utils.parseEther("0.15")
            })

            await closeAuction()
            await expect(
                auction.connect(accounts[2]).routeHighestBid()
            ).to.be.revertedWithCustomError(
                auction,
                "Auction__RoutingReservedForHighestBidder"
            )
        })

        it("sends money to the seller", async () => {
            const balanceSeller = await getBalance(0)
            await auctioneer1EnterAuction()
            const transactionResponse = await closeAuction()
            const gasCost = await getGasCost(transactionResponse)
            await auction.connect(auctioneer1).routeHighestBid()
            await checkBalance(0, balanceSeller.add(ethers.utils.parseEther("0.3")), gasCost)
        })

        it("sends collateral back to highest bidder", async () => {
            const balanceAuctioneer = await getBalance(1)
            let transactionResponse = await auctioneer1EnterAuction()
            let gasCost = await getGasCost(transactionResponse)
            await closeAuction()
            transactionResponse = await auction.connect(auctioneer1).routeHighestBid()
            gasCost = gasCost.add(await getGasCost(transactionResponse))
            await checkBalance(1, balanceAuctioneer.sub(ethers.utils.parseEther("0.2")), gasCost)
        })

        it("destroys the contract", async () => {
            await auctioneer1EnterAuction()
            await closeAuction()
            equal(isContractDestroyed(), false)
            await auction.connect(auctioneer1).routeHighestBid()
            equal(isContractDestroyed(), true)
        })
    })

    describe("burnAllStoredValue", async () => {
        it("fails when auction is open", async () => {
            await expect(
                auction.burnAllStoredValue()
            ).to.be.revertedWithCustomError(
                auction,
                "Auction__AuctionIsStillOpen"
            )
        })

        it("fails when is called by an auctioneer", async () => {
            await auctioneer1EnterAuction()
            await closeAuction()
            await expect(
                auction.connect(auctioneer1).burnAllStoredValue()
            ).to.be.revertedWithCustomError(
                auction,
                "Auction__OnlySellerCanCallFunction"
            )
        })

        it("destroys the contract", async () => {
            await auctioneer1EnterAuction()
            await closeAuction()
            equal(isContractDestroyed(), false)
            await auction.burnAllStoredValue()
            equal(isContractDestroyed(), true)
        })
    })

    describe("getAuctionWinner", function () {
        it("fails when auction is open", async () => {
            await expect(
                auction.getAuctionWinner()
            ).to.be.revertedWithCustomError(
                auction,
                "Auction__AuctionIsStillOpen"
            )
        })

        it("fails when is called by an auctioneer", async () => {
            await auctioneer1EnterAuction()
            await closeAuction()
            await expect(
                auction.connect(auctioneer1).getAuctionWinner()
            ).to.be.revertedWithCustomError(
                auction,
                "Auction__OnlySellerCanCallFunction"
            )
        })

        it("returns the highest bidder", async () => {
            for (let index = 2; index <= 5; index++) {
                await auction.connect(accounts[index]).enterAuction({
                    value: ethers.utils.parseEther("0.15")
                })
            }

            await auctioneer1EnterAuction()
            await closeAuction()
            assert.equal(await auction.connect(seller).getAuctionWinner(), auctioneer1.address)
            for (let index = 2; index <= 5; index++) {
                assert.notEqual(await auction.connect(seller).getAuctionWinner(), accounts[index].address)
            }
        })
    })

    

    describe("getMyCurrentBid", function () {
        it("fails when caller is the seller", async () => {
            await expect(auction.enterAuction(
                {
                    value: ethers.utils.parseEther("0.15")
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
                    value: ethers.utils.parseEther("0.15")
                })
            ).to.be.revertedWithCustomError(
                auction,
                "Auction__SellerCantCallFunction"
            )
        })
    })

    describe("getTimeUntilClosing", function () {
        it("fails when auction is closed", async () => {
            await auctioneer1EnterAuction()
            await closeAuction()
            await expect(auction.getTimeUntilClosing()
            ).to.be.revertedWithCustomError(
                auction,
                "Auction__AuctionIsClosed"
            )
        })

        it("returns time until closing", async () => {
            assertTime(await auction.getTimeUntilClosing(), 7)
            await increaseTime(DAY * 0.5)
            assertTime(await auction.getTimeUntilClosing(), 6.5)
            await increaseTime(DAY * 2.5)
            assertTime(await auction.getTimeUntilClosing(), 4.5)
        })
    })

    describe("getCloseTimestamp", function () {
        it("fails when auction is open", async () => {
            await expect(auction.getCloseTimestamp()
            ).to.be.revertedWithCustomError(
                auction,
                "Auction__AuctionIsStillOpen"
            )
        })

        it("returns timestamp around the time it closed", async () => {
            await auctioneer1EnterAuction()
            await increaseTime(DAY * 3)
            await auction.closeAuction()
            assertTime((await auction.getCloseTimestamp()) - (await auction.getStartTimestamp()), 3)
        })
    })

    describe("getTimePassedSinceAuctionClosed", function () {
        it("fails when auction is open", async () => {
            await expect(auction.getTimePassedSinceAuctionClosed()
            ).to.be.revertedWithCustomError(
                auction,
                "Auction__AuctionIsStillOpen"
            )
        })

        it("returns time passed since auction closed", async () => {
            await auctioneer1EnterAuction()
            await closeAuction()
            await increaseTime(DAY * 6)
            assertTime(await auction.getTimePassedSinceAuctionClosed(), 6)

        })
    })

    describe("getTimeUntilDestroy", function () {
        it("fails when auction is open", async () => {
            await expect(auction.getTimeUntilDestroy()
            ).to.be.revertedWithCustomError(
                auction,
                "Auction__AuctionIsStillOpen"
            )
        })

        it("gets time until auction contract is destroyed", async () => {
            await auctioneer1EnterAuction()
            await closeAuction()
            await increaseTime(DAY * 4)
            assertTime(await auction.getTimeUntilDestroy(), 3)
        })
    })

    describe("getTimeUntilThreshold", function () {
        it("returns 0 when when the threshold is reached", async () => {
            assert.notEqual(await auction.getTimeUntilThreshold(), 0)
            await increaseTime(DAY * 0.5)
            assert.notEqual(await auction.getTimeUntilThreshold(), 0)
            await increaseTime(DAY * 0.5)
            assertTime(await auction.getTimeUntilThreshold(), 0)
            await increaseTime(DAY * 2)
            await equal(auction.getTimeUntilThreshold(), 0)
        })
    })

    describe("getTimePassedSinceStart", function () {
        it("returns the time passed since start timestamp", async () => {
            await equal(auction.getTimePassedSinceStart(), 0)
            await increaseTime(DAY * 0.5)
            assertTime(await auction.getTimePassedSinceStart(), 0.5)
            await increaseTime(DAY * 2.5)
            assertTime(await auction.getTimePassedSinceStart(), 3)
        })
    })

    describe("canICloseAuction", function () {
        it("fails when is called by an auctioneer", async () => {
            await expect(auction.connect(auctioneer1).canICloseAuction()
            ).to.be.revertedWithCustomError(
                auction,
                "Auction__OnlySellerCanCallFunction"
            )
        })

        it("returns true when when the threshold is reached", async () => {
            await equal(auction.canICloseAuction(), false)
            await increaseTime(DAY * 0.5)
            await equal(auction.canICloseAuction(), false)
            await increaseTime(DAY)
            await equal(auction.canICloseAuction(), true)
            await increaseTime(DAY * 2)
            await equal(auction.canICloseAuction(), true)
        })
    })

    describe("checkUpkeep", function () {
        it("it returns true if auction is open and interval passed", async () => {
            const { upkeepNeeded: upkeepNeeded1 } = await auction.callStatic.checkUpkeep("0x")
            assert(!upkeepNeeded1)
            await increaseTime(INTERVAL)
            const { upkeepNeeded: upkeepNeeded2 } = await auction.callStatic.checkUpkeep("0x")
            assert(upkeepNeeded2)
        })

        it("it returns true if auction is closed and closed interval passed", async () => {
            await auctioneer1EnterAuction()
            await closeAuction()
            const { upkeepNeeded: upkeepNeeded1 } = await auction.callStatic.checkUpkeep("0x")
            assert(!upkeepNeeded1)
            await increaseTime(INTERVAL)
            const { upkeepNeeded: upkeepNeeded2 } = await auction.callStatic.checkUpkeep("0x")
            assert(upkeepNeeded2)
        })
    })

    describe("performUpkeep", function () {
        it("fails when auction is open and interval hasn't passed", async () => {
            await expect(auction.performUpkeep("0x")
            ).to.be.revertedWithCustomError(
                auction,
                "Auction__UpkeepNotNeeded"
            )
        })

        it("fails when auction is closed and closed interval hasn't passed", async () => {
            await auctioneer1EnterAuction()
            await closeAuction()
            await expect(auction.performUpkeep("0x")
            ).to.be.revertedWithCustomError(
                auction,
                "Auction__UpkeepNotNeeded"
            )
        })

        it("closes the auction if auction is open and interval has passed", async () => {
            await auctioneer1EnterAuction()
            await increaseTime(INTERVAL)
            await auction.performUpkeep("0x")
            assert(!(await auction.isOpen()))
        })

        it("destroys the contract if auction is closed and closed interval has passed", async () => {
            await auctioneer1EnterAuction()
            await closeAuction()
            await increaseTime(INTERVAL)
            await auction.performUpkeep("0x")
            assert(await isContractDestroyed())
        })
    })

    describe("getContractBalance", function () {
        it("returns the balance of the contract", async () => {
            for (let index = 1; index <= 5; index++) {
                await auction.connect(accounts[index]).enterAuction({
                    value: ethers.utils.parseEther("0.2")
                })
            }

            await equal(auction.getContractBalance(), ethers.utils.parseEther("1.1"))
            await closeAuction()
            await equal(auction.getContractBalance(), ethers.utils.parseEther("0.3"))
        })
    })
})