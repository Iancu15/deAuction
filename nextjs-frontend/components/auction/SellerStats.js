import { useQuery, gql } from "@apollo/client"
import { useEffect, useState } from "react"
import { Widget, Skeleton } from "web3uikit"

export default function SellerStats({ sellerAddress }) {
    const [numberOfSuccesses, setNumberOfSuccesses] = useState(0)
    const [numberOfFailures, setNumberOfFailures] = useState(0)
    const [numberOfTimeUps, setNumberOfTimeUps] = useState(0)
    const [failurePercentage, setFailurePercentage] = useState(0.0)

    const { loading, error, data: auctions } = useQuery(gql`
        {
            auctionEntities(first: 50, where: {state_gte: 2, sellerAddress: "${sellerAddress}"}) {
                id
                sellerAddress
                state
                infoCID
                destroyedTimestamp
                auctionWinner
                winningBid
                sellerCollateral
            }
        }
    `)

    async function processSellerStats() {
        const numberOfSuccesses = auctions.auctionEntities.filter(
            (auction) => auction.state === 2
        ).length
        const numberOfFailures = auctions.auctionEntities.filter(
            (auction) => auction.state === 3
        ).length
        const numberOfTimeUps = auctions.auctionEntities.filter(
            (auction) => auction.state === 5
        ).length

        const total = numberOfSuccesses + numberOfFailures + numberOfTimeUps
        const failurePercentage = (numberOfFailures + numberOfTimeUps) / total
        setNumberOfSuccesses(numberOfSuccesses)
        setNumberOfFailures(numberOfFailures)
        setNumberOfTimeUps(numberOfTimeUps)
        setFailurePercentage(failurePercentage * 100)
    }

    useEffect(() => {
        if (!loading) {
            processSellerStats()
        }
    }, [loading])

    return (
        <div>
        { loading ?
            (<section style={{ display: 'flex', gap: '20px' }}>
                <Widget info={<Skeleton width="200px" theme="text" />} title="Seller successes" />
                <Widget info={<Skeleton width="200px" theme="text" />} title="Seller failures" />
                <Widget info={<Skeleton width="200px" theme="text" />} title="Seller time ups" />
                <Widget info={<Skeleton width="200px" theme="text" />} title="Failure(+ time ups) percentage" />
            </section>) :
            (<section style={{ display: 'flex', gap: '20px' }}>
                <Widget info={numberOfSuccesses} title="Seller successes" />
                <Widget info={numberOfFailures} title="Seller failures" />
                <Widget info={numberOfTimeUps} title="Seller time ups" />
                <Widget info={`${failurePercentage}%`} title="Failure(+ time ups) percentage" />
            </section>) }
        </div>
    )
}