import { Card, Skeleton, LockOpen, LockClosed } from "web3uikit"
import { useRouter } from 'next/router'
import React from 'react'
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import axios from 'axios'
const abi = require("../../constants/AuctionAbi.json")

export default function AuctionBox({
    contractAddress,
    sellerAddress,
    currUserAddress,
    state,
    searchQuery = ``,
    stateFilterId = 'all',
    showOnlyFreeAuctions = false,
    showOnlyAuctionsBelowThreshold = false,
    minValueMinimumBid = "",
    maxValueMinimumBid = "",
    minValueSellerCollateral = "",
    maxValueSellerCollateral = "",
    minValueAuctioneerCollateral = "",
    maxValueAuctioneerCollateral = "",
    minCurrentHighestBid = "",
    maxCurrentHighestBid = "",
    minTimeUntilClosingHours = "",
    maxTimeUntilClosingHours = ""
}) {
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
        if (auctionInfo.imageHost == "server") {
            const fetchedImage = (await axios.put(
                'http://localhost:3000/api/ipfs/cat/image',
                {
                    data: auctionInfo.imageCID
                }
            )).data
            setImage(fetchedImage)
        } else {
            setImage("https://ipfs.io/ipfs/" + auctionInfo.imageCID)
        }
    }

    /**
     * filter functionality
     */

    const [showAuctionBox, setShowAuctionBox] = useState(true)

    function checkSearchQuery() {
        const lowerCaseTitle = title.toLowerCase()
        const lowerCaseDescription = description.toLowerCase()
        const keywords = searchQuery.split(/[ ,]+/)
        for (let i = 0; i < keywords.length; i++) {
            const keyword = keywords[i]
            if (!(lowerCaseTitle.includes(keyword) || lowerCaseDescription.includes(keyword))) {
                return false
            }
        }

        return true
    }

    function checkInterval(minValue, maxValue, value) {
        if (minValue === "" && maxValue === "") {
            return true
        }

        const floatValue = parseFloat(value)
        const maxValueFloat = (maxValue === "") ? 0 : parseFloat(ethers.utils.parseEther(maxValue))
        if (minValue === "") {
            return floatValue <= maxValueFloat
        }

        const minValueFloat = (minValue === "") ? 0 : parseFloat(ethers.utils.parseEther(minValue))
        if (maxValue === "") {
            return minValueFloat <= floatValue
        }

        return minValueFloat <= floatValue && floatValue <= maxValueFloat
    }

    function checkIntervalTime(minValue, maxValue, value) {
        if (minValue === "" && maxValue === "") {
            return true
        }

        const floatValue = parseFloat(value)
        const maxValueFloat = (maxValue === "") ? 0 : parseFloat(maxValue)
        if (minValue === "") {
            return floatValue <= maxValueFloat
        }

        const minValueFloat = (minValue === "") ? 0 : parseFloat(minValue)
        if (maxValue === "") {
            return minValueFloat <= floatValue
        }

        return minValueFloat <= floatValue && floatValue <= maxValueFloat
    }

    function checkStateFilter() {
        console.log(stateFilterId)
        return stateFilterId == 'all' || (stateFilterId == 'open' && state === 0) ||
            (stateFilterId == 'closed' && state === 1)
    }

    function checkShowOnlyFreeAuctions() {
        if (showOnlyFreeAuctions === 'false') {
            return numberOfBidders < maximumNumberOfBidders
        }

        return true
    }

    function checkShowOnlyAuctionsBelowThreshold() {
        if (showOnlyAuctionsBelowThreshold === 'false') {
            return timeUntilThreshold !== secondsToHms(0)
        }

        return true
    }

    useEffect(() => {
        if (!statesAreLoading) {
            if (checkSearchQuery() && checkInterval(minValueMinimumBid, maxValueMinimumBid, minimumBid) &&
                checkInterval(minValueSellerCollateral, maxValueSellerCollateral, sellerCollateralAmount) &&
                checkInterval(minValueAuctioneerCollateral, maxValueAuctioneerCollateral, auctioneerCollateralAmount) &&
                checkInterval(minCurrentHighestBid, maxCurrentHighestBid, currentHighestBid) &&
                checkIntervalTime(minTimeUntilClosingHours, maxTimeUntilClosingHours, timeUntilClosing) &&
                checkShowOnlyFreeAuctions() && checkShowOnlyAuctionsBelowThreshold() &&
                checkStateFilter()
            ) {
                setShowAuctionBox(true)
            } else {
                setShowAuctionBox(false)
            }
        }
    }, [searchQuery, showOnlyFreeAuctions, showOnlyAuctionsBelowThreshold,
        minValueMinimumBid, maxValueMinimumBid, minValueSellerCollateral, maxValueSellerCollateral,
        minValueAuctioneerCollateral, maxValueAuctioneerCollateral, minCurrentHighestBid,
        maxCurrentHighestBid, minTimeUntilClosingHours, maxTimeUntilClosingHours, stateFilterId])

    /**
     * time functions
     */

    function secondsToHms(d) {
        d = Number(d);
    
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);
    
        var hour = ('0' + h).slice(-3)
        if (hour[0] == '0') {
            hour = ('0' + h).slice(-2)
        }
        
        return hour + ":" + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);
    }

    function timeNow() {
        return Math.floor(Date.now() / 1000)
    }

    function getTimePassedSince(timestamp) {
        return timeNow() - timestamp
    }

    function getTimeLeftUntil(intervalValue, timePassedSince) {
        const timeLeftUntilValue = intervalValue - timePassedSince
        return (timeLeftUntilValue > 0) ? timeLeftUntilValue : 0
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

    const { runContractFunction: getCloseTimestamp } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getCloseTimestamp",
        params: {},
    })

    const { runContractFunction: getClosedInterval } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getClosedInterval",
        params: {},
    })

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
    const [timeUntilDestroy, setTimeUntilDestroy] = useState("0")
    const [startTimestamp, setStartTimestamp] = useState(0)
    const [interval, setInterval] = useState(0)
    const [openIntervalThreshold, setOpenIntervalThreshold] = useState(0)
    const [closedInterval, setClosedInterval] = useState(0)
    const [closeTimestamp, setCloseTimestamp] = useState(0)

    async function fetchTimeConstants() {
        setStartTimestamp(await getStartTimestamp())
        setInterval(await getInterval())
        if (state === 0) {
            setOpenIntervalThreshold(await getOpenThreshold())
        } else {
            const closedIntervalValue = await getClosedInterval()
            setClosedInterval(closedIntervalValue)
            const closeTimestampValue = await getCloseTimestamp()
            setCloseTimestamp(closeTimestampValue)
        }
    }

    async function updateTimeUI() {
        let startTimestampValue, intervalValue, openIntervalThresholdValue, closedIntervalValue, closeTimestampValue
        if (fetchedConstants) {
            startTimestampValue = startTimestamp
            intervalValue = interval
            openIntervalThresholdValue = openIntervalThreshold
            closeTimestampValue = closeTimestamp
            closedIntervalValue = closedInterval
        } else {
            startTimestampValue = (await getStartTimestamp()).toNumber()
            if (state === 0) {
                intervalValue = (await getInterval()).toNumber()
                openIntervalThresholdValue = (await getOpenThreshold()).toNumber()
            } else {
                closedIntervalValue = (await getClosedInterval()).toNumber()
                closeTimestampValue = (await getCloseTimestamp()).toNumber()
            }
        }

        const timePassedSinceStartValue = getTimePassedSince(startTimestampValue)
        setTimeUntilThreshold(getTimeUntilThreshold(openIntervalThresholdValue, timePassedSinceStartValue))
        setTimeUntilClosing(secondsToHms(getTimeLeftUntil(intervalValue, timePassedSinceStartValue)))
        const timePassedSinceAuctionClosedValue = getTimePassedSince(closeTimestampValue)
        setTimeUntilDestroy(secondsToHms(getTimeLeftUntil(closedIntervalValue, timePassedSinceAuctionClosedValue)))
    }

    async function fetchConstants() {
        try {
            await getInfoFromIpfs()
        } catch (error) {
            console.log(error)
        }
        
        const auctioneerCollateralAmountValue = await getAuctioneerCollateralAmount()
        setMaximumNumberOfBidders((await getMaximumNumberOfBidders()).toString())
        setMinimumBid((await getMinimumBid()).toString())
        setAuctioneerCollateralAmount(auctioneerCollateralAmountValue.toString())
        setSellerCollateralAmount(await getSellerCollateralAmount())
        setFetchedConstants(true)
    }

    async function updateUIVariables() {
        const amISellerValue = currUserAddress.toLowerCase() === sellerAddress.toLowerCase()
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
            ( showAuctionBox ?
            (<Card
                style={{
                    borderRight: '1px solid #1E90FF',
                    borderLeft: '1px solid #1E90FF'
                }}
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
                    <p>Time until the seller can close auction (if it's open)</p>
                    <div>
                        <p>Time until auction automatically closes OR</p>
                        <p>Time until auction is automatically destroyed (if it's closed)</p>
                    </div>
                </div>}
            >
                <div className="w-56">
                    <div className="w-52">
                        <p class="truncate text-center text-blue-500 font-semibold">{title}</p>
                    </div>
                    { image && 
                        (<div className="w-56 h-56 overflow-hidden flex justify-center items-center">
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
                        <div className="flex flex-row text-cyan-800">
                            {
                                (myCurrentBid === "-1") ?
                                <p>{`${getEtherOutput(currentHighestBid)}`}</p> :
                                <p>{`${getEtherOutput(myCurrentBid)}/${getEtherOutput(currentHighestBid)}`}</p>
                            }

                            <p className="ml-auto">{`${numberOfBidders}/${maximumNumberOfBidders}`}</p>
                        </div>
                        {
                            (state === 0) ?
                            <div className="flex flex-row text-cyan-900">
                                <p>{`${timeUntilThreshold}`}</p>
                                <p className="ml-auto">{`${timeUntilClosing}`}</p>
                            </div> :
                            <div className="flex flex-row gap-x-16 px-4 text-cyan-900">
                                <p>{``}</p>
                                <p>{`${timeUntilDestroy}`}</p>
                            </div>
                        }
                        <div className="flex flex-row gap-x-2 pl-20 text-cyan-900">
                            <p>{ state === 0 ? "Open" : "Closed" }</p>
                            { state === 0 ? <LockOpen /> : <LockClosed /> }
                        </div>
                    </div>
                </div>
            </Card>) : (<div></div>) )
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
                <Skeleton theme="text" />
            </Card>
            }
        </div>
    )
}