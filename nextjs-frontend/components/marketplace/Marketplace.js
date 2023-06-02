import { useQuery, gql } from "@apollo/client"
import AuctionBox from "./AuctionBox"
import { useMoralis } from "react-moralis"
import { useState, useEffect } from "react"
import { ethers } from "ethers"

const GET_AUCTIONS = gql`
    {
        auctionEntities(first: 50, where: {state_lte: 1}) {
        id
        sellerAddress
        state
        }
    }
`

export default function Marketplace() {
    const { loading, error, data: auctions } = useQuery(GET_AUCTIONS)
    const { isWeb3Enabled } = useMoralis()
    const [currUserAddress, setCurrUserAddress] = useState(``)
    const [statesAreLoading, setStatesAreLoading] = useState(true)

    async function updateUserAddress() {
        setStatesAreLoading(true)
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        setCurrUserAddress(await signer.getAddress())
        setStatesAreLoading(false)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUserAddress()
        }
    }, [isWeb3Enabled])

    return (
        <div className="flex flex-wrap gap-8 p-8">
            {isWeb3Enabled ? (
                loading || !auctions || statesAreLoading ? (
                    <div></div>
                ) : (
                    auctions.auctionEntities.map((auction) => {
                        const { id, sellerAddress } = auction
                        return (
                            <AuctionBox
                                contractAddress={id}
                                sellerAddress={sellerAddress}
                                currUserAddress={currUserAddress}
                            />
                        )
                    })
                )
            ) : (
                <div></div>
            )}
        </div>
    )
}