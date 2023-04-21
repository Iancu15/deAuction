import { Button, ConnectButton } from "web3uikit"
import { useState, useEffect } from "react"
import { useMoralis } from "react-moralis"
import StartAuctionModal from "./StartAuctionModal"

export default function Header() {
    const { isWeb3Enabled } = useMoralis()
    const [showStartAuctionModal, setShowStartAuctionModal] = useState(false)
    const [dismissModal, setDismissModal] = useState(false);

    useEffect(() => {
        if (dismissModal) {
            setShowStartAuctionModal(false);
        }
      }, [dismissModal]);

    return (
        <div>
            <nav className="p-5 border-b-2 flex flex-row">
                <h1 className="py-4 px-4 font-bold text-3xl">Decentralized Auction</h1>
                <div className="flex ml-auto py-2 px-4">
                    { isWeb3Enabled ?
                    <Button
                        text="Start an auction"
                        theme="primary"
                        onClick={ () => {
                            setDismissModal(false)
                            setShowStartAuctionModal(true)
                        }}
                    /> : <div></div> }
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