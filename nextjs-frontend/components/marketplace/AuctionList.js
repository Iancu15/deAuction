import { useQuery } from "@apollo/client"
import AuctionBox from "./AuctionBox"
import { useMoralis } from "react-moralis"
import { useEffect } from "react"
import Loading from "../illustrations/Loading"
import NotConnected from "../illustrations/NotConnected"
import NothingToShow from "../illustrations/NothingToShow"

export default function AuctionList({ query, type }) {
    const { loading, error, data: auctions } = useQuery(query)
    const { isWeb3Enabled } = useMoralis()

    return (
        <div>
            {isWeb3Enabled ? (
                loading || !auctions ? (
                    <div className="p-8">
                        <Loading />
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-8 p-8">
                        {
                            (type == "entered") ?
                            (auctions.auctionAuctioneerEntities.length > 0 ?
                                (
                                    auctions.auctionAuctioneerEntities.map((entity) => {
                                        const { auctioneerAddress, auction } = entity
                                        const { id, sellerAddress, state } = auction
                                        return (
                                            <AuctionBox
                                                contractAddress={id}
                                                sellerAddress={sellerAddress}
                                                currUserAddress={auctioneerAddress}
                                                state={state}
                                                searchQuery={``}
                                            />
                                        )
                                    })
                                ) :
                                (<NothingToShow />)) :
                            (auctions.auctionEntities.length > 0 ?
                                (
                                    auctions.auctionEntities.map((auction) => {
                                        const { id, sellerAddress, state } = auction
                                        return (
                                            <AuctionBox
                                                contractAddress={id}
                                                sellerAddress={sellerAddress}
                                                currUserAddress={sellerAddress}
                                                state={state}
                                                searchQuery={``}
                                            />
                                        )
                                    })
                                ) :
                                (<NothingToShow />))
                        }
                    </div>
                )
            ) : (
                <NotConnected />
            )}
        </div>
    )
}