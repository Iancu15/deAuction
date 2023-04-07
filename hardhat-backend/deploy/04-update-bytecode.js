const fs = require("fs")
const solc = require('solc')
const bytecodeFile = "../nextjs-frontend/constants/bytecode.json"
const contractFile = "contracts/Auction.sol"

module.exports = async () => {
    const source = fs.readFileSync(contractFile, 'utf8')
    const input = {
        language: 'Solidity',
        sources: {
            'Auction.sol': {
            content: source
            }
        },
        settings: {
            outputSelection: {
            '*': {
                '*': [ 'evm.bytecode' ]
            }
            }
        }
    }

    const output = JSON.parse(solc.compile(JSON.stringify(input)))
    console.log(output)
    // for (var contractName in output.contracts['Auction.sol']) {
    //     console.log(
    //       contractName +
    //         ': ' +
    //         output.contracts['Auction.sol'][contractName].evm.bytecode.object
    //     );
    // }
    // const bytecode = output.contracts['Auction.sol']['Auction'].evm.bytecode.object
    // fs.writeFileSync(bytecodeFile, bytecode)
    console.log(`Updated bytecode`)
}

module.exports.tags = ["all", "bytecode"]