import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { Button, Input } from "web3uikit"
const contractAddress = require("../constants/contractAddress.json")
const abi = require("../constants/abi.json")

export default function Auction() {
    const { Moralis, isWeb3Enabled } = useMoralis()

    /**
     * calling payable functions
     */

    async function callEnterAuction(bid) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const contract = new ethers.Contract(contractAddress, abi, provider)

        try {
            const tx = await contract.connect(connectedUser).enterAuction({
                value: ethers.utils.parseEther(bid)
            })
            await handleSuccess(tx)
        } catch (error) {
            console.log(error)
        }
    }

    function callIncreaseBid(bidAddition) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const contract = new ethers.Contract(contractAddress, abi, provider)
        contract.connect(connectedUser).increaseBid({
            value: ethers.utils.parseEther(bidAddition)
        })
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

    const [maximumNumberOfBidders, setMaximumNumberOfBidders] = useState(0)
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
    const [myCurrentBid, setMyCurrentBid] = useState("0")
    const [contractBalance, setContractBalance] = useState("0")
    const [currentHighestBid, setCurrentHighestBid] = useState("0")
    const [doIHaveTheHighestBid, setDoIHaveTheHighestBid] = useState(false)
    const [isOpen, setIsOpen] = useState(true)
    const [numberOfBidders, setNumberOfBidders] = useState(0)

    async function fetchConstants() {
        const auctioneerCollateralAmountValue = await getAuctioneerCollateralAmount()
        const minimumBidValue = await getMinimumBid()
        console.log(minimumBidValue)
        const minimumBidPlusCollateralValue = minimumBidValue.add(auctioneerCollateralAmountValue)
        setMaximumNumberOfBidders(await getMaximumNumberOfBidders())
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

    window.ethereum.on('accountsChanged', function (accounts) {
        updateConnectedUser()
    })

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

            updateConnectedUser()
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

    /**
     * auxiliary state variables
     */
    const [input, setInput] = useState("0")
    const [connectedUser, setconnectedUser] = useState("0")

    return (
        <div>
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
                        await callEnterAuction(input)
                    }
                }
                text="Enter Auction"
                theme="primary"
                //disabled={enterAuctionIsLoading || enterAuctionIsFetching}
            />
        </div>
    )
}