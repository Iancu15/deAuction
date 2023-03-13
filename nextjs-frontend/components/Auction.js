import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { Button, Modal, Input } from "web3uikit"
const contractAddress = require("../constants/contractAddress.json")
const abi = require("../constants/abi.json")

export default function Auction() {
    const { Moralis, isWeb3Enabled } = useMoralis()

    /**
     * useWeb3Contract returns
     */

    let enterAuction, enterAuctionIsLoading, enterAuctionIsFetching
    let increaseBid, increaseBidIsLoading, increaseBidIsFetching

    /**
     * customizable useWeb3Contract function calls
     */

    function callEnterAuction(bid) {
        ({
            runContractFunction: enterAuction,
            isLoading: enterAuctionIsLoading,
            isFetching: enterAuctionIsFetching
        } = useWeb3Contract({
            abi: abi,
            contractAddress: contractAddress,
            functionName: "enterAuction",
            msgValue: bid,
            params: {},
        }))
    }

    function callIncreaseBid(bidAddition) {
        ({
            runContractFunction: increaseBid,
            isLoading: increaseBidIsLoading,
            isFetching: increaseBidIsFetching
        } = useWeb3Contract({
            abi: abi,
            contractAddress: contractAddress,
            functionName: "increaseBid",
            msgValue: bidAddition,
            params: {},
        }))
    }

    /**
     * useWeb3Contract function calls
     */

    const {
        runContractFunction: leaveAuction,
        isLoading: leaveAuctionIsLoading,
        isFetching: leaveAuctionIsFetching
    } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "leaveAuction",
        params: {},
    })

    const {
        runContractFunction: closeAuction,
        isLoading: closeAuctionIsLoading,
        isFetching: closeAuctionIsFetching
    } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "closeAuction",
        params: {},
    })

    const {
        runContractFunction: routeHighestBid,
        isLoading: routeHighestBidIsLoading,
        isFetching: routeHighestBidIsFetching
    } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "routeHighestBid",
        params: {},
    })

    const {
        runContractFunction: burnAllStoredValue,
        isLoading: burnAllStoredValueBidIsLoading,
        isFetching: burnAllStoredValueBidIsFetching
    } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "burnAllStoredValue",
        params: {},
    })

    /**
     * constant view getters
     */

    const { runContractFunction: getMaximumNumberOfBidders } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress, // specify the networkId
        functionName: "getMaximumNumberOfBidders",
        params: {},
    })

    const { runContractFunction: getMinimumBid } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress, // specify the networkId
        functionName: "getMinimumBid",
        params: {},
    })

    const { runContractFunction: getSellerAddress } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress, // specify the networkId
        functionName: "getSellerAddress",
        params: {},
    })

    const { runContractFunction: getAuctioneerCollateralAmount } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress, // specify the networkId
        functionName: "getAuctioneerCollateralAmount",
        params: {},
    })

    const { runContractFunction: getSellerCollateralAmount } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress, // specify the networkId
        functionName: "getSellerCollateralAmount",
        params: {},
    })

    /**
     * constants
     */

    const [maximumNumberOfBidders, setMaximumNumberOfBidders] = useState(0)
    const [minimumBid, setMinimumBid] = useState(BigInt(0))
    const [sellerAddress, setSellerAddress] = useState(0)
    const [auctioneerCollateralAmount, setAuctioneerCollateralAmount] = useState(BigInt(0))
    const [sellerCollateralAmount, setSellerCollateralAmount] = useState(BigInt(0))
    let fetchedConstants = false

    /**
     * variable view getters
     */

    const { runContractFunction: getAuctionWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress, // specify the networkId
        functionName: "getAuctionWinner",
        params: {},
    })

    const { runContractFunction: getMyCurrentBid } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress, // specify the networkId
        functionName: "getMyCurrentBid",
        params: {},
    })

    const { runContractFunction: getContractBalance } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress, // specify the networkId
        functionName: "getContractBalance",
        params: {},
    })

    const { runContractFunction: getCurrentHighestBid } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress, // specify the networkId
        functionName: "getCurrentHighestBid",
        params: {},
    })

    const { runContractFunction: getDoIHaveTheHighestBid } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress, // specify the networkId
        functionName: "doIHaveTheHighestBid",
        params: {},
    })

    const { runContractFunction: getIsOpen } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress, // specify the networkId
        functionName: "isOpen",
        params: {},
    })

    const { runContractFunction: getNumberOfBidders } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress, // specify the networkId
        functionName: "getNumberOfBidders",
        params: {},
    })

    /**
     * variables
     */

    const [auctionWinner, setAuctionWinner] = useState("0")
    const [myCurrentBid, setMyCurrentBid] = useState(BigInt(0))
    const [contractBalance, setContractBalance] = useState(BigInt(0))
    const [currentHighestBid, setCurrentHighestBid] = useState(BigInt(0))
    const [doIHaveTheHighestBid, setDoIHaveTheHighestBid] = useState(false)
    const [isOpen, setIsOpen] = useState(true)
    const [numberOfBidders, setNumberOfBidders] = useState(0)

    async function fetchConstants() {
        setMaximumNumberOfBidders(await getMaximumNumberOfBidders())
        setMinimumBid(await getMinimumBid())
        setSellerAddress(await getSellerAddress())
        setAuctioneerCollateralAmount(await getAuctioneerCollateralAmount())
        setSellerCollateralAmount(await getSellerCollateralAmount())
        fetchedConstants = true
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            fetchConstants()
        }
    }, [])

    useEffect(() => {
        if (isWeb3Enabled) {
            if (!fetchedConstants) {
                fetchConstants()
            }
        }
    }, [isWeb3Enabled])

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        })
    }

    const handleSuccess = async (tx) => {
        try {
            await tx.wait(1)
            updateUIValues()
            handleNewNotification(tx)
        } catch (error) {
            console.log(error)
        }
    }

    /**
     * Modal variables
     */

    const [showEnterAuctionModal, setShowEnterAuctionModal] = useState(false)

    return (
        <div>
            {showEnterAuctionModal ? <Modal
                    cancelText="Cancel"
                    id="enterAuctionModal"
                    isVisible
                    okText="Enter Auction"
                    onCancel={() => setShowEnterAuctionModal(false)}
                    onCloseButtonPressed={function noRefCheck(){}}
                    onOk={() => setShowEnterAuctionModal(false)}
                >
                    <Input
                        label="Score 1 - 10"
                        placeholder="10 out of 10?"
                        type="number"
                    />
                </Modal> : <></>
            }
            <Button
                onClick={
                    () => setShowEnterAuctionModal(true)
                }
                text="Enter Auction"
                theme="primary"
                disabled={enterAuctionIsLoading || enterAuctionIsFetching}
            />
        </div>
    )
}