import { Table, Copy, Button } from "web3uikit"

export default function EllipsisAddress({ address }) {
    return (
        <div>
            {
                address ?
                (<div className="flex flex-row">
                    <p>{`${address.slice(0, 6)}...${address.slice(36)}`}</p>
                    <Button
                        icon={<Copy width="20px" height="20px" fill="green" />}
                        iconLayout="icon-only"
                        onClick={ () =>  navigator.clipboard.writeText(address) }
                    />
                </div>) : (<div></div>)
            }
        </div>
    )
}