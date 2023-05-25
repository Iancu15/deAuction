const fs = require("fs")
const srcAuction = "artifacts/contracts/Auction.sol/Auction.json"
const srcAuctionFactory = "artifacts/contracts/AuctionFactory.sol/AuctionFactory.json"
const dst = "../nextjs-frontend/constants/Auction.json"
const dstAbiAuction = "../nextjs-frontend/constants/AuctionAbi.json"
const dstAbiFactory = "../nextjs-frontend/constants/FactoryAbi.json"
const dstAbiGraphAuctionFactory = "../graph-database/abis/AuctionFactory.json"
const dstAbiGraphAuction = "../graph-database/abis/Auction.json"

module.exports = async () => {
    const artifactAuction = JSON.parse(fs.readFileSync(srcAuction))
    fs.writeFileSync(dst, JSON.stringify(artifactAuction))
    const auctionAbi = JSON.stringify(artifactAuction.abi)
    fs.writeFileSync(dstAbiGraphAuction, auctionAbi)
    fs.writeFileSync(dstAbiAuction, auctionAbi)
    const artifactAuctionFactory = JSON.parse(fs.readFileSync(srcAuctionFactory))
    const factoryAbi = JSON.stringify(artifactAuctionFactory.abi)
    fs.writeFileSync(dstAbiGraphAuctionFactory, factoryAbi)
    fs.writeFileSync(dstAbiFactory, factoryAbi)
}