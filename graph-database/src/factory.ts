import { AuctionDeployed as AuctionDeployedEvent } from "../generated/AuctionFactory/AuctionFactory"
import { AuctionDeployed } from "../generated/schema"
import { Auction } from "../generated/templates"

export function handleAuctionDeployed(event: AuctionDeployedEvent): void {
  Auction.create(event.params.contractAddress)
  let entity = new AuctionDeployed(event.params.contractAddress)
  entity.sellerAddress = event.params.sellerAddress
  entity.save()
}
