import { useState } from "react"
import { Input } from "web3uikit"

export default function IntervalFilter({ label, setMinValue, setMaxValue }) {
    const [minValueInput, setMinValueInput] = useState("")
    const [maxValueInput, setMaxValueInput] = useState("")
    const inputWidth = "5vw"
    const zero = parseFloat("0")

    function checkMinValue() {
        const minValueFloat = parseFloat(minValueInput)
        return minValueInput === "" || (minValueFloat >= zero && (maxValueInput === "" || minValueFloat <= parseFloat(maxValueInput)))
    }
    
    function checkMaxValue() {
        return maxValueInput === "" || parseFloat(maxValueInput) >= zero
    }

    return (
        <div className="flex flex-row gap-4 px-5">
            <Input
                errorMessage={'Bigger than max or negative'}
                label={`Min ${label}`}
                placeholder=""
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
                placeholder=""
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