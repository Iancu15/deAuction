import { useQuery, gql } from "@apollo/client"
import AuctionBox from "./AuctionBox"
import { useMoralis } from "react-moralis"

const GET_AUCTIONS = gql`
    {
        auctionDeployeds(first: 5) {
            id
            sellerAddress   
        }
    }
`

export default function Marketplace() {
    const { loading, error, data: auctions } = useQuery(GET_AUCTIONS)
    const { isWeb3Enabled } = useMoralis()

    return (
        <div className="container mx-auto">
            <div className="flex flex-wrap">
                {isWeb3Enabled ? (
                    loading || !auctions ? (
                        <div>Loading...</div>
                    ) : (
                        auctions.auctionDeployeds.map((auction) => {
                            const { id, sellerAddress } = auction
                            return (
                                <AuctionBox
                                    auctionAddress={id}
                                    sellerAddress={sellerAddress}
                                />
                            )
                        })
                    )
                ) : (
                    <div>Web3 Currently Not Enabled</div>
                )}
            </div>
        </div>
    )
}