import { ethers } from "ethers"
import { useEffect, useState } from "react"

export default function HistoryRelevantInfo({ state, winningBid, sellerCollateral, auctioneerCollateral, type }) {
    const [text, setText] = useState(``)
    const [textColor, setTextColor] = useState(``)

    function getEtherOutput(amount) {
        return ethers.utils.formatUnits(amount, "ether") + " ETH"
    }

    async function updateTag() {
        switch(state) {
            case 2:
                if (type == "finished") {
                    setText(`Earned ${getEtherOutput(winningBid)}`)
                } else {
                    setText(`Payed ${getEtherOutput(winningBid)}`)
                }

                setTextColor("text-green-600")
                break;
            case 4:
                setText(``)
                break;
            case 3:
            default:
                if (type == "finished") {
                    setText(`Lost ${getEtherOutput(sellerCollateral)} as collateral and the ${getEtherOutput(winningBid)} bid`)
                } else {
                    setText(`Lost the ${getEtherOutput(winningBid)} bid and ${getEtherOutput(auctioneerCollateral)} as collateral`)
                }

                setTextColor("text-red-600")
          } 
    }

    useEffect(() => {
        updateTag()
    }, [])

    return (
        <p className={textColor}>{text}</p>
    )
}