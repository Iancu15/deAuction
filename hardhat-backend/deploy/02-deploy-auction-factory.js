const { network, ethers } = require("hardhat")
const fs = require("fs")
const addressDst = "../nextjs-frontend/constants/factoryAddress.json"

module.exports = async ({ getNamedAccounts, deployments }) => {
    if (process.env.DEPLOY_AUCTION_FACTORY === 'true') {
        const { deploy } = deployments
        const { deployer } = await getNamedAccounts()
        const auctionFactory = await deploy("AuctionFactory", {
            from: deployer,
            args: [],
            log: true,
            waitConfirmations: network.config.blockConfirmations || 1
        })
        console.log(`Auction factory deployed at ${auctionFactory.address}`)
        const addressObject = {
            "address": auctionFactory.address
        }
        fs.writeFileSync(addressDst, JSON.stringify(addressObject))
    }
}