import { Button, ConnectButton, Modal, Typography, Input } from "web3uikit"
import { useState } from "react"
import { ethers } from "ethers"
import { useMoralis } from "react-moralis"

export default function Header() {
    const { isWeb3Enabled } = useMoralis()
    const [minimumBidInput, setMinimumBidInput] = useState("0")
    const [auctioneerCollateralAmountInput, setAuctioneerCollateralAmountInput] = useState("0")
    const [sellerCollateralAmountInput, setSellerCollateralAmountInput] = useState("0")
    const [maximumNumberOfBiddersInput, setMaximumNumberOfBiddersInput] = useState("0")
    const [intervalInput, setIntervalInput] = useState("0")
    const [showStartAuctionModal, setShowStartAuctionModal] = useState(false)
    const inputWidth = "22vw"

    async function getCurrentUser() {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        await provider.send("eth_requestAccounts", []);
        return provider.getSigner();
    }

    async function deployAuction() {
        const seller = (await getCurrentUser()).getAddress()
        const Auction = await ethers.getContractFactory("Auction");
        const auction = await Auction.deploy("Auction", {
            value: ethers.utils.parseEther(sellerCollateralAmountInput),
            from: seller,
            args: [
                ethers.utils.parseEther(minimumBidInput),
                Number(maximumNumberOfBidders),
                ethers.utils.parseEther(auctioneerCollateralAmountInput),
                Number(interval) * 3600],
            log: true,
            waitConfirmations: network.config.blockConfirmations || 1
        })

        console.log(`Auction deployed at ${auction.address}`)
    }

    return (
        <div>
            <nav className="p-5 border-b-2 flex flex-row">
                <h1 className="py-4 px-4 font-bold text-3xl">Decentralized Auction</h1>
                <div className="flex ml-auto py-2 px-4">
                    { isWeb3Enabled ?
                    <Button
                        text="Start an auction"
                        theme="primary"
                        onClick={ () => setShowStartAuctionModal(true) }
                    /> : <div></div> }
                    <ConnectButton moralisAuth={false}/>
                </div>
            </nav>
            {showStartAuctionModal ? 
                <div>
                    <Modal
                        cancelText="Cancel"
                        id="regular"
                        isVisible
                        okText="Submit"
                        onCancel={() => setShowStartAuctionModal(false)}
                        onCloseButtonPressed={() => setShowStartAuctionModal(false)}
                        onOk={async () => {
                            setShowStartAuctionModal(false)
                            await deployAuction()
                        }}
                        title={<Typography color="#68738D" variant="h3">Start auction</Typography>}
                        width="30vw"
                    >
                        <div
                            className="py-8 grid grid-cols-1 gap-y-8 pl-10"
                        >
                            <Input
                                errorMessage={'Please enter a positive number'}
                                label="Minimum bid"
                                placeholder="0"
                                type="number"
                                onChange={(event) => {
                                    setMinimumBidInput(event.target.value)
                                }}
                                state={
                                    (parseFloat(minimumBidInput) >= parseFloat("0"))
                                    ? "confirmed" : "error"
                                }
                                width={inputWidth}
                            />
                            <Input
                                errorMessage={'Please enter a positive number'}
                                label="Auctioneer collateral amount"
                                placeholder="0"
                                type="number"
                                onChange={(event) => {
                                    setAuctioneerCollateralAmountInput(event.target.value)
                                }}
                                state={
                                    (parseFloat(auctioneerCollateralAmountInput) >= parseFloat("0"))
                                    ? "confirmed" : "error"
                                }
                                width={inputWidth}
                            />
                            <Input
                                errorMessage={'Please enter a positive number higher or equal to auctioneer collateral'}
                                label="Seller collateral amount"
                                placeholder="0"
                                type="number"
                                onChange={(event) => {
                                    setSellerCollateralAmountInput(event.target.value)
                                }}
                                state={
                                    (parseFloat(sellerCollateralAmountInput) >= parseFloat("0") &&
                                    parseFloat(sellerCollateralAmountInput) >= parseFloat(auctioneerCollateralAmountInput))
                                    ? "confirmed" : "error"
                                }
                                width={inputWidth}
                            />
                            <Input
                                errorMessage={'Please enter a positive number higher or equal to 5'}
                                label="Maximum number of participants"
                                placeholder="5"
                                type="number"
                                onChange={(event) => {
                                    setMaximumNumberOfBiddersInput(event.target.value)
                                }}
                                state={
                                    (Number(maximumNumberOfBiddersInput) >= 5)
                                    ? "confirmed" : "error"
                                }
                                width={inputWidth}
                            />
                            <Input
                                errorMessage={'The interval has to be bigger or equal to 24h'}
                                label="Interval before automatic closing (hours)"
                                placeholder="24"
                                type="number"
                                onChange={(event) => {
                                    setIntervalInput(event.target.value)
                                }}
                                state={
                                    (Number(intervalInput) >= 24)
                                    ? "confirmed" : "error"
                                }
                                width={inputWidth}
                            />
                        </div>
                    </Modal></div>
                    : <div></div>}
        </div>
    )
}