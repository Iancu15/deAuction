import { useEffect, useState } from "react"
import { Skeleton } from "web3uikit"
import axios from 'axios'

export default function IpfsTitle({ infoCID }) {
    const [title, setTitle] = useState(``)
    
    async function getTitleFromIpfs() {
        const auctionInfo = (await axios.put(
            'http://localhost:3000/api/ipfs/cat/json',
            {
                data: infoCID
            }
        )).data

        return auctionInfo.title
    }

    async function updateTitle() {
        setTitle(await getTitleFromIpfs())
    }

    useEffect(() => {
        updateTitle()
    }, [])

    return (
        <div>
            { title === `` ? (<Skeleton width="200px" theme="text" />)
            : (<p>{title}</p>)}
        </div>
    )
}