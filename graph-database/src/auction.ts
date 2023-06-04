import { AuctionClosed, AuctionCancelled, AuctionSucceeded, AuctionFailed } from "../generated/templates/Auction/Auction"
import { AuctionEntity } from "../generated/schema"

export function handleAuctionClosed(event: AuctionClosed): void {
    let entity = AuctionEntity.load(event.params.contractAddress)
    entity!.state = 1
    entity!.save()
}

export function handleAuctionCancelled(event: AuctionCancelled): void {
    let entity = AuctionEntity.load(event.params.contractAddress)
    entity!.state = 4
    entity!.destroyedTimestamp = parseInt(event.params.timestamp.toString()) as i32
    entity!.infoCID = event.params.infoCID
    entity!.save()
}

export function handleAuctionSucceeded(event: AuctionSucceeded): void {
    let entity = AuctionEntity.load(event.params.contractAddress)
    entity!.state = 2
    entity!.destroyedTimestamp = parseInt(event.params.timestamp.toString()) as i32
    entity!.infoCID = event.params.infoCID
    entity!.auctionWinner = event.params.auctionWinner
    entity!.winningBid = event.params.winningBid
    entity!.save()
}

export function handleAuctionFailed(event: AuctionFailed): void {
    let entity = AuctionEntity.load(event.params.contractAddress)
    if (event.params.timeOut) {
    entity!.state = 5
    } else {
    entity!.state = 3
    }

    entity!.destroyedTimestamp = parseInt(event.params.timestamp.toString()) as i32
    entity!.infoCID = event.params.infoCID
    entity!.auctionWinner = event.params.auctionWinner
    entity!.winningBid = event.params.winningBid
    entity!.sellerCollateral = event.params.sellerCollateral
    entity!.save()
}