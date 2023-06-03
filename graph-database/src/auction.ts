import { AuctionClosed, AuctionDestroyed } from "../generated/templates/Auction/Auction"
import { AuctionEntity } from "../generated/schema"

export function handleAuctionClosed(event: AuctionClosed): void {
  let entity = AuctionEntity.load(event.params.contractAddres)
  entity!.state = 1
  entity!.save()
}

export function handleAuctionDestroyed(event: AuctionDestroyed): void {
    let entity = AuctionEntity.load(event.params.contractAddres)
    entity!.state = parseInt(event.params.status.toString()) as i32
    entity!.destroyedTimestamp = parseInt(event.params.timestamp.toString()) as i32
    entity!.infoCID = event.params.infoCID
    entity!.save()
}