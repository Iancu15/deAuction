import { useState } from "react"
import { Input } from "web3uikit"

export default function IntervalFilter({ label, setMinValue, setMaxValue }) {
    const [minValueInput, setMinValueInput] = useState("0")
    const [maxValueInput, setMaxValueInput] = useState("0")
    const inputWidth = "5vw"

    function checkMinValue() {
        return parseFloat(minValueInput) >= parseFloat("0") && parseFloat(minValueInput) <= parseFloat(maxValueInput)
    }

    function checkMaxValue() {
        return parseFloat(maxValueInput) >= parseFloat("0")
    }

    return (
        <div className="flex flex-row gap-4 px-5">
            <Input
                errorMessage={'Bigger than max or negative'}
                label={`Min ${label}`}
                placeholder="0"
                type="number"
                onChange={(event) => {
                    setMinValueInput(event.target.value)
                    if (checkMinValue()) {
                        setMinValue(event.target.value)
                    }
                }}
                state={
                    checkMinValue() ? "confirmed" : "error"
                }
                width={inputWidth}
            />
            <Input
                errorMessage={'Negative or contains letters'}
                label={`Max ${label}`}
                placeholder="0"
                type="number"
                onChange={(event) => {
                    setMaxValueInput(event.target.value)
                    if (checkMaxValue()) {
                        setMaxValue(event.target.value)
                    }
                }}
                state={
                    checkMaxValue() ? "confirmed" : "error"
                }
                width={inputWidth}
            />
        </div>
    )
}