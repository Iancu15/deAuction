const fs = require("fs")
const abiFile = "../nextjs-frontend/constants/abi.json"

module.exports = async () => {
    const auction = await ethers.getContract("Auction")
    fs.writeFileSync(abiFile, auction.interface.format(ethers.utils.FormatTypes.json))
    console.log(`Updated abi`)
}

module.exports.tags = ["all", "abi"]