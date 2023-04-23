const fs = require("fs")
const src = "artifacts/contracts/Auction.sol/Auction.json"
const dst = "../nextjs-frontend/constants/Auction.json"

const artifact = fs.readFileSync(src)
fs.writeFileSync(dst, artifact)

module.exports = async () => {
    const artifact = fs.readFileSync(src)
    fs.writeFileSync(dst, artifact)
}