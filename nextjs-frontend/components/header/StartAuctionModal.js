import { Modal, Typography, Input, useNotification } from "web3uikit"
import { useState } from "react"
import { ethers } from "ethers"
const auctionArtifact = require("../../constants/Auction.json")
const factoryAbi = require("../../constants/FactoryAbi.json")
const factoryAddress = require("../../constants/factoryAddress.json")

export default function StartAuctionModal({ dismiss }) {
    const dispatch = useNotification()
    const [minimumBidInput, setMinimumBidInput] = useState("0")
    const [auctioneerCollateralAmountInput, setAuctioneerCollateralAmountInput] = useState("0")
    const [sellerCollateralAmountInput, setSellerCollateralAmountInput] = useState("0")
    const [maximumNumberOfBiddersInput, setMaximumNumberOfBiddersInput] = useState("0")
    const [intervalInput, setIntervalInput] = useState("0")
    const inputWidth = "22vw"

    const handleSuccessNotification = () => {
        dispatch({
            type: 'success',
            message: 'Transaction Complete!',
            title: 'Transaction Notification',
            position: "topR",
            icon: 'checkmark',
        })
    }

    const handleBellNotification = (type, message, title) => {
        dispatch({
            type: type,
            message: message,
            title: title,
            position: "topR",
            icon: 'bell',
        })
    }

    const handleErrorNotification = (errorMessage) => {
        handleBellNotification('error', errorMessage, 'Transaction Error')
    }

    const handleInfoNotification = (message) => {
        handleBellNotification('info', message, 'Transaction Information')
    }

    const handleWarningNotification = (message) => {
        handleBellNotification('warning', message, 'Transaction Warning')
    }

    const handleError = (errorMessage) => {
        if (errorMessage.includes('web3')) {
            handleWarningNotification("You aren't connected to your wallet! Please connect.")
        } else if (errorMessage.includes('denied') || errorMessage.includes('user rejected transaction') || errorMessage.includes('r is undefined')) {
            handleInfoNotification("Transaction wasn't send.")
        } else {
            handleErrorNotification(errorMessage)
        }
    }

    const handleSuccess = async (tx) => {
        try {
            await tx.wait(1)
            handleSuccessNotification(tx)
        } catch (error) {
            console.log(error)
        }
    }

    async function getFactory() {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        return new ethers.Contract(factoryAddress.address, factoryAbi, provider)
    }

    async function getCurrentUser() {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send("eth_requestAccounts", []);
        return provider.getSigner();
    }

    // async function deployAuction() {
    //     const seller = await getCurrentUser()
    //     const auctionFactory = new ethers.ContractFactory(auctionArtifact.abi, auctionArtifact.bytecode, seller)
    //     const args = [
    //         ethers.utils.parseEther(minimumBidInput),
    //         Number(maximumNumberOfBiddersInput),
    //         ethers.utils.parseEther(auctioneerCollateralAmountInput),
    //         Number(intervalInput) * 3600,
    //         {
    //             value: ethers.utils.parseEther(sellerCollateralAmountInput)
    //         }
    //     ]

    //     const auction = await auctionFactory.deploy(...args)
    //     const deployedTransaction = await auction.deployTransaction.wait()
    //     const startBlock = deployedTransaction.blockNumber
    //     console.log(`Auction deployed at ${auction.address}`)
    // }

    async function deployAuction() {
        const seller = await getCurrentUser()
        const sellerAddress = await seller.getAddress()
        const auctionFactory = await getFactory()
        try {
            const tx = await auctionFactory.connect(seller).deployAuction(
                ethers.utils.parseEther(minimumBidInput),
                Number(maximumNumberOfBiddersInput),
                ethers.utils.parseEther(auctioneerCollateralAmountInput),
                Number(intervalInput) * 3600,
                {
                    value: ethers.utils.parseEther(sellerCollateralAmountInput),
                    gasLimit: 3000000
                }
            )
            await handleSuccess(tx)
        } catch (error) {
            handleError(error.message)
        }

        console.log(`Auction deployed`)
    }

    function checkMinumumBid() {
        return parseFloat(minimumBidInput) >= parseFloat("0")
    }

    function checkAuctioneerCollateral() {
        return parseFloat(auctioneerCollateralAmountInput) >= parseFloat("0")
    }

    function checkSellerCollateral() {
        return parseFloat(sellerCollateralAmountInput) >= parseFloat("0") &&
            parseFloat(sellerCollateralAmountInput) >= parseFloat(auctioneerCollateralAmountInput)
    }

    function checkMaximumNoBidders() {
        return Number(maximumNumberOfBiddersInput) >= 5
    }

    function checkInterval() {
        return Number(intervalInput) >= 24
    }

    return (
        <Modal
            cancelText="Cancel"
            id="regular"
            isVisible
            okText="Submit"
            onCancel={dismiss}
            onCloseButtonPressed={dismiss}
            onOk={async () => {
                if (checkMinumumBid() && checkAuctioneerCollateral()
                    && checkSellerCollateral() && checkMaximumNoBidders() && checkInterval()) {
                    dismiss()
                    await deployAuction()
                } else {
                    handleErrorNotification("One or more of the submitted inputs doesn't respect its format and conditions.")
                }
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
                        checkMinumumBid() ? "confirmed" : "error"
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
                        checkAuctioneerCollateral() ? "confirmed" : "error"
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
                        checkSellerCollateral() ? "confirmed" : "error"
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
                        checkMaximumNoBidders() ? "confirmed" : "error"
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
                        checkInterval() ? "confirmed" : "error"
                    }
                    width={inputWidth}
                />
            </div>
        </Modal>
    )
}