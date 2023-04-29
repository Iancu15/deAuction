import { useRouter } from 'next/router'
import Auction from "../../components/Auction";

export default function AuctionPage() {
    const router = useRouter()
    const { address } = router.query 
    return (
      <div>
        <Auction
          contractAddress={address}
        />
      </div>
    )
  }