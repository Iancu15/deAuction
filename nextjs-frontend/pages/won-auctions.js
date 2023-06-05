import AuctionHistory from "../components/history/AuctionHistory";
import { gql } from "@apollo/client"
import { useState, useEffect } from "react"
import { useMoralis } from "react-moralis"
import { ethers } from "ethers"

export default function FinishedAuctionsPage() {
    const { isWeb3Enabled } = useMoralis()
    const [query, setQuery] = useState(gql`
        {
            auctionEntities(first: 50, where: {state_gte: 2, auctionWinner: ""}) {
                id
                sellerAddress
                state
                infoCID
                destroyedTimestamp
                auctionWinner
                winningBid
                sellerCollateral
                auctioneerCollateral
            }
        }
    `)

    async function updateQuery() {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        const signerAddress = await signer.getAddress()
        const GET_DESTROYED_AUCTIONS = gql`
            {
                auctionEntities(first: 50, where: {state_gte: 2, auctionWinner: "${signerAddress}"}) {
                    id
                    sellerAddress
                    state
                    infoCID
                    destroyedTimestamp
                    winningBid
                    sellerCollateral
                    auctioneerCollateral
                }
            }
        `
        setQuery(GET_DESTROYED_AUCTIONS)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateQuery()
        }
    }, [isWeb3Enabled])

    return (
        <div>
            <AuctionHistory query={query} type="won" />
        </div>
    )
}