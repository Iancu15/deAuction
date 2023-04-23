const { network } = require("hardhat")
const fs = require("fs")
const dst = "../nextjs-frontend/constants/network.json"

module.exports = async () => {
    fs.writeFileSync(dst, JSON.stringify({
        name: network.name,
        chainId: network.config.chainId,
        blockConfirmations: network.config.blockConfirmations
    }))
}