import { Illustration, Typography } from "web3uikit"

export default function NotConnected() {
    return (
        <div className="w-full pt-20 text-center">
            <Illustration
                logo="marketplace"
            />
            <Typography
                onCopy={function noRefCheck(){}}
                variant="body18"
            >
                Please connect to your wallet
            </Typography>
        </div>
    )
}