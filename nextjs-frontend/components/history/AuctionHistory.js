import { useQuery } from "@apollo/client"
import { useMoralis } from "react-moralis"
import { useState, useEffect } from "react"
import NotConnected from "../illustrations/NotConnected"
import Loading from "../illustrations/Loading"
import NothingToShow from "../illustrations/NothingToShow"
import FinishedAuctionEntry from "./FinishedAuctionEntry"

export default function AuctionHistory({ query }) {
    const { loading, error, data: finishedAuctions } = useQuery(query)
    const { isWeb3Enabled } = useMoralis()

    return (
        <div className="flex flex-wrap gap-8 p-8">
            {isWeb3Enabled ? (
                loading || !finishedAuctions ? (
                    <Loading />
                ) : (
                    <div>
                        {
                            finishedAuctions.auctionEntities.length > 0 ?
                            (
                                finishedAuctions.auctionEntities.map((auction) => {
                                    const { id, sellerAddress, state } = auction
                                    return (
                                        <FinishedAuctionEntry
                                        />
                                    )
                                })
                            ) :
                            (<NothingToShow />)
                        }
                    </div>
                )
            ) : (
                <NotConnected />
            )}
        </div>
    )
}