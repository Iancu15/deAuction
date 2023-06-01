import { Card, Skeleton, Typography } from "web3uikit"
import { useRouter } from 'next/router'
import React from 'react'
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import axios from 'axios'
const abi = require("../../constants/AuctionAbi.json")

export default function AuctionBox({ contractAddress, sellerAddress, currUserAddress }) {
    const router = useRouter()
    const { isWeb3Enabled } = useMoralis()

    const [statesAreLoading, setStatesAreLoading] = useState(true)

    /**
     * variable view getters
     */

    const { runContractFunction: getMyCurrentBid } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getMyCurrentBid",
        params: {},
    })

    const { runContractFunction: getCurrentHighestBid } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getCurrentHighestBid",
        params: {},
    })

    const { runContractFunction: getNumberOfBidders } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getNumberOfBidders",
        params: {},
    })

    /**
     * variables
     */

    const [myCurrentBid, setMyCurrentBid] = useState("0")
    const [currentHighestBid, setCurrentHighestBid] = useState("0")
    const [numberOfBidders, setNumberOfBidders] = useState("0")

    /**
     * constant view getters
     */

     const { runContractFunction: getMaximumNumberOfBidders } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getMaximumNumberOfBidders",
        params: {},
    })

    const { runContractFunction: getMinimumBid } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getMinimumBid",
        params: {},
    })

    const { runContractFunction: getAuctioneerCollateralAmount } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getAuctioneerCollateralAmount",
        params: {},
    })

    const { runContractFunction: getSellerCollateralAmount } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getSellerCollateralAmount",
        params: {},
    })

    const { runContractFunction: getInfoCID } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getInfoCID",
        params: {},
    })

    /**
     * constants
     */

    const [maximumNumberOfBidders, setMaximumNumberOfBidders] = useState("0")
    const [minimumBid, setMinimumBid] = useState("0")
    const [auctioneerCollateralAmount, setAuctioneerCollateralAmount] = useState("0")
    const [sellerCollateralAmount, setSellerCollateralAmount] = useState("0")
    const [fetchedConstants, setFetchedConstants] = useState(false)
    const [image, setImage] = useState(``)
    const [title, setTitle] = useState(``)
    const [description, setDescription] = useState(``)

    async function getInfoFromIpfs() {
        const cid = await getInfoCID()
        const auctionInfo = (await axios.put(
            'http://localhost:3000/api/ipfs/cat/json',
            {
                data: cid
            }
        )).data

        setTitle(auctionInfo.title)
        setDescription(auctionInfo.description)
        const fetchedImage = (await axios.put(
            'http://localhost:3000/api/ipfs/cat/image',
            {
                data: auctionInfo.imageCID
            }
        )).data
        setImage(fetchedImage)
    }

    /**
     * time functions
     */

    function secondsToHms(d) {
        d = Number(d);
    
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);
    
        return ('0' + h).slice(-2) + ":" + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);
    }

    function timeNow() {
        return Math.floor(Date.now() / 1000)
    }

    function getTimePassedSince(timestamp) {
        return timeNow() - timestamp
    }

    function getTimeLeftUntil(intervalValue, timePassedSince) {
        return intervalValue - timePassedSince
    }

    function getTimeUntilThreshold(openIntervalThresholdValue, timePassedSinceStartValue) {
        if (timePassedSinceStartValue >= openIntervalThresholdValue) {
            return secondsToHms(0)
        } else {
            return secondsToHms(openIntervalThresholdValue - timePassedSinceStartValue)
        }
    }

    /**
     * time getters
     */

    const { runContractFunction: getStartTimestamp } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getStartTimestamp",
        params: {},
    })

    const { runContractFunction: getInterval } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getInterval",
        params: {},
    })

    const { runContractFunction: getOpenThreshold } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getOpenThreshold",
        params: {},
    })

    /**
     * time variables and constants
     */
    const [timeUntilClosing, setTimeUntilClosing] = useState("0")
    const [timeUntilThreshold, setTimeUntilThreshold] = useState("0")
    const [startTimestamp, setStartTimestamp] = useState(0)
    const [interval, setInterval] = useState(0)
    const [openIntervalThreshold, setOpenIntervalThreshold] = useState(0)

    async function fetchTimeConstants() {
        setStartTimestamp(await getStartTimestamp())
        setInterval(await getInterval())
        setOpenIntervalThreshold(await getOpenThreshold())
    }

    async function updateTimeUI() {
        let startTimestampValue, intervalValue, openIntervalThresholdValue
        if (fetchedConstants) {
            startTimestampValue = startTimestamp
            intervalValue = interval
            openIntervalThresholdValue = openIntervalThreshold
        } else {
            startTimestampValue = (await getStartTimestamp()).toNumber()
            intervalValue = (await getInterval()).toNumber()
            openIntervalThresholdValue = (await getOpenThreshold()).toNumber()
        }

        const timePassedSinceStartValue = getTimePassedSince(startTimestampValue)
        setTimeUntilThreshold(getTimeUntilThreshold(openIntervalThresholdValue, timePassedSinceStartValue))
        setTimeUntilClosing(secondsToHms(getTimeLeftUntil(intervalValue, timePassedSinceStartValue)))
    }

    async function fetchConstants() {
        const auctioneerCollateralAmountValue = await getAuctioneerCollateralAmount()
        setMaximumNumberOfBidders((await getMaximumNumberOfBidders()).toString())
        setMinimumBid((await getMinimumBid()).toString())
        setAuctioneerCollateralAmount(auctioneerCollateralAmountValue.toString())
        setSellerCollateralAmount(await getSellerCollateralAmount())
        await getInfoFromIpfs()
        setFetchedConstants(true)
    }

    async function updateUIVariables() {
        const amISellerValue = currUserAddress.toLowerCase() === sellerAddress.toLowerCase()
        console.log(`curr user: ${currUserAddress}`)
        setCurrentHighestBid((await getCurrentHighestBid()).toString())
        setNumberOfBidders((await getNumberOfBidders()).toString())
        if (!amISellerValue) {
            setMyCurrentBid((await getMyCurrentBid()).toString())
        } else {
            setMyCurrentBid("-1")
        }
    }

    async function updateUI() {
        setStatesAreLoading(true)
        if (!fetchedConstants) {
            await fetchTimeConstants()
            await fetchConstants()
        }

        await updateTimeUI()
        await updateUIVariables()
        setStatesAreLoading(false)
    }

    function getEtherOutput(amount) {
        return ethers.utils.formatUnits(amount, "ether")
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    return (
        <div className="w-62">
            { !statesAreLoading ?
            <Card
                onClick={() => router.push(`/auctions/${contractAddress}`)}
                tooltipText={
                <div className="w-96 flex flex-col gap-y-2">
                    <p>The structure of the card information is:</p>
                    <p>Minimum bid/Seller collateral/Auctioneer collateral</p>
                    <div>
                        <p>Your bid/The current highest bid OR</p>
                        <p>The current highest bid (if you are the seller)</p>
                    </div>
                    <p>Number of bidders/Maximum number of bidders</p>
                    <p>Time until the seller can close auction</p>
                    <p>Time until auction automatically closes</p>
                </div>}
            >
                <div className="w-56">
                    <div className="w-52">
                        <p class="truncate text-center text-blue-500 font-semibold">{title}</p>
                    </div>
                    { image && 
                        (<div className="w-56 h-56 flex justify-center items-center">
                            <img
                                src={image}
                                width="200px"
                                height="200px"
                            />
                        </div>)
                    }
                    <div className="h-24 overflow-hidden hover:overflow-scroll">
                        <p>{description}</p>
                    </div>
                    <div className="pt-4 text-center italic">
                        <p className="text-cyan-900">{`${getEtherOutput(minimumBid)}/${getEtherOutput(sellerCollateralAmount)}/${getEtherOutput(auctioneerCollateralAmount)}`}</p>
                        <div className="flex flex-row gap-x-28 px-4 text-cyan-800">
                            {
                                (myCurrentBid === "-1") ?
                                <p>{`${getEtherOutput(currentHighestBid)}`}</p> :
                                <p>{`${getEtherOutput(myCurrentBid)}/${getEtherOutput(currentHighestBid)}`}</p>
                            }

                            <p>{`${numberOfBidders}/${maximumNumberOfBidders}`}</p>
                        </div>
                        <div className="flex flex-row gap-x-16 px-4 text-cyan-900">
                            <p>{`${timeUntilThreshold}`}</p>
                            <p>{`${timeUntilClosing}`}</p>
                        </div>
                    </div>
                </div>
            </Card>
            :
            <Card
                onClick={() => router.push(`/auctions/${contractAddress}`)}
            >
                <Skeleton theme="text" />
                <div className="p-2">
                    <div className="flex flex-col items-end gap-2">
                        <Skeleton
                            theme="image"
                            width="200px"
                            height="200px"
                        />
                    </div>
                </div>
                <Skeleton
                    theme="image"
                    width="200px"
                    height="100px"
                />
                <Skeleton theme="text" />
                <Skeleton theme="text" />
                <Skeleton theme="text" />
            </Card>
            }
        </div>
    )
}