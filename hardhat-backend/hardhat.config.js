require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
require("solidity-coverage")
require("hardhat-deploy")

const SEPOLIA_RPC_URL =
    process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY"
const PRIVATE_KEYS = process.env.PRIVATE_KEYS.split("|") || []
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ""

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
    defaultNetwork: "sepolia",
    networks: {
        hardhat: {
            chainId: 31337,
            blockConfirmations: 1
        },
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: PRIVATE_KEYS,
            saveDeployments: false,
            chainId: 11155111,
            blockConfirmations: 6
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
        deployer: {
            default: 0
        },
        account1: {
            default: 1
        },
        account2: {
            default: 2
        }
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "MATIC"
    }
};
