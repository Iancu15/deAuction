const fs = require("fs")
const abiFactoryLocation = "../../nextjs-frontend/constants/FactoryAbi.json"
const factoryAddressLocation = "../../nextjs-frontend/constants/factoryAddress.json"
const Web3 = require("web3")

const web3 = new Web3("https://sepolia.infura.io/v3/f04bd660d0c34e348961d935e2e885d4");
const abi = fs.readFileSync(abiFactoryLocation)
const factoryAddress = (JSON.parse(fs.readFileSync(factoryAddressLocation))).address
const contract = new web3.eth.Contract(JSON.parse(abi), factoryAddress);
const events = contract.getPastEvents('AuctionDeployed', { fromBlock: 3377176, toBlock: 'latest' });
events.then((result) => {
    console.log(result);
  }).catch((error) => {
    console.error(error);
  });