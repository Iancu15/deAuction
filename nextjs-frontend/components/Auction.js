import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { Button, Input, useNotification, Widget, Hero, Skeleton } from "web3uikit"
const contractAddress = require("../constants/contractAddress.json")
const abi = require("../constants/abi.json")

export default function Auction() {
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
     * rerendering functions
     */

    async function fetchConstants() {
        const auctioneerCollateralAmountValue = await getAuctioneerCollateralAmount()
        const minimumBidValue = await getMinimumBid()
        if (minimumBidValue !== undefined) {
            const minimumBidPlusCollateralValue = minimumBidValue.add(auctioneerCollateralAmountValue)
            setMinimumBidPlusCollateral(minimumBidPlusCollateralValue.toString())
        }

        setMaximumNumberOfBidders((await getMaximumNumberOfBidders()).toString())
        setMinimumBid(minimumBidValue.toString())
        setSellerAddress(await getSellerAddress())
        setAuctioneerCollateralAmount(auctioneerCollateralAmountValue.toString())
        setSellerCollateralAmount(await getSellerCollateralAmount())
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
    }

    async function updateUI(minimalUpdate = false) {
        console.log('updating UI...')
        setStatesAreLoading(true)
        const isContractDestroyedValue = await wasContractDestroyed()
        setIsContractDestroyed(isContractDestroyedValue)
        if (!isContractDestroyedValue) {
            if (!fetchedConstants) {
                await fetchConstants()
                console.log('fetched constants')
            }

            await updateUIVariables(minimalUpdate)
            console.log('updated UI')
        }

        setStatesAreLoading(false)
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
        } else if (errorMessage.includes('denied')) {
            handleInfoNotification("Transaction wasn't send.")
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
            {statesAreLoading ? (
            <div style={{ display: 'grid', gap: '20px', padding: '20px 170px' }}>
                <section style={{ display: 'flex', gap: '20px' }}>
                    <Widget info={<Skeleton theme="text" />} title="Seller address" />
                    <Widget info={<Skeleton theme="text" />} title="Seller collateral amount" />
                </section>
                <section style={{ display: 'flex', gap: '20px' }}>
                    <Widget info={<Skeleton theme="text" />} title="Minimum bid" />
                    <Widget info={<Skeleton theme="text" />} title="Auctioneer collateral amount" />
                    <Widget info={<Skeleton theme="text" />} title="Highest bid currently" />
                </section>
                <section style={{ display: 'flex', gap: '20px' }}>
                    <Widget info={<Skeleton theme="text" />} title="Auction status" />
                    <Widget info={<Skeleton theme="text" />} title="Contract balance" />
                    {isOpen ? (<Widget info={<Skeleton theme="text" />} title="Number of participants" />)
                        : (<Widget info={<Skeleton theme="text" />} title="Maximum number of participants" />)}
                </section>
            </div>)
            : (<div>
            {isContractDestroyed ?
            (<div>
                <Hero
                    height="200px"
                    title='Auction ended!'
                />
            </div>)
            : (<div>
            {(!amISeller && enteredAuction) ?
            (
                <Hero
                    height="125px"
                    title={isOpen ? (doIHaveTheHighestBid ? "You're in the lead!" : "You're behind!") : (doIHaveTheHighestBid ? 'You won!' : '')}
                    subTitle={"Your " + (isOpen ? 'current' : 'winning') + ' bid ' + (isOpen ? 'is ' : 'was ') + getEtherOutput(myCurrentBid)}
                />
            ) : (<div></div>)}
            {(amISeller && !isOpen) ?
            (
                <Hero
                    height="125px"
                    title={auctionWinner}
                    subTitle='The winner of the auction'
                />
            ) : (<div></div>)}
            <div style={{ display: 'grid', gap: '20px', padding: '20px 170px' }}>
                <section style={{ display: 'flex', gap: '20px' }}>
                    <Widget info={sellerAddress} title="Seller address" />
                    <Widget info={getEtherOutput(sellerCollateralAmount)} title="Seller collateral amount" />
                </section>
                <section style={{ display: 'flex', gap: '20px' }}>
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
            </div>
            {amISeller
                ? (<div>
                    {isOpen ?
                    (<div className="pl-44">
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
                    : (<div className="pl-44">
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
                ? (<div> {isOpen ?
                        (<div className="flex flex-row">
                            <div className="pl-44">
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
                                        (parseFloat(input) >= parseFloat('0'))
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
                        : (<div className="float-right pr-44">
                            {doIHaveTheHighestBid ? (<div>
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
        </div>
    )
}