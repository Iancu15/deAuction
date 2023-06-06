import { useQuery } from "@apollo/client"
import { useMoralis } from "react-moralis"
import { Table } from "web3uikit"
import NotConnected from "../illustrations/NotConnected"
import Loading from "../illustrations/Loading"
import NothingToShow from "../illustrations/NothingToShow"
import IpfsTitle from "./IpfsTitle.js"
import StateTag from "./StateTag"
import HistoryRelevantInfo from "./HistoryRelevantInfo"
import EllipsisAddress from "./EllipsisAddress"
import { useState } from "react"

export default function AuctionHistory({ query, type }) {
    const { loading, error, data: finishedAuctions } = useQuery(query)
    const { isWeb3Enabled } = useMoralis()
    const [filterState, setFilterState] = useState(-1)

    function getDate(secondsSinceEpoch) {
        return new Date(secondsSinceEpoch * 1000)
    }

    return (
        <div className="flex flex-wrap gap-8 p-8">
            {isWeb3Enabled ? (
                loading || !finishedAuctions ? (
                    <Loading />
                ) : (
                    <div className="w-full">
                        {
                            finishedAuctions.auctionEntities.length > 0 ?
                            (
                                <div className="w-full m-auto">
                                <Table
                                    columnsConfig="200px 3fr 1fr 1.3fr 8fr 100px"
                                    data={
                                        finishedAuctions.auctionEntities.map((auction) => {
                                            console.log(auction)
                                            const {
                                                id,
                                                sellerAddress,
                                                state,
                                                infoCID,
                                                destroyedTimestamp,
                                                auctionWinner,
                                                winningBid,
                                                sellerCollateral,
                                                auctioneerCollateral
                                            } = auction

                                            const date = getDate(destroyedTimestamp)
                                            const endDate = date.toLocaleDateString()
                                            return (
                                                [
                                                    <EllipsisAddress address={id} />,
                                                    <IpfsTitle infoCID={infoCID} />,
                                                    <StateTag state={state} onClick={() => {
                                                        if (filterState === state) {
                                                            setFilterState(-1)
                                                        } else {
                                                            setFilterState(state)
                                                        }
                                                    }}/>,
                                                    <div>
                                                        { type === "finished" ? <EllipsisAddress address={auctionWinner} />
                                                        : <EllipsisAddress address={sellerAddress} /> }
                                                    </div>,
                                                    <HistoryRelevantInfo
                                                        state={state}
                                                        winningBid={winningBid}
                                                        sellerCollateral={sellerCollateral}
                                                        auctioneerCollateral={auctioneerCollateral}
                                                        type={type}
                                                    />,
                                                    <p>{endDate}</p>
                                                ]
                                            )
                                        })
                                    }
                                    isColumnSortable = {[
                                        false,
                                        false,
                                        false,
                                        false,
                                        false,
                                        true
                                    ]}
                                    header={[
                                        <span>Id</span>,
                                        <span>Title</span>,
                                        <span>Type</span>,
                                        <span>{ type === "finished" ? "Auction winner" : "Seller address" }</span>,
                                        <span>Relevant info</span>,
                                        <span>End date</span>
                                    ]}
                                    noPagination
                                    onPageNumberChanged={function noRefCheck(){}}
                                    onRowClick={function noRefCheck(){}}
                                />
                                </div>
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