import { useQuery } from "@apollo/client"
import AuctionBox from "./AuctionBox"
import { useMoralis } from "react-moralis"
import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Input, Accordion, Checkbox } from "web3uikit"
import Loading from "../illustrations/Loading"
import NotConnected from "../illustrations/NotConnected"
import NothingToShow from "../illustrations/NothingToShow"
import IntervalFilter from "./IntervalFilter"

export default function Marketplace({ query }) {
    const { loading, error, data: auctions } = useQuery(query)
    const { isWeb3Enabled } = useMoralis()
    const [currUserAddress, setCurrUserAddress] = useState(``)
    const [statesAreLoading, setStatesAreLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState(``)
    const [minValueMinimumBid, setMinValueMinimumBid] = useState("")
    const [maxValueMinimumBid, setMaxValueMinimumBid] = useState("")
    const [minValueSellerCollateral, setMinValueSellerCollateral] = useState("")
    const [maxValueSellerCollateral, setMaxValueSellerCollateral] = useState("")
    const [minValueAuctioneerCollateral, setMinValueAuctioneerCollateral] = useState("")
    const [maxValueAuctioneerCollateral, setMaxValueAuctioneerCollateral] = useState("")
    const [showOnlyFreeAuctions, setShowOnlyFreeAuctions] = useState(false)
    const [showOnlyAuctionsBelowThreshold, setShowOnlyAuctionsBelowThreshold] = useState(false)

    async function updateUserAddress() {
        console.log('updating user address...')
        setStatesAreLoading(true)
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        setCurrUserAddress(await signer.getAddress())
        setStatesAreLoading(false)
        console.log('updating user address...')
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUserAddress()
        }
    }, [isWeb3Enabled])

    function checkInterval(minValue, maxValue, value) {
        if (minValue === "0" && maxValue === "0") {
            return true
        }

        const floatValue = parseFloat(value)
        return parseFloat(minValue) <= floatValue && floatValue <= parseFloat(maxValue)
    }

    function checkMinimumBidInterval(value) {
        return checkInterval(minValueMinimumBid, maxValueMinimumBid, value)
    }

    function checkSellerCollateralInterval(value) {
        return checkInterval(minValueSellerCollateral, maxValueSellerCollateral, value)
    }

    function checkAuctioneerCollateralInterval(value) {
        return checkInterval(minValueAuctioneerCollateral, maxValueAuctioneerCollateral, value)
    }

    return (
        <div>
            {isWeb3Enabled ? (
                loading || !auctions || statesAreLoading ? (
                    <div className="p-8">
                        <Loading />
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <div className="flex flex-row p-8 sticky top-0 gap-8 bg-white">
                            <Input
                                label="Search"
                                placeholder="🔍 | Keywords separated by space"
                                onChange={(event) => {
                                    setSearchQuery(event.target.value.toLowerCase())
                                }}
                                errorMessage="Please enter a valid address"
                            />
                            <div className="w-full">
                            <Accordion
                                id="accordion"
                                theme="blue"
                                title="Filter options"
                            >
                                <div className="flex flex-col p-8 gap-8">
                                    <div className="flex flex-row gap-52">
                                        <IntervalFilter
                                            label="minimum bid"
                                            setMinValue={(value) => setMinValueMinimumBid(value)}
                                            setMaxValue={(value) => setMaxValueMinimumBid(value)}
                                        />
                                        <IntervalFilter
                                            label="seller collateral"
                                            setMinValue={(value) => setMinValueSellerCollateral(value)}
                                            setMaxValue={(value) => setMaxValueSellerCollateral(value)}
                                        />
                                        <IntervalFilter
                                            label="auctioneer collateral"
                                            setMinValue={(value) => setMinValueAuctioneerCollateral(value)}
                                            setMaxValue={(value) => setMaxValueAuctioneerCollateral(value)}
                                        />
                                    </div>
                                    <div className="flex flex-row gap-52">
                                        <IntervalFilter
                                            label="current highest bid"
                                            setMinValue={(value) => setMinValueMinimumBid(value)}
                                            setMaxValue={(value) => setMaxValueMinimumBid(value)}
                                        />
                                        <IntervalFilter
                                            label="time until closing (hours)"
                                            setMinValue={(value) => setMinValueMinimumBid(value)}
                                            setMaxValue={(value) => setMaxValueMinimumBid(value)}
                                        />
                                        <div className="flex flex-row px-8">
                                            <Checkbox
                                                id="filter-checkbox-1"
                                                label="Show only auctions with free spots"
                                                name="Test checkbox input"
                                                onChange={(event) => setShowOnlyFreeAuctions(event.target.value)}
                                            />
                                            <Checkbox
                                                id="filter-checkbox-2"
                                                label="Show only auctions that can't yet be manually closed"
                                                name="Test checkbox input"
                                                onChange={(event) => setShowOnlyAuctionsBelowThreshold(event.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Accordion>
                            </div>
                        </div>
                        <div className="flex flex-wrap pl-8 pr-8 pb-8 -z-10">
                            {
                                auctions.auctionEntities.length > 0 ?
                                (
                                    auctions.auctionEntities.map((auction) => {
                                        const { id, sellerAddress, state } = auction
                                        return (
                                            <AuctionBox
                                                contractAddress={id}
                                                sellerAddress={sellerAddress}
                                                currUserAddress={currUserAddress}
                                                state={state}
                                                searchQuery={searchQuery}
                                                showOnlyFreeAuctions={showOnlyFreeAuctions}
                                                showOnlyAuctionsBelowThreshold={showOnlyAuctionsBelowThreshold}
                                                minValueMinimumBid={minValueMinimumBid}
                                                maxValueMinimumBid={minValueMinimumBid}
                                                checkSellerCollateral={checkSellerCollateralInterval}
                                                checkAuctioneerCollateral={checkAuctioneerCollateralInterval}
                                            />
                                        )
                                    })
                                ) :
                                (<NothingToShow />)
                            }
                        </div>
                    </div>
                )
            ) : (
                <NotConnected />
            )}
        </div>
    )
}