import { Card } from "web3uikit"
import { useRouter } from 'next/router'
import Link from 'next/link'
import React from 'react'

export default function AuctionBox({ auctionAddress, sellerAddress }) {
    const router = useRouter()

    return (
        <div>
            <Card
                title="TOKEN"
                //description={tokenDescription}
                onClick={() => router.push(`/auctions/${auctionAddress}`)}
            >
                <div className="p-2">
                    <div className="flex flex-col items-end gap-2">
                        <div>Auction contract address: {auctionAddress}</div>
                        <div className="italic text-sm">
                            Seller address: {sellerAddress}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}