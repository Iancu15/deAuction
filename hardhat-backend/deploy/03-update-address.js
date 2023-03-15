const fs = require("fs")
const contractAddressFile = "../nextjs-frontend/constants/contractAddress.json"

module.exports = async () => {
    const auction = await ethers.getContract("Auction")
    fs.writeFileSync(contractAddressFile, JSON.stringify(auction.address))
    console.log(`Updated contract address`)
}