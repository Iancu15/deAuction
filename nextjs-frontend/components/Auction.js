import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { Button, Input, Information, useNotification } from "web3uikit"
const contractAddress = require("../constants/contractAddress.json")
const abi = require("../constants/abi.json")

export default function Auction() {
    const { Moralis, isWeb3Enabled } = useMoralis()
    const dispatch = useNotification()

    async function getContract() {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        return new ethers.Contract(contractAddress, abi, provider)
    }

    /**
     * calling payable functions
     */

    async function enterAuction(bid) {
        const contract = await getContract()

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
        const contract = await getContract()

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

    async function updateUIVariables() {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        setConnectedUser(signer)
        const myAddress = await signer.getAddress()
        const amISellerValue = myAddress === (await getSellerAddress())
        setAmISeller(amISellerValue)
        setContractBalance((await getContractBalance()).toString())
        setCurrentHighestBid((await getCurrentHighestBid()).toString())
        const isOpenValue = await getIsOpen()
        setIsOpen(isOpenValue)
        setNumberOfBidders((await getNumberOfBidders()).toString())
        if (!amISellerValue) {
            setMyCurrentBid((await getMyCurrentBid()).toString())
            setDoIHaveTheHighestBid(await getDoIHaveTheHighestBid())
            if (myCurrentBid !== 0) {
                setEnteredAuction(true)
            } else {
                setEnteredAuction(false)
            }
        } else {
            const auctionWinnerValue = await getAuctionWinner()
            setAuctionWinner(auctionWinnerValue)
        }
    }

    async function wasContractDestroyed() {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        return (await provider.getCode(contractAddress)).toString() == "0x"
    }

    async function updateUI() {
        const isContractDestroyedValue = await wasContractDestroyed()
        setIsContractDestroyed(isContractDestroyedValue)
        if (!isContractDestroyedValue) {
            if (!fetchedConstants) {
                await fetchConstants()
                console.log('fetched constants')
            }

            await updateUIVariables()
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

    const handleNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        })
    }

    const handleError = (error) => {
        dispatch({
            type: "error",
            message: error,
            title: "Transaction Error",
            position: "topR",
            icon: "bell",
        })
    }

    const handleSuccess = async (tx) => {
        try {
            await tx.wait(1)
            handleNotification(tx)
            await updateUI()
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

    /**
     * helper functions
     */
    function getEtherOutput(amount) {
        return ethers.utils.formatUnits(amount, "ether") + " ETH"
    }

    return (
        <div>
            {statesAreLoading ? (<div></div>)
            : (<div>
            {isContractDestroyed ?
            (<div>
                <h1>Auction ended!</h1>
            </div>)
            : (<div>
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
            {amISeller
                ? (<div>
                    {isOpen ?
                    (<Button
                        onClick={
                            async () => {
                                await closeAuction({
                                    onSuccess: handleSuccess,
                                    onError: (error) => handleError(error.message)
                                })
                            }
                        }

                        text="Close auction"
                        theme="primary"
                        disabled={closeAuctionIsLoading || closeAuctionIsFetching}
                    />)
                    : (<div>
                    <Information
                        information={auctionWinner}
                        topic="Auction winner"
                    />
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
                        theme="primary"
                        disabled={burnAllStoredValueBidIsLoading || burnAllStoredValueBidIsFetching}
                    />
                    </div>)
                }
                </div>)
            : (<div>{enteredAuction
                ? (<div>
                    
                    <Information
                        information={getEtherOutput(myCurrentBid)}
                        topic="Your current bid"
                    />
                    <Information
                        information={doIHaveTheHighestBid ? "You're in the lead!" : "You're behind!"}
                    />
                    <div> {isOpen ? (<div>
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
                                        onSuccess: handleSuccess,
                                        onError: (error) => handleError(error.message)
                                    })
                                }
                            }

                            text="Leave auction"
                            theme="primary"
                            disabled={leaveAuctionIsLoading || leaveAuctionIsFetching}
                        />
                        </div>)
                        : (<div>
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
                                theme="primary"
                                disabled={leaveAuctionIsLoading || leaveAuctionIsFetching}
                            />
                            </div>)
                            : (<div></div>)}
                        </div>)}
                    </div>
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
                </div>)}
            </div>)}
            </div>)}
            </div>)}
        </div>
    )
}