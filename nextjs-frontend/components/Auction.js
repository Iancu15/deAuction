import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { Button, Input, Information, useNotification } from "web3uikit"
const contractAddress = require("../constants/contractAddress.json")
const abi = require("../constants/abi.json")

export default function Auction() {
    const { Moralis, isWeb3Enabled } = useMoralis()
    const dispatch = useNotification()

    /**
     * calling payable functions
     */

    async function enterAuction(bid) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const contract = new ethers.Contract(contractAddress, abi, provider)

        try {
            const tx = await contract.connect(connectedUser).enterAuction({
                value: ethers.utils.parseEther(bid)
            })
            await handleSuccess(tx)
            setEnteredAuction(true)
        } catch (error) {
            console.log(error)
        }
    }

    async function increaseBid(bidAddition) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const contract = new ethers.Contract(contractAddress, abi, provider)

        try {
            const tx = await contract.connect(connectedUser).increaseBid({
                value: ethers.utils.parseEther(bidAddition)
            })
            await handleSuccess(tx)
        } catch (error) {
            console.log(error)
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
    let fetchedConstants = false

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

    async function fetchConstants() {
        const auctioneerCollateralAmountValue = await getAuctioneerCollateralAmount()
        const minimumBidValue = await getMinimumBid()
        const minimumBidPlusCollateralValue = minimumBidValue.add(auctioneerCollateralAmountValue)
        setMaximumNumberOfBidders((await getMaximumNumberOfBidders()).toString())
        setMinimumBid(minimumBidValue.toString())
        setSellerAddress(await getSellerAddress())
        setAuctioneerCollateralAmount(auctioneerCollateralAmountValue.toString())
        setSellerCollateralAmount(await getSellerCollateralAmount())
        setMinimumBidPlusCollateral(minimumBidPlusCollateralValue.toString())
        fetchedConstants = true
    }

    /**
     * useEffect callable functions
     */
    async function updateConnectedUser() {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        setconnectedUser(signer)
    }

    async function updateUIVariables() {
        setMyCurrentBid((await getMyCurrentBid()).toString())
        setContractBalance((await getContractBalance()).toString())
        setCurrentHighestBid((await getCurrentHighestBid()).toString())
        setDoIHaveTheHighestBid(await getDoIHaveTheHighestBid())
        setIsOpen(await getIsOpen())
        setNumberOfBidders((await getNumberOfBidders()).toString())
        if (myCurrentBid != 0) {
            console.log('ceva')
            setEnteredAuction(true)
        } else {
            console.log('altceva')
            setEnteredAuction(false)
        }
    }

    if (typeof window !== "undefined") {
        window.ethereum.on('accountsChanged', function (accounts) {
            updateConnectedUser()
            updateUIVariables()
        })
    }
    
    useEffect(() => {
        if (isWeb3Enabled) {
            fetchConstants()
            updateConnectedUser()
            updateUIVariables()
        }
    }, [])

    useEffect(() => {
        if (isWeb3Enabled) {
            if (!fetchedConstants) {
                fetchConstants()
            }

            updateConnectedUser()
            updateUIVariables()
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
            handleNewNotification(tx)
        } catch (error) {
            console.log(error)
        }
    }

    const handleSuccessLeaveAuction = async (tx) => {
        try {
            await tx.wait(1)
            handleNewNotification(tx)
            setEnteredAuction(false)
        } catch (error) {
            console.log(error)
        }
    }

    /**
     * auxiliary state variables
     */
    const [input, setInput] = useState("0")
    const [connectedUser, setconnectedUser] = useState("0")
    const [enteredAuction, setEnteredAuction] = useState(false)

    /**
     * helper functions
     */
    function getEtherOutput(amount) {
        return ethers.utils.formatUnits(sellerCollateralAmount, "ether") + " ETH"
    }

    return (
        <div>   
            <Information
                information={getEtherOutput(minimumBid)}
                topic="Minimum bid"
            />
            <Information
                information={sellerAddress}
                topic="Seller address"
            />
            <Information
                information={getEtherOutput(auctioneerCollateralAmount)}
                topic="Auctioneer collateral amount"
            />
            <Information
                information={getEtherOutput(sellerCollateralAmount)}
                topic="Seller collateral amount"
            />
            <Information
                information={numberOfBidders + "/" + maximumNumberOfBidders}
                topic="Number of participants"
            />
            <Information
                information={getEtherOutput(contractBalance)}
                topic="Contract balance"
            />
            <Information
                information={getEtherOutput(currentHighestBid)}
                topic="Highest bid currently"
            />
            <Information
                information={isOpen ? "Open" : "Closed"}
                topic="Auction status"
            />
            {enteredAuction 
                ? (<div>
                    <Information
                        information={getEtherOutput(myCurrentBid)}
                        topic="Your current bid"
                    />
                    <Information
                        information={doIHaveTheHighestBid ? "You're in the lead!" : "You're behind!"}
                    />
                    <Input
                        label="Addition bid"
                        placeholder="0"
                        type="number"
                        onChange={(event) => {
                            setInput(event.target.value)
                        }}
                    />
                    <Button
                        onClick={
                            async () => {
                                await increaseBid(input)
                            }
                        }

                        text="Increase bid"
                        theme="primary"
                        //disabled={enterAuctionIsLoading || enterAuctionIsFetching}
                    />
                    <Button
                        onClick={
                            async () => {
                                await leaveAuction({
                                    onSuccess: handleSuccessLeaveAuction,
                                    onError: (error) => console.log(error)
                                })
                            }
                        }

                        text="Leave auction"
                        theme="primary"
                        disabled={leaveAuctionIsLoading || leaveAuctionIsFetching}
                    />
                </div>)
                : (<div>
                    <Input
                        label="Starting bid"
                        placeholder={ethers.utils.formatUnits(minimumBidPlusCollateral, "ether")}
                        type="number"
                        onChange={(event) => {
                            setInput(event.target.value)
                        }}
                    />
                    <Button
                        onClick={
                            async () => {
                                await enterAuction(input)
                            }
                        }

                        text="Enter Auction"
                        theme="primary"
                        //disabled={enterAuctionIsLoading || enterAuctionIsFetching}
                    />
                </div>)
            }
        </div>
    )
}