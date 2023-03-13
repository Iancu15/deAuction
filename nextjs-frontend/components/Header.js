import { ConnectButton } from "web3uikit"

export default function Header() {
    return (
        <nav>
            <ul>
                <li><h1> Decentralized Auction</h1></li>
                <li>
                    <div>
                        <ConnectButton moralisAuth={false}/>
                    </div>
                </li>
            </ul>
        </nav>
    )
}