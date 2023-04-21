const fs = require("fs")
// @ts-ignore
const solc = require('solc')
const bytecodeFile = "../nextjs-frontend/constants/bytecode"
const contractFile = "contracts/Auction.sol"
const automationCompatiblePath = "node_modules/@chainlink/contracts/src/v0.8/AutomationCompatible.sol"
const automationBasePath = "node_modules/@chainlink/contracts/src/v0.8/AutomationBase.sol"
const automationCompatibleInterfacePath = "node_modules/@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol"

module.exports = async () => {
    const source = fs.readFileSync(contractFile, 'utf8')
    const automationCompatible = fs.readFileSync(automationCompatiblePath, 'utf-8')
    const automationBase = fs.readFileSync(automationBasePath, 'utf8')
    const automationCompatibleInterface = fs.readFileSync(automationCompatibleInterfacePath, 'utf-8')
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

    function findImports(path) {
        if (path === "@chainlink/contracts/src/v0.8/AutomationCompatible.sol")
            return {
                contents: automationCompatible
            }
        else if (path === "@chainlink/contracts/src/v0.8/AutomationBase.sol") {
            return {
                contents: automationBase
            }
        }
        else if (path === "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol") {
            return {
                contents: automationCompatibleInterface
            }
        }
        else return { error: 'File not found' }
    }

    const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }))
    const bytecode = output.contracts['Auction.sol']['Auction'].evm.bytecode.object
    fs.writeFileSync(bytecodeFile, bytecode)
    console.log(`Updated bytecode`)
}

module.exports.tags = ["all", "bytecode"]