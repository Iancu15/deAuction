import { Illustration, Typography } from "web3uikit"

export default function NotConnected() {
    return (
        <div className="w-full text-center">
            <Illustration logo="servers" />
            <Typography
                onCopy={function noRefCheck(){}}
                variant="body18"
            >
                Nothing to show
            </Typography>
        </div>
    )
}