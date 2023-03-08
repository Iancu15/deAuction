require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
require("solidity-coverage")
require("hardhat-deploy")

const COMPILER_SETTINGS = {
    optimizer: {
        enabled: true,
        runs: 1000000,
    },
    metadata: {
        bytecodeHash: "none",
    },
}

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            blockConfirmations: 1
        }
    },
    solidity: {
        compilers: [
            {
                version: "0.8.7",
                COMPILER_SETTINGS
            },
            {
                version: "0.6.6",
                COMPILER_SETTINGS
            },
            {
                version: "0.4.24",
                COMPILER_SETTINGS
            },
        ]
    },
    namedAccounts: {
        seller: {
            default: 0,
        }
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true
    }
};
