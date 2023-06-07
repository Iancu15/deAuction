import { Input, TextArea, useNotification, Bell, Checkmark } from "web3uikit"
import { useState, useEffect, useRef } from "react"
import { useMoralis } from "react-moralis"
import { ethers } from "ethers"
import NotConnected from "../components/illustrations/NotConnected"
import Loading from "../components/illustrations/Loading"
import MessageBubble from "../components/chat/MessageBubble"
import { Button } from '@material-ui/core'

const ethereumAddressRegex = /^0x[0-9a-fA-F]{40}$/;

export default function ChatPage() {
    const { isWeb3Enabled } = useMoralis()
    const [buddyAddress, setBuddyAddress] = useState(``)
    const [statesAreLoading, setStatesAreLoading] = useState(true)
    const [myTransactionHistory, setMyTransactionHistory] = useState(Array.from({ test: "test" }))
    const [currMessage, setCurrMessage] = useState(``)
    const containerRef = useRef(null)
    const dispatch = useNotification()

    async function getCurrAddress() {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        return await signer.getAddress()
    }

    function scrollToBottom() {
        containerRef.current.scrollIntoView(
            {
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest'
            }
        )
    }

    function showChat() {
        setStatesAreLoading(false)
        setTimeout(scrollToBottom, 50)
    }

    async function updateTransactionHistory(provider) {
        getCurrAddress().then((myAddress) => {
            provider.getHistory(myAddress).then((myHistory) => {
                const lowerCaseMyAddress = myAddress.toLowerCase()
                const lowerCaseBuddyAddress = buddyAddress.toLowerCase()
                const filteredHistory = myHistory.filter((tx) => {
                    const lowerCaseFrom = tx.from.toLowerCase()
                    const lowerCaseTo = tx.to.toLowerCase()
                    return (lowerCaseFrom == lowerCaseMyAddress && lowerCaseTo == lowerCaseBuddyAddress)
                        || (lowerCaseFrom == lowerCaseBuddyAddress && lowerCaseTo == lowerCaseMyAddress)
                })

                setMyTransactionHistory(filteredHistory)
                setTimeout(showChat, 1000)
            })
        })
    }

    async function updateChat() {
        setStatesAreLoading(true)
        let etherscanProvider = new ethers.providers.EtherscanProvider("sepolia");
        if (checkBuddyAddress()) {
            await updateTransactionHistory(etherscanProvider)
        }
    }

    function checkBuddyAddress() {
        return ethereumAddressRegex.test(buddyAddress);
    }

    function getDate(secondsSinceEpoch) {
        return new Date(secondsSinceEpoch * 1000).toString()
    }

    function hexToUtf8(hexString) {
        // Split the hex string into an array of two-character substrings
        const hexArray = hexString.match(/.{1,2}/g);
        
        // Convert each substring to decimal
        const decimalArray = hexArray.map(hex => parseInt(hex, 16));
        
        // Create Uint8Array from decimal values
        const uint8Array = new Uint8Array(decimalArray);
        
        // Decode Uint8Array to UTF-8 string
        const decoder = new TextDecoder('utf-8');
        const utf8String = decoder.decode(uint8Array);
        
        return utf8String;
    }

    /**
     * notification functions
     */

     const handleSuccessNotification = (message) => {
        dispatch({
            type: 'success',
            message: message,
            title: 'Notification',
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
        handleBellNotification('error', errorMessage, 'Error')
    }

    const handleInfoNotification = (message) => {
        handleBellNotification('info', message, 'Information')
    }

    const handleWarningNotification = (message) => {
        handleBellNotification('warning', message, 'Warning')
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
            handleSuccessNotification('Message was sent!')
            await updateChat()
        } catch (error) {
            console.log(error)
        }
    }

    /**
     * send message
     */

    async function sendMessage() {
        console.log(currMessage)
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        const tx = {
            from: (await signer.getAddress()),
            to: buddyAddress,
            data: ethers.utils.hexlify(ethers.utils.toUtf8Bytes(currMessage))
        }

        signer.sendTransaction(tx).then((transaction) => {
            handleSuccess(transaction)
        }).catch((error) => handleError(error.message))
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateChat()
        }
    }, [isWeb3Enabled, buddyAddress])

    return (
        <div>
            { isWeb3Enabled ? (
                <div>
                    <div className="w-full flex items-center justify-center p-5 sticky top-0 bg-white">
                        <Input
                            label="Search by Wallet Address"
                            placeholder="🔍 | 0x..."
                            onChange={(event) => {
                                setBuddyAddress(event.target.value.toLowerCase())
                            }}
                            state={
                                checkBuddyAddress() ? "confirmed" : "error"
                            }
                            errorMessage="Please enter a valid address"
                        />
                    </div>
                    <div className="w-full flex items-center justify-center">
                        <hr className="w-4/5" />
                    </div>
                    {
                        checkBuddyAddress() ?
                        ( statesAreLoading ? (<Loading />) : (
                            (<div ref={containerRef} className="flex flex-col gap-8 p-4">
                                {
                                    myTransactionHistory.map((tx) => {
                                        const date = getDate(tx.timestamp)
                                        const message = hexToUtf8(tx.data).slice(1)
                                        const hash = tx.hash
                                        const amISender = buddyAddress.toLowerCase() == tx.to.toLowerCase()
                                        return (
                                            <MessageBubble message={message} date={date} hash={hash} amISender={amISender} />
                                        )
                                    })
                                }
                                <div className="pt-4 flex flex-row items-center justify-center">
                                    <div className="pr-2">
                                    <TextArea
                                        placeholder="Type a message"
                                        value={currMessage}
                                        onChange={(event) => {
                                            setCurrMessage(event.target.value)
                                        }}
                                        width="700px"
                                    />
                                    </div>
                                    <div className="bg-blue-400 rounded-lg">
                                        <Button
                                        style={{maxWidth: '150px', maxHeight: '150px', minWidth: '150px', minHeight: '150px'}}
                                        onClick={() => {
                                            if (currMessage === ``) {
                                                handleWarningNotification('Type the message before sending it')
                                            } else {
                                                sendMessage()
                                            }
                                        }}
                                        size="large">
                                            <svg xmlns="http://www.w3.org/2000/svg" height="50" viewBox="0 0 24 24" width="50"><path d="M0 0h24v24H0z" fill="none"/><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                                        </Button>
                                    </div>
                                </div>
                            </div>)
                        ))  : (<div></div>)}
                </div>
            ) : (<NotConnected />)}
        </div>
    )
}