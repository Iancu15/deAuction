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

export default function AuctionHistory({ query }) {
    const { loading, error, data: finishedAuctions } = useQuery(query)
    const { isWeb3Enabled } = useMoralis()

    function getDate(secondsSinceEpoch) {
        return new Date(secondsSinceEpoch * 1000)
    }

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
                                <div className="w-full m-auto">
                                <Table
                                    columnsConfig="200px 3fr 1fr 1.3fr 5.5fr 100px"
                                    data={
                                        finishedAuctions.auctionEntities.map((auction) => {
                                            const {
                                                id,
                                                state,
                                                infoCID,
                                                destroyedTimestamp,
                                                auctionWinner,
                                                winningBid,
                                                sellerCollateral
                                            } = auction

                                            const date = getDate(destroyedTimestamp)
                                            const endDate = date.toLocaleDateString()
                                            console.log(id)
                                            return (
                                                [
                                                    <EllipsisAddress address={id} />,
                                                    <IpfsTitle infoCID={infoCID} />,
                                                    <StateTag state={state} />,
                                                    <EllipsisAddress address={auctionWinner} />,
                                                    <HistoryRelevantInfo
                                                        state={state}
                                                        winningBid={winningBid}
                                                        sellerCollateral={sellerCollateral}
                                                    />,
                                                    <p>{endDate}</p>
                                                ]
                                            )
                                        })
                                    }
                                    header={[
                                        <span>Id</span>,
                                        <span>Title</span>,
                                        <span>Type</span>,
                                        <span>Auction winner</span>,
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