# Auction Marketplace

## How to update project after modifying smart contracts

1. Run `yarn hardhat deploy` inside */hardhat-backend*
2. Copy the address of the new auction factory from the terminal and paste it
inside *networks.json* and *subgraph.yaml* inside */graph-database*
3. Run `graph codegen && graph build` and `graph deploy --studio auction-marketplace`
inside */graph-database* and put the next higher version (E.g. v0.0.1 -> v0.0.2)
4. Modify the version of the subgraph url inside */nextjs-frontend/.env* to
accomodate the new version
5. Rerun `yarn dev` inside */nextjs-frontend* to load the new *.env*
