import { useQuery, gql } from "@apollo/client"
import AuctionBox from "./AuctionBox"
import { useMoralis } from "react-moralis"
import { useState, useEffect } from "react"
import { ethers } from "ethers"

const GET_AUCTIONS = gql`
    {
        auctionDeployeds(first: 50) {
            id
            sellerAddress   
        }
    }
`

export default function Marketplace() {
    const { loading, error, data: auctions } = useQuery(GET_AUCTIONS)
    const { isWeb3Enabled } = useMoralis()
    const [currUserAddress, setCurrUserAddress] = useState(``)

    async function updateUserAddress() {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        setCurrUserAddress(await signer.getAddress())
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUserAddress()
        }
    }, [isWeb3Enabled])

    return (
        <div className="flex flex-wrap gap-8 p-8">
            {isWeb3Enabled ? (
                loading || !auctions ? (
                    <div>Loading...</div>
                ) : (
                    auctions.auctionDeployeds.map((auction) => {
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
                <div>Web3 Currently Not Enabled</div>
            )}
        </div>
    )
}