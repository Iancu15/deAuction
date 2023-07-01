import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { Button, Input, Widget, Hero, Skeleton, Typography, Accordion } from "web3uikit"
import { useNotification, Bell, Checkmark } from "web3uikit"
import axios from 'axios'
import NotConnected from "../illustrations/NotConnected"
import SellerStats from "./SellerStats"
const abi = require("../../constants/AuctionAbi.json")

export default function Auction({ contractAddress }) {
    const { isWeb3Enabled } = useMoralis()
    const dispatch = useNotification()

    /**
     * ethers helper functions
     */

    async function getContract() {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        return new ethers.Contract(contractAddress, abi, provider)
    }

    async function wasContractDestroyed() {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        return (await provider.getCode(contractAddress)).toString() == "0x"
    }

    function getEtherOutput(amount) {
        return ethers.utils.formatUnits(amount, "ether") + " ETH"
    }

    /**
     * calling payable functions
     */

    async function enterAuction() {
        const contract = await getContract()
        const minimumBidPlusCollateralFloat = parseFloat(ethers.utils.formatUnits(minimumBidPlusCollateral, "ether"))
        const collateralFloat = parseFloat(ethers.utils.formatUnits(auctioneerCollateralAmount, "ether"))
        const bidFloat = parseFloat(input)
        if (maximumNumberOfBidders === numberOfBidders) {
            handleErrorNotification('Maximum number of participants reached!')
        } else if (!input) {
            handleErrorNotification('Invalid input! Bid has to be numerical.')
        } else if (bidFloat < minimumBidPlusCollateralFloat) {
            handleErrorNotification('Bid has to be higher or equal to ' + ethers.utils.formatUnits(minimumBidPlusCollateral, "ether") + ' ETH! You tried to bid ' + input + ' ETH.')
        } else if (bidFloat === collateralFloat) {
            handleErrorNotification('The bid only covers the collateral! The actual bid is 0.')
        } else {
            setIsLoading(true)
            try {
                const tx = await contract.connect(connectedUser).enterAuction({
                    value: ethers.utils.parseEther(input)
                })
                await handleSuccess(tx)
            } catch (error) {
                handleError(error.message)
            }

            setIsLoading(false)
        }
    }

    async function increaseBid() {
        const contract = await getContract()

        if (!input) {
            handleErrorNotification('Invalid input! Addition bid has to be numerical.')
        } else if (input === '0') {
            handleErrorNotification('Addition bid has to be higher than 0 ETH. You tried to bid ' + input + ' ETH.')
        } else {
            setIsLoading(true)
            try {
                const tx = await contract.connect(connectedUser).increaseBid({
                    value: ethers.utils.parseEther(input)
                })
                await handleSuccess(tx)
            } catch (error) {
                handleError(error.message)
            }

            setIsLoading(false)
        }
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
        runContractFunction: performUpkeep,
        isLoading: performUpkeepIsLoading,
        isFetching: performUpkeepIsFetching
    } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "performUpkeep",
        params: {},
    })

    const {
        runContractFunction: getTimePassedSinceStart,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getTimePassedSinceStart",
        params: {},
    })

    const {
        runContractFunction: getTimePassedSinceAuctionClosed,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getTimePassedSinceAuctionClosed",
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

    const { runContractFunction: getSellerAddress } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getSellerAddress",
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
    const [sellerAddress, setSellerAddress] = useState("0")
    const [auctioneerCollateralAmount, setAuctioneerCollateralAmount] = useState("0")
    const [sellerCollateralAmount, setSellerCollateralAmount] = useState("0")
    const [minimumBidPlusCollateral, setMinimumBidPlusCollateral] = useState("0")
    const [fetchedConstants, setFetchedConstants] = useState(false)

    /**
     * variable view getters
     */

    const { runContractFunction: getAuctionWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getAuctionWinner",
        params: {},
    })

    const { runContractFunction: getMyCurrentBid } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getMyCurrentBid",
        params: {},
    })

    const { runContractFunction: getContractBalance } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getContractBalance",
        params: {},
    })

    const { runContractFunction: getCurrentHighestBid } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getCurrentHighestBid",
        params: {},
    })

    const { runContractFunction: getDoIHaveTheHighestBid } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "doIHaveTheHighestBid",
        params: {},
    })

    const { runContractFunction: getIsOpen } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "isOpen",
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

    const [auctionWinner, setAuctionWinner] = useState("0")
    const [myCurrentBid, setMyCurrentBid] = useState("0")
    const [contractBalance, setContractBalance] = useState("0")
    const [currentHighestBid, setCurrentHighestBid] = useState("0")
    const [doIHaveTheHighestBid, setDoIHaveTheHighestBid] = useState(false)
    const [isOpen, setIsOpen] = useState(true)
    const [numberOfBidders, setNumberOfBidders] = useState("0")

    /**
     * time getters
     */
    const { runContractFunction: getStartTimestamp } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getStartTimestamp",
        params: {},
    })

    const { runContractFunction: getCloseTimestamp } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getCloseTimestamp",
        params: {},
    })

    const { runContractFunction: getInterval } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getInterval",
        params: {},
    })

    const { runContractFunction: getClosedInterval } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getClosedInterval",
        params: {},
    })

    const { runContractFunction: getOpenThreshold } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getOpenThreshold",
        params: {},
    })

    /**
     * time functions
     */

    function getTimePassedSince(timestamp) {
        return timeNow() - timestamp
    }

    function getTimeLeftUntil(intervalValue, timePassedSince) {
        const timeLeftUntilValue = intervalValue - timePassedSince
        return (timeLeftUntilValue > 0) ? timeLeftUntilValue : 0
    }

    function getFinishDate(timestampValue, intervalValue) {
        return getDate(timestampValue.add(intervalValue))
    }

    function getTimeUntilThreshold(openIntervalThresholdValue, timePassedSinceStartValue) {
        if (timePassedSinceStartValue >= openIntervalThresholdValue) {
            return "Seller can close the auction at his/her own discretion"
        } else {
            return secondsToHms(openIntervalThresholdValue - timePassedSinceStartValue)
        }
    }

    /**
     * time variables and constants
     */
    const [startTimestamp, setStartTimestamp] = useState(0)
    const [closeTimestamp, setCloseTimestamp] = useState(0)
    const [startDate, setStartDate] = useState("0")
    const [closeDate, setCloseDate] = useState("0")
    const [destroyDate, setDestroyDate] = useState("0")
    const [timePassedSinceStart, setTimePassedSinceStart] = useState("0")
    const [timePassedSinceAuctionClosed, setTimePassedSinceAuctionClosed] = useState("0")
    const [timeUntilClosing, setTimeUntilClosing] = useState("0")
    const [timeUntilDestroy, setTimeUntilDestroy] = useState("0")
    const [timeUntilThreshold, setTimeUntilThreshold] = useState("0")
    const [interval, setInterval] = useState(0)
    const [closedInterval, setClosedInterval] = useState(0)
    const [openIntervalThreshold, setOpenIntervalThreshold] = useState(0)

    /**
     * helper time functions
     */

    function getDate(secondsSinceEpoch) {
        return new Date(secondsSinceEpoch * 1000).toString()
    }

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

    /**
     * rerendering functions
     */

    async function fetchTimeConstants() {
        const startTimestampValue = await getStartTimestamp()
        const intervalValue = await getInterval()
        const isOpenValue = await getIsOpen()
        setStartTimestamp(startTimestampValue)
        setInterval(intervalValue)
        setStartDate(getDate(startTimestampValue))
        if (isOpenValue) {
            setOpenIntervalThreshold(await getOpenThreshold())
            setCloseDate(getFinishDate(startTimestampValue, intervalValue))
        } else {
            const closedIntervalValue = await getClosedInterval()
            setClosedInterval(closedIntervalValue)
            const closeTimestampValue = await getCloseTimestamp()
            setCloseTimestamp(closeTimestampValue)
            setCloseDate(getDate(closeTimestampValue))
            setDestroyDate(getFinishDate(closeTimestampValue, closedIntervalValue))
        }
    }

    async function updateTimeUI(isOpenValue) {
        let startTimestampValue, intervalValue, closedIntervalValue, closeTimestampValue, openIntervalThresholdValue
        if (fetchedConstants) {
            startTimestampValue = startTimestamp
            intervalValue = interval
            closedIntervalValue = closedInterval
            closeTimestampValue = closeTimestamp
            openIntervalThresholdValue = openIntervalThreshold
        } else {
            startTimestampValue = (await getStartTimestamp()).toNumber()
            if (isOpenValue) { 
                intervalValue = (await getInterval()).toNumber()
                openIntervalThresholdValue = (await getOpenThreshold()).toNumber()
            } else {
                closedIntervalValue = (await getClosedInterval()).toNumber()
                closeTimestampValue = (await getCloseTimestamp()).toNumber()
            }
        }

        const timePassedSinceStartValue = getTimePassedSince(startTimestampValue)
        setTimePassedSinceStart(secondsToHms(timePassedSinceStartValue))
        if (isOpenValue) {
            setTimeUntilThreshold(getTimeUntilThreshold(openIntervalThresholdValue, timePassedSinceStartValue))
            setTimeUntilClosing(secondsToHms(getTimeLeftUntil(intervalValue, timePassedSinceStartValue)))
        } else {
            const timePassedSinceAuctionClosedValue = getTimePassedSince(closeTimestampValue)
            setTimePassedSinceAuctionClosed(secondsToHms(timePassedSinceAuctionClosedValue))
            setTimeUntilDestroy(secondsToHms(getTimeLeftUntil(closedIntervalValue, timePassedSinceAuctionClosedValue)))
        }
    }

    /**
     * ipfs stored variables
     */
    const [image, setImage] = useState(``)
    const [title, setTitle] = useState(``)
    const [description, setDescription] = useState(``)
    const [infoCID, setInfoCID] = useState(``)
    const [imageCID, setImageCID] = useState(``)

    async function getInfoFromIpfs() {
        const cid = await getInfoCID()
        setInfoCID(cid)
        const auctionInfo = (await axios.put(
            'http://localhost:3000/api/ipfs/cat/json',
            {
                data: cid
            }
        )).data

        setTitle(auctionInfo.title)
        setDescription(auctionInfo.description)
        setImageCID(auctionInfo.imageCID)
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

    async function fetchConstants() {
        const auctioneerCollateralAmountValue = await getAuctioneerCollateralAmount()
        const minimumBidValue = await getMinimumBid()
        if (minimumBidValue !== undefined) {
            const minimumBidPlusCollateralValue = minimumBidValue.add(auctioneerCollateralAmountValue)
            setMinimumBidPlusCollateral(minimumBidPlusCollateralValue.toString())
        }

        setMaximumNumberOfBidders((await getMaximumNumberOfBidders()).toString())
        setMinimumBid(minimumBidValue.toString())
        const sellerAddress = await getSellerAddress()
        setSellerAddress(sellerAddress)
        setAuctioneerCollateralAmount(auctioneerCollateralAmountValue.toString())
        setSellerCollateralAmount(await getSellerCollateralAmount())
        await getInfoFromIpfs()
        setFetchedConstants(true)
    }

    async function updateUIVariables(minimalUpdate = false) {
        let amISellerValue
        if (!minimalUpdate) {
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            setConnectedUser(signer)
            const myAddress = await signer.getAddress()
            amISellerValue = myAddress === (await getSellerAddress())
            setAmISeller(amISellerValue)
        } else {
            amISellerValue = amISeller
        }

        setContractBalance((await getContractBalance()).toString())
        setCurrentHighestBid((await getCurrentHighestBid()).toString())
        const isOpenValue = await getIsOpen()
        setIsOpen(isOpenValue)
        setNumberOfBidders((await getNumberOfBidders()).toString())
        if (!amISellerValue) {
            const myCurrentBidValue = (await getMyCurrentBid()).toString()
            setMyCurrentBid(myCurrentBidValue)
            setDoIHaveTheHighestBid(await getDoIHaveTheHighestBid())
            if (myCurrentBidValue.toString() !== '0') {
                setEnteredAuction(true)
            } else {
                setEnteredAuction(false)
            }
        } else if (!isOpenValue) {
            const auctionWinnerValue = await getAuctionWinner()
            setAuctionWinner(auctionWinnerValue)
        }

        return isOpenValue
    }

    async function updateUI(minimalUpdate = false) {
        console.log('updating UI...')
        try {
            const isContractDestroyedValue = await wasContractDestroyed()
            setIsContractDestroyed(isContractDestroyedValue)
            if (!isContractDestroyedValue) {
                setStatesAreLoading(true)
                if (!fetchedConstants) {
                    await fetchTimeConstants()
                    await fetchConstants()
                    console.log('fetched constants')
                }

                const isOpenValue = await updateUIVariables(minimalUpdate)
                await updateTimeUI(isOpenValue)
                console.log('updated UI')
            }
        } catch (e) {
            console.log(e.message)
        } finally {
            setStatesAreLoading(false)
        }
    }

    if (typeof window !== "undefined") {
        window.ethereum.on('accountsChanged', function (accounts) {
            updateUI()
        })
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    /**
     * notification functions
     */

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
        } else if (errorMessage.includes('denied') || errorMessage.includes('user rejected transaction')) {
            handleInfoNotification("Transaction wasn't send.")
        } else if (errorMessage == "Internal JSON-RPC error.") {
            handleInfoNotification("There's not enough money in your wallet.")
        } else {
            handleErrorNotification(errorMessage)
        }
    }

    const handleSuccess = async (tx) => {
        try {
            await tx.wait(1)
            handleSuccessNotification(tx)
            await updateUI(true)
        } catch (error) {
            console.log(error)
        }
    }

    /**
     * auxiliary state variables
     */
    const [input, setInput] = useState("0")
    const [connectedUser, setConnectedUser] = useState({})
    const [enteredAuction, setEnteredAuction] = useState(false)
    const [amISeller, setAmISeller] = useState(false)
    const [statesAreLoading, setStatesAreLoading] = useState(true)
    const [isContractDestroyed, setIsContractDestroyed] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    return (
        <div>
            { isWeb3Enabled ?
            (<div>
                {statesAreLoading ? (
                <div style={{ display: 'grid', gap: '20px', padding: '20px 170px' }}>
                    <section style={{ display: 'flex', gap: '20px' }}>
                        <div className="w-full">
                            <Accordion
                                id="accordion"
                                theme="blue"
                                title={<Skeleton width="200px" theme="text" />}
                                subTitle="Press for description"
                            >
                            </Accordion>
                        </div>
                    </section>
                    <section style={{ display: 'flex', gap: '20px' }}>
                        <Widget info={<Skeleton width="200px" theme="text" />} title="Contract address" />
                        <Widget info={<Skeleton width="200px" theme="text" />} title="Seller address" />
                    </section>
                    <section style={{ display: 'flex', gap: '20px' }}>
                        <Widget info={<Skeleton width="200px" theme="text" />} title="Seller collateral amount" />
                        <Widget info={<Skeleton width="200px" theme="text" />} title="Minimum bid" />
                        <Widget info={<Skeleton width="200px" theme="text" />} title="Auctioneer collateral amount" />
                        <Widget info={<Skeleton width="200px" theme="text" />} title="Highest bid currently" />
                    </section>
                    <section style={{ display: 'flex', gap: '20px' }}>
                        <Widget info={<Skeleton width="200px" theme="text" />} title="Auction status" />
                        <Widget info={<Skeleton width="200px" theme="text" />} title="Contract balance" />
                        {isOpen ? (<Widget info={<Skeleton width="200px" theme="text" />} title="Number of participants" />)
                            : (<Widget info={<Skeleton width="200px" theme="text" />} title="Maximum number of participants" />)}
                    </section>
                    <section style={{ display: 'flex', gap: '20px' }}>
                        <Widget info={<Skeleton width="200px" theme="text" />} title="Start date" />
                        {isOpen ? (<Widget info={<Skeleton width="200px" theme="text" />} title="Automatic close date" />)
                            : (<Widget info={<Skeleton width="200px" theme="text" />} title="Date auction closed" />)}
                    </section>
                    <section style={{ display: 'flex', gap: '20px' }}>
                        <Widget info={<Skeleton width="200px" theme="text" />} title="Time passed since the start of the auction" />
                        { isOpen ? <Widget info={<Skeleton theme="text" />} title="Time left until auction automatically closes" />
                        : <Widget info={<Skeleton width="200px" theme="text" />} title="Time passed since the auction closed" /> }
                        { isOpen ? <Widget info={<Skeleton width="200px" theme="text" />} title="Time left until seller can close auction" /> 
                        : <div></div> }
                    </section>
                    { isOpen ? <div></div> :
                        <section style={{ display: 'flex', gap: '20px' }}>
                            <Widget info={<Skeleton width="200px" theme="text" />} title="Destroy date" />
                            <Widget info={<Skeleton width="200px" theme="text" />} title="Time left until auction is destroyed" />
                        </section>
                    }
                    <section style={{ display: 'flex', gap: '20px' }}>
                        <Widget info={<Skeleton width="200px" theme="text" />} title="Seller successes" />
                        <Widget info={<Skeleton width="200px" theme="text" />} title="Seller failures" />
                        <Widget info={<Skeleton width="200px" theme="text" />} title="Seller time ups" />
                        <Widget info={<Skeleton width="200px" theme="text" />} title="Failure(+ time ups) percentage" />
                    </section>
                    <section style={{ display: 'flex', gap: '20px' }}>
                        <Widget info={<Skeleton width="200px" theme="text" />} title="IPFS CID for the information JSON" />
                        <Widget info={<Skeleton width="200px" theme="text" />} title="IPFS CID for the image" />
                    </section>
                </div>)
                : (<div>
                {isContractDestroyed ?
                (<div className="w-4/5 pt-4 pl-80">
                    <Hero
                        backgroundURL="https://moralis.io/wp-content/uploads/2021/06/blue-blob-background-2.svg"
                        height="200px"
                        title={<p className="text-9xl">Auction ended!</p>}
                        textColor="#1a1a49"
                    />
                </div>)
                : (<div>
                {(!amISeller && enteredAuction) ?
                (
                    <div className="w-4/5 pt-4 pl-96">
                    <Hero
                        linearGradient="linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(46,46,120,1) 7%, rgba(0,212,255,1) 100%);"
                        height="125px"
                        textColor="#f1f1ff"
                        align="center"
                        title={isOpen ? (doIHaveTheHighestBid ? "You're in the lead!" : "You're behind!") : (doIHaveTheHighestBid ? 'You won!' : '')}
                        subTitle={"Your " + (isOpen ? 'current' : 'winning') + ' bid ' + (isOpen ? 'is ' : 'was ') + getEtherOutput(myCurrentBid)}
                    />
                    </div>
                ) : (<div></div>)}
                {(amISeller && !isOpen) ?
                (
                    <div className="w-4/5 pt-4 pl-96">
                    <Hero
                        linearGradient="linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(46,46,120,1) 7%, rgba(0,212,255,1) 100%);"
                        height="125px"
                        textColor="#f1f1ff"
                        align="center"
                        title={auctionWinner}
                        subTitle='The winner of the auction'
                    />
                    </div>
                ) : (<div></div>)}
                <div style={{ display: 'grid', gap: '20px', padding: '20px 170px' }}>
                    <section style={{ display: 'flex', gap: '20px' }}>
                        <div className="w-full">
                            <Accordion
                                id="accordion"
                                theme="blue"
                                title={title}
                                subTitle="Press for description"
                            >
                                <p className="p-2 text-slate-700">{description}</p>
                            </Accordion>
                        </div>
                    </section>
                    <section style={{ display: 'flex', gap: '20px' }}>
                    { image && 
                            (<div className="w-full flex justify-center items-center">
                                <img
                                    src={image}
                                />
                            </div>)
                        }
                    </section>
                    <section style={{ display: 'flex', gap: '20px' }}>
                        <Widget info={
                            <Typography
                                copyable
                                onCopy={function noRefCheck(){}}
                                variant="body18"
                                color="#000000"
                            >
                                {contractAddress}
                            </Typography>
                        } title="Contract address" />
                        <Widget info={<Typography
                                copyable
                                onCopy={function noRefCheck(){}}
                                variant="body18"
                                color="#000000"
                            >
                                {sellerAddress}
                            </Typography>
                        } title="Seller address" />
                    </section>
                    <section style={{ display: 'flex', gap: '20px' }}>
                        <Widget info={getEtherOutput(sellerCollateralAmount)} title="Seller collateral amount" />
                        <Widget info={getEtherOutput(minimumBid)} title="Minimum bid" />
                        <Widget info={getEtherOutput(auctioneerCollateralAmount)} title="Auctioneer collateral amount" />
                        <Widget info={getEtherOutput(currentHighestBid)} title="Highest bid currently" />
                    </section>
                    <section style={{ display: 'flex', gap: '20px' }}>
                        <Widget info={isOpen ? "Open" : "Closed"} title="Auction status" />
                        <Widget info={getEtherOutput(contractBalance)} title="Contract balance" />
                        {isOpen ? (<Widget info={numberOfBidders + "/" + maximumNumberOfBidders} title="Number of participants" />)
                            : (<Widget info={maximumNumberOfBidders} title="Maximum number of participants" />)}
                    </section>
                    <section style={{ display: 'flex', gap: '20px' }}>
                        <Widget info={startDate} title="Start date" />
                        { isOpen ? <Widget info={closeDate} title="Automatic close date" /> :
                        <Widget info={closeDate} title="Date auction closed" /> }
                    </section>
                    <section style={{ display: 'flex', gap: '20px' }}>
                        <Widget info={timePassedSinceStart} title="Time passed since the start of the auction" />
                        { isOpen ? <Widget info={timeUntilClosing} title="Time left until auction automatically closes" />
                        : <Widget info={timePassedSinceAuctionClosed} title="Time passed since the auction closed" /> }
                        { isOpen ? <Widget info={timeUntilThreshold} title="Time left until seller can close auction" />
                        : <div></div> }
                    </section>
                    { isOpen ? <div></div> :
                        <section style={{ display: 'flex', gap: '20px' }}>
                            <Widget info={destroyDate} title="Destroy date" />
                            <Widget info={timeUntilDestroy} title="Time left until auction is destroyed" />
                        </section>
                    }
                    <SellerStats sellerAddress={sellerAddress} />
                    <section style={{ display: 'flex', gap: '20px' }}>
                        <Widget info={infoCID} title="IPFS CID for the information JSON" />
                        <Widget info={imageCID} title="IPFS CID for the image" />
                    </section>
                </div>
                {amISeller
                    ? (<div>
                        {isOpen ?
                        (<div className="pl-44 pb-10">
                            <Button
                                onClick={
                                    async () => {
                                        await closeAuction({
                                            onSuccess: handleSuccess,
                                            onError: (error) => handleError(error.message)
                                        })
                                    }
                                }

                                text="Close auction"
                                theme="colored"
                                color="red"
                                size="large"
                                disabled={closeAuctionIsLoading || closeAuctionIsFetching}
                            />
                        </div>)
                        : (<div className="pl-44 pb-4">
                            <Button
                                onClick={
                                    async () => {
                                        await burnAllStoredValue({
                                            onSuccess: handleSuccess,
                                            onError: (error) => handleError(error.message)
                                        })
                                    }
                                }

                                text="Burn all stored value"
                                theme="colored"
                                color="red"
                                size="large"
                                disabled={burnAllStoredValueBidIsLoading || burnAllStoredValueBidIsFetching}
                            />
                        </div>)
                    }
                    </div>)
                : (<div>{enteredAuction
                    ? (<div> 
                        {isOpen ?
                            (<div className="flex flex-row">
                                <div className="flex flex-col pl-44 gap-4">
                                    <Button
                                        onClick={
                                            async () => {
                                                if (doIHaveTheHighestBid) {
                                                    handleErrorNotification("You're the highest bidder therefore you can't withdraw!")
                                                } else {
                                                    await leaveAuction({
                                                        onSuccess: handleSuccess,
                                                        onError: (error) => handleError(error.message)
                                                    })
                                                }
                                            }
                                        }
                                        
                                        color="red"
                                        text="Leave auction"
                                        theme="colored"
                                        size="large"
                                        disabled={leaveAuctionIsLoading || leaveAuctionIsFetching}
                                    />
                                    <Button
                                        onClick={
                                            async () => {
                                                const timePassedSinceStartFloat = parseFloat(await getTimePassedSinceStart())
                                                const intervalFloat = parseFloat(interval)
                                                if (timePassedSinceStartFloat >= intervalFloat) {
                                                    await performUpkeep({
                                                        onSuccess: handleSuccess,
                                                        onError: (error) => handleError(error.message)
                                                    })
                                                } else {
                                                    handleErrorNotification('Upkeep not needed!')
                                                }
                                            }
                                        }

                                        text="Perform upkeep"
                                        theme="colored"
                                        color="red"
                                        size="large"
                                        disabled={performUpkeepIsLoading || performUpkeepIsFetching}
                                    />
                                </div>
                                <div className="ml-auto pr-44">
                                    <Input
                                        errorMessage={'Addition bid has to be numerical and higher than 0'}
                                        label="Addition bid"
                                        placeholder="0"
                                        type="number"
                                        onChange={(event) => {
                                            setInput(event.target.value)
                                        }}

                                        state={
                                            (parseFloat(input) > parseFloat('0'))
                                            ? "confirmed" : "error"
                                        }
                                    />
                                    <div className="pb-5 pt-7">
                                        <Button
                                            onClick={
                                                async () => {
                                                    await increaseBid()
                                                }
                                            }

                                            text="Increase bid"
                                            theme="colored"
                                            color="blue"
                                            size="large"    
                                            disabled={isLoading}
                                        />
                                    
                                    </div>
                                </div>
                            </div>)
                            : (<div>
                                {doIHaveTheHighestBid ? (
                                <div className="flex flex-row pb-4">
                                    <div className="pl-44">
                                        <Button
                                            onClick={
                                                async () => {
                                                    const timePassedSinceAuctionClosedFloat = parseFloat(await getTimePassedSinceAuctionClosed())
                                                    const closedIntervalFloat = parseFloat(closedInterval)
                                                    if (timePassedSinceAuctionClosedFloat >= closedIntervalFloat) {
                                                        await performUpkeep({
                                                            onSuccess: handleSuccess,
                                                            onError: (error) => handleError(error.message)
                                                        })
                                                    } else {
                                                        handleErrorNotification('Upkeep not needed!')
                                                    }
                                                }
                                            }

                                            text="Perform upkeep"
                                            theme="colored"
                                            color="red"
                                            size="large"
                                            disabled={performUpkeepIsLoading || performUpkeepIsFetching}
                                        />
                                    </div>
                                    <div className="ml-auto pr-36">
                                        <Button
                                            onClick={
                                                async () => {
                                                    await routeHighestBid({
                                                        onSuccess: handleSuccess,
                                                        onError: (error) => handleError(error.message)
                                                    })
                                                }
                                            }

                                            text="Route bid"
                                            theme="colored"
                                            color="blue"
                                            size="large"
                                            disabled={routeHighestBidIsLoading || routeHighestBidIsFetching}
                                        />
                                    </div>
                                </div>)
                                : (<div></div>)}
                            </div>)}
                        </div>
                    )
                    : (<div>
                        {isOpen ? (
                        <div className="float-right pr-44">
                            <Input
                                errorMessage={'Bid has to be numerical and higher than ' + ethers.utils.formatUnits(minimumBidPlusCollateral, "ether") + ' ETH'}
                                label="Starting bid"
                                placeholder={ethers.utils.formatUnits(minimumBidPlusCollateral, "ether")}
                                type="number"
                                onChange={(event) => {
                                    setInput(event.target.value)
                                }}
                                state={
                                    (parseFloat(input) >= parseFloat(ethers.utils.formatUnits(minimumBidPlusCollateral, "ether")))
                                    ? "confirmed" : "error"
                                }
                            />
                            <div className="pb-5 pt-7">
                                <Button
                                    onClick={
                                        async () => {
                                            await enterAuction()
                                        }
                                    }

                                    text="Enter Auction"
                                    theme="colored"
                                    color="blue"
                                    disabled={isLoading}
                                />
                            </div>
                            </div>)
                            : (<div></div>)}
                    </div>)}
                </div>)}
                </div>)}
                </div>)}
            </div>)
            : (
                <NotConnected />
            )}
        </div>
    )
}