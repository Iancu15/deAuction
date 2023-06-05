import AuctionList from "../components/marketplace/AuctionList";
import { gql } from "@apollo/client"
import { useState, useEffect } from "react"
import { useMoralis } from "react-moralis"
import { ethers } from "ethers"

export default function EnteredAuctionsPage() {
    const { isWeb3Enabled } = useMoralis()
    const [query, setQuery] = useState(gql`
        {
            auctionAuctioneerEntities(first: 50, where: {auctioneerAddress: "", auction_: {state_lte: 1}}) {
                auctioneerAddress
                auction {
                    id
                    sellerAddress
                    state
                }
            }
        }
    `)

    async function updateQuery() {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        const signerAddress = await signer.getAddress()
        const GET_AUCTIONS = gql`
            {
                auctionAuctioneerEntities(first: 50, where: {auctioneerAddress: "${signerAddress}", auction_: {state_lte: 1}}) {
                    auctioneerAddress
                    auction {
                        id
                        sellerAddress
                        state
                    }
                }
            }
        `
        setQuery(GET_AUCTIONS)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateQuery()
        }
    }, [isWeb3Enabled])

    return (
        <div>
            <AuctionList query={query} type="entered" />
        </div>
    )
}