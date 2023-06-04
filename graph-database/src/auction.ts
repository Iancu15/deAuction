import { AuctionClosed, AuctionCancelled, AuctionSucceeded, AuctionFailed } from "../generated/templates/Auction/Auction"
import { AuctioneerEnteredAuction, AuctioneerLeftAuction } from "../generated/templates/Auction/Auction"
import { AuctionEntity } from "../generated/schema"
import { AuctionAuctioneerEntity } from "../generated/schema"
import { Address, Bytes } from "@graphprotocol/graph-ts"

export function handleAuctionClosed(event: AuctionClosed): void {
    let entity = AuctionEntity.load(event.address)
    entity!.state = 1
    entity!.save()
}

export function handleAuctionCancelled(event: AuctionCancelled): void {
    let entity = AuctionEntity.load(event.address)
    entity!.state = 4
    entity!.destroyedTimestamp = parseInt(event.params.timestamp.toString()) as i32
    entity!.infoCID = event.params.infoCID
    entity!.save()
}

export function handleAuctionSucceeded(event: AuctionSucceeded): void {
    let entity = AuctionEntity.load(event.address)
    entity!.state = 2
    entity!.destroyedTimestamp = parseInt(event.params.timestamp.toString()) as i32
    entity!.infoCID = event.params.infoCID
    entity!.auctionWinner = event.params.auctionWinner
    entity!.winningBid = event.params.winningBid
    entity!.save()
}

export function handleAuctionFailed(event: AuctionFailed): void {
    let entity = AuctionEntity.load(event.address)
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

export function handleAuctioneerEnteredAuction(event: AuctioneerEnteredAuction): void {
    const auctionEntity = AuctionEntity.load(event.address)
    const id = getAuctioneerAuctionEntityID(auctionEntity!.id, event.params.auctioneerAddress)
    let auctionAuctioneerEntity = AuctionAuctioneerEntity.load(id)
    if (!auctionAuctioneerEntity) {
        auctionAuctioneerEntity = new AuctionAuctioneerEntity(id)
    }

    auctionAuctioneerEntity.auctioneerAddress = event.params.auctioneerAddress
    auctionAuctioneerEntity.auction = auctionEntity!.id
    auctionAuctioneerEntity.save()
}

export function handleAuctioneerLeftAuction(event: AuctioneerLeftAuction): void {
    const auctionEntity = AuctionEntity.load(event.address)
    const id = getAuctioneerAuctionEntityID(auctionEntity!.id, event.params.auctioneerAddress)
    let auctionAuctioneerEntity = AuctionAuctioneerEntity.load(id)
    auctionAuctioneerEntity!.auctioneerAddress = Address.fromString("0x0000000000000000000000000000000000000000")
    auctionAuctioneerEntity!.save()
}

function getAuctioneerAuctionEntityID(auctionID: Bytes, auctioneerAddress: Address): string {
    return auctionID.toHexString() + auctioneerAddress.toHexString()
}