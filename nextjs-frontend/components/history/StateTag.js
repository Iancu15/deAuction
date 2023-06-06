import { Tag } from "web3uikit"
import { useEffect, useState } from "react"

export default function StateTag({ state, onClick }) {
    const [tagText, setTagText] = useState(``)
    const [tagColor, setTagColor] = useState(``)

    async function updateTag() {
        switch(state) {
            case 2:
                setTagText("Succeeded")
                setTagColor("green")
                break;
            case 3:
                setTagText("Failed")
                setTagColor("red")
                break;
            case 4:
                setTagText("Cancelled")
                setTagColor("gray")
                break;
            default:
                setTagText("Time up")
                setTagColor("red")
          } 
    }

    useEffect(() => {
        updateTag()
    }, [])

    return (
        //<div onClick={onClick()}><Tag color={tagColor} text={tagText} /></div>
        <Tag color={tagColor} text={tagText} />
    )
}