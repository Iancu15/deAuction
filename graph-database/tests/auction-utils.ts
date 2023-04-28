import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import { ContractDeployed } from "../generated/Auction/Auction"

export function createContractDeployedEvent(
  contractAddress: Address
): ContractDeployed {
  let contractDeployedEvent = changetype<ContractDeployed>(newMockEvent())

  contractDeployedEvent.parameters = new Array()

  contractDeployedEvent.parameters.push(
    new ethereum.EventParam(
      "contractAddress",
      ethereum.Value.fromAddress(contractAddress)
    )
  )

  return contractDeployedEvent
}
