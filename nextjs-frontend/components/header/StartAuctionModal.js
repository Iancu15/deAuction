import { Modal, Typography, Input, Upload, TextArea, TabList, Tab, CodeArea } from "web3uikit"
import { useNotification, Bell, Checkmark } from "web3uikit"
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
    const [imageCID, setImageCID] = useState(``)
    const [jsonCID, setJsonCID] = useState(``)
    const [tabState, setTabState] = useState(``)
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
            icon: <Checkmark fontSize={20} />,
        })
    }

    const handleBellNotification = (type, message, title) => {
        dispatch({
            type: type,
            message: message,
            title: title,
            position: "topR",
            icon: <Bell fontSize={20} />,
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
            window.location.reload(true)
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

    async function storeImageOnIpfs(image) {
        return (await axios.put(
            'http://localhost:3000/api/ipfs/upload/image',
            image,
            {
                headers: {
                    'Content-Type': image.type
                }
            }
        )).data.cid

    }

    async function storeJsonOnIpfs(imageCID, imageHost) {
        const auctionInfo = {
            title: titleInput,
            description: descriptionInput,
            imageHost: imageHost,
            imageCID: imageCID
        }

        return (await axios.put(
            'http://localhost:3000/api/ipfs/upload/json',
            {
                data: JSON.stringify(auctionInfo)
            }
        )).data.cid
    }

    async function storeJsonAndDeployAuction() {
        const ipfsURI = await storeJsonOnIpfs(imageCID, "seller")
        await deployAuction(ipfsURI)
    }


    async function storeImageAndDeployAuction() {
        var reader = new FileReader()
        reader.onload = async function(event) {
            const imageCID = await storeImageOnIpfs(event.target.result)
            const ipfsURI = await storeJsonOnIpfs(imageCID, "server")
            await deployAuction(ipfsURI)
        }

        reader.readAsDataURL(image)
    }

    async function deployAuction(ipfsURI) {
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
        return Number(intervalInput) >= 24 && Number(intervalInput) <= 24 * 7
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

    function checkImageCID() {
        return imageCID.length >= 32
    }

    function checkJsonCID() {
        return jsonCID.length >= 32
    }

    function checkTab() {
        if (tabState === 1) {
            return checkImage() && checkDescription() && checkTitle()
        } else if (tabState === 2) {
            return checkDescription() && checkTitle() && checkImageCID()
        } else {
            return checkJsonCID()
        }
    }

    async function onChange(e) {
        if (e != null) {
            setImage(e)
        }
    }

    return (
        <div>
            <Modal
                cancelText="Cancel"
                id="regular"
                isVisible
                okText="Submit"
                onCancel={dismiss}
                onCloseButtonPressed={dismiss}
                onOk={async () => {
                    if (checkMinumumBid() && checkAuctioneerCollateral() && checkSellerCollateral() &&
                    checkMaximumNoBidders() && checkInterval() && checkTab()) {
                        dismiss()
                        if (tabState === 1) {
                            await storeImageAndDeployAuction()
                        } else if (tabState === 2) {
                            await storeJsonAndDeployAuction()
                        } else {
                            await deployAuction(jsonCID)
                        }
                    } else {
                        handleErrorNotification("One or more of the submitted inputs doesn't respect its format and conditions.")
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
                            errorMessage={'The interval has to be between 24h and 168h'}
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
                    <div className="pt-4">
                        <TabList
                            defaultActiveKey={1}
                            onChange={(tabState) => {setTabState(tabState)}}
                            tabStyle="bar"
                        >
                            <Tab
                                tabKey={1}
                                tabName="Manual"
                            >
                                <div
                                    className="pt-4 pb-8 grid grid-cols-1 gap-y-8 pl-10"
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
                                </div>
                                <Upload
                                    onChange={(event) => {
                                        onChange(event)
                                    }}
                                    theme="withIcon"
                                />
                            </Tab>
                            <Tab
                                tabKey={2}
                                tabName="Image IPFS CIDv1"
                            >
                                <div
                                    className="pt-4 grid grid-cols-1 gap-y-8 pl-10"
                                >
                                    <Input
                                        errorMessage={"Title should be between 10 and 50 characters"}
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
                                    <div>
                                        <Typography
                                            onCopy={function noRefCheck(){}}
                                            variant="caption14"
                                        >
                                            If you have CIDv0 you can convert it to v1 using the command below:
                                        </Typography>
                                        <CodeArea
                                            onBlur={function noRefCheck(){}}
                                            onChange={function noRefCheck(){}}
                                            text="ipfs cid format -v 1 -b base32 QmX66hwxdPnt3kXi55HWNUoZbzvt3VSpJDpMjpaxTNvkvt"
                                        />
                                    </div>
                                    <Input
                                        errorMessage={"CID should be at least 32 characters long"}
                                        label="Image CIDv1"
                                        placeholder="Please insert CIDv1 of image"
                                        type="text"
                                        onChange={(event) => {
                                            setImageCID(event.target.value)
                                        }}
                                        state={
                                            checkImageCID() ? "confirmed" : "error"
                                        }
                                        width={inputWidth}
                                    />
                                </div>
                            </Tab>
                            <Tab
                                tabKey={3}
                                tabName="JSON IPFS CIDv1"
                            >
                                <div
                                    className="grid grid-cols-1 gap-y-8 pl-10"
                                >
                                    <div>
                                        <Typography
                                            onCopy={function noRefCheck(){}}
                                            variant="caption14"
                                        >
                                            Below you can see an example of a valid JSON:
                                        </Typography>
                                        <CodeArea
                                            onBlur={function noRefCheck(){}}
                                            onChange={function noRefCheck(){}}
                                            text={`{
            "title":"My Sweet Item",
            "description":"Item is really rad",
            "imageHost":"seller",
            "imageCID":"bafybeieb73oyw7dntgetade5llmt6pzlt5yhlzn4h2mdtlh5knekytz5le"
        }`}
                                        />
                                    </div>
                                    <div>
                                        <Typography
                                            onCopy={function noRefCheck(){}}
                                            variant="caption14"
                                        >
                                            If you have CIDv0 you can convert it to v1 using the command below:
                                        </Typography>
                                        <CodeArea
                                            onBlur={function noRefCheck(){}}
                                            onChange={function noRefCheck(){}}
                                            text="ipfs cid format -v 1 -b base32 QmX66hwxdPnt3kXi55HWNUoZbzvt3VSpJDpMjpaxTNvkvt"
                                        />
                                    </div>
                                    <Input
                                        errorMessage={"CID should be at least 32 characters long"}
                                        label="JSON CIDv1"
                                        placeholder="Please insert CIDv1 of JSON"
                                        type="text"
                                        onChange={(event) => {
                                            setJsonCID(event.target.value)
                                        }}
                                        state={
                                            checkJsonCID() ? "confirmed" : "error"
                                        }
                                        width={inputWidth}
                                    />
                                </div>
                            </Tab>
                        </TabList>
                    </div>
                </div>
            </Modal>
        </div>
    )
}