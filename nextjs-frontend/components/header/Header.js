import { Button, ConnectButton } from "web3uikit"
import { useState, useEffect } from "react"
import { useMoralis } from "react-moralis"
import StartAuctionModal from "./StartAuctionModal"
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Header() {
    const router = useRouter()
    const { isWeb3Enabled } = useMoralis()
    const [showStartAuctionModal, setShowStartAuctionModal] = useState(false)
    const [dismissModal, setDismissModal] = useState(false);

    useEffect(() => {
        if (dismissModal) {
            setShowStartAuctionModal(false);
        }
    }, [dismissModal])

    return (
        <div>
            <nav className="p-5 border-b-2 flex flex-row">
                <Link href="/"><a><img src="/home_image.png" alt="deAuction" width="150px" height="75px" /></a></Link>
                <div className="flex ml-auto py-2 px-4">
                    { isWeb3Enabled ?
                    <div className="flex ml-auto gap-4">
                        <Button
                            text="Won auctions"
                            theme="primary"
                            onClick={() => router.push(`/won-auctions`)}
                            disabled={router.pathname == '/won-auctions'}
                        />
                        <Button
                            text="Entered auctions"
                            theme="primary"
                            onClick={() => router.push(`/entered-auctions`)}
                            disabled={router.pathname == '/entered-auctions'}
                        />
                        <Button
                            text="Your finished auctions"
                            theme="primary"
                            onClick={() => router.push(`/your-finished-auctions`)}
                            disabled={router.pathname == '/your-finished-auctions'}
                        />
                        <Button
                            text="Your ongoing auctions"
                            theme="primary"
                            onClick={() => router.push(`/your-ongoing-auctions`)}
                            disabled={router.pathname == '/your-ongoing-auctions'}
                        />
                        <Button
                            text="Start an auction"
                            theme="primary"
                            onClick={ () => {
                                setDismissModal(false)
                                setShowStartAuctionModal(true)
                            }}
                        />
                    </div>
                    : <div></div> }
                    <ConnectButton moralisAuth={false}/>
                </div>
            </nav>
            {showStartAuctionModal ? 
                <StartAuctionModal
                    dismiss = {() => setDismissModal(true)}
                />
                    : <div></div>}
        </div>
    )
}