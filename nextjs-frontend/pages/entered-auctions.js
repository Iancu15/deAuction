import Marketplace from "../components/marketplace/Marketplace";
import { gql } from "@apollo/client"
import { useState, useEffect } from "react"
import { useMoralis } from "react-moralis"
import { ethers } from "ethers"

export default function EnteredAuctionsPage() {
    const { isWeb3Enabled } = useMoralis()
    const [query, setQuery] = useState(gql`
        {
            auctionEntities(first: 50, where: {state_lte: 1, sellerAddress: ""}) {
                id
                sellerAddress
                state
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
                auctionEntities(first: 50, where: {state_lte: 1, sellerAddress: "${signerAddress}"}) {
                    id
                    sellerAddress
                    state
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
            <Marketplace query={query} />
        </div>
    )
}