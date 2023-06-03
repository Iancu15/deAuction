import { Illustration, Typography } from "web3uikit"

export default function NotConnected() {
    return (
        <div className="pl-96">
            <div className="text-center pl-96">
                <Illustration logo="servers" />
                <Typography
                    onCopy={function noRefCheck(){}}
                    variant="body18"
                >
                    Nothing to show
                </Typography>
            </div>
        </div>
    )
}