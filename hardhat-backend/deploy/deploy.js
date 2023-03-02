const { network, ethers } = require("hardhat")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { seller } = await getNamedAccounts()
    const chainId = network.config.chainId
    const minimumBid = ethers.utils.parseEther("0.01")
    const maximumNumberOfBidders = 5
    const auctioneerCollateralAmount = ethers.utils.parseEther("0.1")
    const sellerCollateralAmount = ethers.utils.parseEther("0.1")
    const auction = await deploy("Auction", {
        value: sellerCollateralAmount,
        from: seller,
        args: [minimumBid, maximumNumberOfBidders, auctioneerCollateralAmount],
        log: true,
    })
    log(`Auction deployed at ${auction.address}`)
}

module.exports.tags = ["all", "auction"]