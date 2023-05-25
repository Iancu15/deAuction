import { Modal, Typography, Input, Upload, TextArea, useNotification } from "web3uikit"
import { useState } from "react"
import { ethers } from "ethers"
import axios from 'axios'
const factoryAbi = require("../../constants/FactoryAbi.json")
const factoryAddress = require("../../constants/factoryAddress.json")

export default function StartAuctionModal({ dismiss }) {
    const dispatch = useNotification()
    const [minimumBidInput, setMinimumBidInput] = useState("0")
    const [auctioneerCollateralAmountInput, setAuctioneerCollateralAmountInput] = useState("0")
    const [sellerCollateralAmountInput, setSellerCollateralAmountInput] = useState("0")
    const [maximumNumberOfBiddersInput, setMaximumNumberOfBiddersInput] = useState("0")
    const [intervalInput, setIntervalInput] = useState("0")
    const [titleInput, setTitleInput] = useState("0")
    const [descriptionInput, setDescriptionInput] = useState("0")
    const [image, setImage] = useState(``)
    const inputWidth = "22vw"

    function printHex(text) {
        const hexContent = Buffer.from(text).toString('hex');
        console.log(hexContent);
    }

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

    async function getFromIpfs() {
        const cid = 'bafkreien6qw7qixl6ptkvmxmxovxspxhyzw3o6dv2py3z2pormh5iwi7fa'
        const auctionInfo = (await axios.put(
            'http://localhost:3000/api/ipfs/cat/json',
            {
                data: cid
            }
        )).data

        const image = (await axios.put(
            'http://localhost:3000/api/ipfs/cat/image',
            {
                data: auctionInfo.imageCID
            }
        )).data
    }

    async function storeOnIpfs() {
        const imageCID = (await axios.put(
            'http://localhost:3000/api/ipfs/upload/image',
            image,
            {
                headers: {
                    'Content-Type': image.type
                }
            }
        )).data.cid

        const auctionInfo = {
            title: titleInput,
            description: descriptionInput,
            imageCID: imageCID
        }

        return await axios.put(
            'http://localhost:3000/api/ipfs/upload/json',
            {
                data: JSON.stringify(auctionInfo)
            }
        )
    }

    async function readAndStoreImage(image) {
        var reader = new FileReader()
        reader.onload = async function(event) {
            await storeOnIpfs(event.target.result)
            console.log(event.target.result)
        }

        reader.readAsDataURL(image)
    }

    async function deployAuction() {
        var ipfsURI = ""
        try {
            ipfsURI = (await storeOnIpfs()).data.cid
        } catch (err) {
            console.log(err)
        }
        
        const seller = await getCurrentUser()
        const auctionFactory = await getFactory()
        try {
            const tx = await auctionFactory.connect(seller).deployAuction(
                ethers.utils.parseEther(minimumBidInput),
                Number(maximumNumberOfBiddersInput),
                ethers.utils.parseEther(auctioneerCollateralAmountInput),
                Number(intervalInput) * 3600,
                ipfsURI,
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

    function checkTitle() {
        return titleInput.length <= 50 && titleInput.length >= 2 // 10
    }

    function checkDescription() {
        return descriptionInput.length <= 10000 && descriptionInput.length >= 2 // 100
    }

    function checkImage() {
        return image !== ``
    }

    async function onChange(e) {
        if (e != null) {
            setImage(e)
        }
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
                if (checkImage()) {
                    if (checkMinumumBid() && checkAuctioneerCollateral() && checkSellerCollateral() &&
                    checkMaximumNoBidders() && checkInterval() && checkTitle()) {
                        dismiss()
                        await deployAuction()
                    } else {
                        handleErrorNotification("One or more of the submitted inputs doesn't respect its format and conditions.")
                    }
                } else {
                    handleErrorNotification("Please insert an image.")
                }
            }}
            title={<Typography color="#68738D" variant="h3">Start auction</Typography>}
            width="30vw"
        >
            <div className="pb-8 pt-3">
                <div
                    className="py-8 grid grid-cols-1 gap-y-8 pl-10"
                >
                    <Input
                        errorMessage={"Title should be between 10 and 30 characters"}
                        label="Title"
                        placeholder="This is my title"
                        type="text"
                        onChange={(event) => {
                            setTitleInput(event.target.value)
                        }}
                        state={
                            checkTitle() ? "confirmed" : "error"
                        }
                        width={inputWidth}
                    />
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
                    <TextArea
                        label="Description"
                        name="Test TextArea Default"
                        onBlur={function noRefCheck(){}}
                        onChange={(event) => {
                            setDescriptionInput(event.target.value)
                        }}
                        placeholder="Describe your item in between 100 and 10000 characters"
                        state={
                            checkDescription() ? "confirmed" : "error"
                        }
                        width={inputWidth}
                    />
                    {/* { image && 
                    (<img
                        src={image}
                        height="200"
                        width="200"
                        alt="Red dot"
                    />)
                    } */}
                </div>
                <Upload
                    onChange={(event) => {
                        onChange(event)
                    }}
                    theme="withIcon"
                />
            </div>
        </Modal>
    )
}