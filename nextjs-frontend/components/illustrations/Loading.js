import { Illustration, Typography } from "web3uikit"

export default function Loading() {
    return (
        <div className="w-full text-center">
            <Illustration logo="looking" />
            <div className="pt-4">
                <Typography
                    onCopy={function noRefCheck(){}}
                    variant="body18"
                >
                    Loading...
                </Typography>
            </div>
        </div>
    )
}