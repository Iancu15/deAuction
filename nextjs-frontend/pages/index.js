import Marketplace from "../components/marketplace/Marketplace";
import { gql } from "@apollo/client"
import { Typography } from "@material-ui/core";

const GET_AUCTIONS = gql`
    {
        auctionEntities(first: 50, where: {state: 0}) {
        id
        sellerAddress
        state
        }
    }
`

export default function Home() {
    return (
        <div>
            <Marketplace query={GET_AUCTIONS}/>
        </div>
    )
}