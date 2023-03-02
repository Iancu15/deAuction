require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
require("solidity-coverage")
require("hardhat-deploy")

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            // gasPrice: 130000000000,
        }
    },
    solidity: {
        compilers: [
            {
                version: "0.8.7",
            },
            {
                version: "0.6.6",
            }
        ]
    },
    namedAccounts: {
        seller: {
            default: 0,
        }
    },
    gasReporter: {
        enabled: false,
        currency: "USD",
        outputFile: "gas-report.txt"
    }
};
