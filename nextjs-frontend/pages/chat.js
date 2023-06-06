import { Input, Search } from "web3uikit"
import { useState, useEffect } from "react"
import { useMoralis } from "react-moralis"
import { ethers } from "ethers"
import NotConnected from "../components/illustrations/NotConnected"
const network = require("../constants/network.json")

const ethereumAddressRegex = /^0x[0-9a-fA-F]{40}$/;

export default function ChatPage() {
    const { isWeb3Enabled } = useMoralis()
    const [buddyAddress, setBuddyAddress] = useState(``)
    const [statesAreLoading, setStatesAreLoading] = useState(true)
    const [buddyTransactionHistory, setBuddyTransactionHistory] = useState(true)

    async function updateTransactionHistory(provider, address) {
        provider.getHistory(address).then((history) => {
            console.log(history)
            setBuddyTransactionHistory(history)
        });
    }

    async function updateChat() {
        setStatesAreLoading(true)
        let etherscanProvider = new ethers.providers.EtherscanProvider("sepolia");
        if (checkBuddyAddress()) {
            await updateTransactionHistory(etherscanProvider, buddyAddress)
        }

        setStatesAreLoading(false)
    }

    function checkBuddyAddress() {
        return ethereumAddressRegex.test(buddyAddress);
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
                    <div className="w-full flex items-center justify-center p-5">
                        <Input
                            customize={{
                                backgroundColor: '#213853',
                                border: '1px solid #99D3FF',
                                borderRadius: '16px',
                                color: '#99D3FF',
                                fontSize: '16px,',
                                margin: '20px 0px',
                                onHover: 'lighten',
                                padding: '16px 10px'
                            }}
                            label="Search by Wallet Address"
                            placeholder="0x..."
                            setLabelMargin={{
                                left: '40px'
                            }}
                            slots={{
                                slotBefore: [
                                    <Search />
                                ]
                            }}
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
                    {/* { statesAreLoading ? (<Loading />) : (
                            <div>
                                {
                                    buddyTransactionHistory.forEach((tx) => {
                                        console.log(tx);
                                    })
                                }
                            </div>
                    )} */}
                </div>
            ) : (<NotConnected />)}
        </div>
    )
}