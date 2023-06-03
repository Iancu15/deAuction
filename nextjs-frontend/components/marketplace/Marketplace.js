import { useQuery } from "@apollo/client"
import AuctionBox from "./AuctionBox"
import { useMoralis } from "react-moralis"
import { useState, useEffect } from "react"
import { ethers } from "ethers"
import Loading from "../illustrations/Loading"
import NotConnected from "../illustrations/NotConnected"
import NothingToShow from "../illustrations/NothingToShow"

export default function Marketplace({ query }) {
    const { loading, error, data: auctions } = useQuery(query)
    const { isWeb3Enabled } = useMoralis()
    const [currUserAddress, setCurrUserAddress] = useState(``)
    const [statesAreLoading, setStatesAreLoading] = useState(true)

    async function updateUserAddress() {
        console.log('updating user address...')
        setStatesAreLoading(true)
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        setCurrUserAddress(await signer.getAddress())
        setStatesAreLoading(false)
        console.log('updating user address...')
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
                    <Loading />
                ) : (
                    <div>
                        {
                            auctions.auctionEntities.length > 0 ?
                            (
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