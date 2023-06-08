import { useQuery } from "@apollo/client"
import AuctionBox from "./AuctionBox"
import { useMoralis } from "react-moralis"
import { LockOpen, LockClosed, Select } from "web3uikit"
import { useState } from "react"
import Loading from "../illustrations/Loading"
import NotConnected from "../illustrations/NotConnected"
import NothingToShow from "../illustrations/NothingToShow"

export default function AuctionList({ query, type }) {
    const { loading, error, data: auctions } = useQuery(query)
    const { isWeb3Enabled } = useMoralis()
    const [stateFilterId, setStateFilterId] = useState("all")

    return (
        <div>
            {isWeb3Enabled ? (
                loading || !auctions ? (
                    <div className="p-8">
                        <Loading />
                    </div>
                ) : (
                    <div className="flex flex-col gap-8 p-8">
                        <Select
                            defaultOptionIndex={0}
                            id="Select"
                            label="State filter"
                            onChange={(event) => {
                                setStateFilterId(event.id)
                            }}
                            options={[
                                {
                                    id: 'all',
                                    label: 'All'
                                },
                                {
                                    id: 'open',
                                    label: 'Open',
                                    prefix: <LockOpen />
                                },
                                {
                                    id: 'closed',
                                    label: 'Closed',
                                    prefix: <LockClosed />
                                }
                            ]}
                        />
                        <div className="flex flex-wrap">
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
                                                    stateFilterId={stateFilterId}
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
                                                        stateFilterId={stateFilterId}
                                                    />
                                                )
                                        })
                                    ) :
                                    (<NothingToShow />))
                            }
                        </div>
                    </div>
                )
            ) : (
                <NotConnected />
            )}
        </div>
    )
}