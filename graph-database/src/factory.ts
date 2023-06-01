import { AuctionDeployed } from "../generated/AuctionFactory/AuctionFactory"
import { AuctionEntity } from "../generated/schema"
import { Auction } from "../generated/templates"

export function handleAuctionDeployed(event: AuctionDeployed): void {
  Auction.create(event.params.contractAddress)
  let entity = new AuctionEntity(event.params.contractAddress)
  entity.sellerAddress = event.params.sellerAddress
  entity.state = 0
  entity.save()
}
