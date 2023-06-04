import { ethers } from "ethers"
import { useEffect, useState } from "react"

export default function HistoryRelevantInfo({ state, winningBid, sellerCollateral }) {
    const [text, setText] = useState(``)
    const [textColor, setTextColor] = useState(``)

    function getEtherOutput(amount) {
        return ethers.utils.formatUnits(amount, "ether") + " ETH"
    }

    async function updateTag() {
        switch(state) {
            case 2:
                setText(`Earned ${getEtherOutput(winningBid)}`)
                setTextColor("text-green-600")
                break;
            case 3:
                setText(`Lost ${getEtherOutput(sellerCollateral)} as collateral and the ${getEtherOutput(winningBid)} bid`)
                setTextColor("text-red-600")
                break;
            case 4:
                setText(``)
                break;
            default:
                setText("Time up")
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