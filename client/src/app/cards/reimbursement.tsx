import { useState, useEffect, useRef } from "react"
import { User, CookieBreak, UpdateFn, getBreaksToReimburse } from "../structs"
import { BreakDetails } from "./breaks"
import { SetState } from "../page"
import { Card, BreaksHeader, CardButtonProps, CardButtons } from "./cards"
import { reimburseBreak } from "../api"

const AwaitingReimbursementCard = (props: {
    index: number
    user: User | undefined
    cookieBreak: CookieBreak
    updateBreaks: UpdateFn<CookieBreak>
    setCardLoading: SetState<boolean>
    setColour: SetState<string | undefined>
}) => {
    const [isReimbursing, setReimbursing] = useState(false)
    const [breakCostText, setBreakCostText] = useState("")
    const [errorText, setErrorText] = useState("")
    useEffect(() => {
        if (isReimbursing) {
            props.setColour("bg-gray-200")
        } else {
            props.setColour(undefined)
        }
    }, [isReimbursing])

    const buttons: CardButtonProps[] = [
        {
            isVisible: true,
            icon: "reimburse",
            onClick: () => setReimbursing(!isReimbursing),
        },
    ]
    const onReimburse = () => {
        const number = Number.parseFloat(breakCostText)
        if (isNaN(number)) {
            setErrorText("Break cost must be float")
        } else {
            reimburseBreak(
                props.user,
                props.cookieBreak,
                10.0,
                props.updateBreaks,
                props.setCardLoading
            )
        }
    }
    const onKeyDownCostBox = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onReimburse()
        }
    }
    const onChangeCostBox = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBreakCostText(e.target.value)
    }
    return (
        <>
            <div className="flex align-stretch flex-col justify-evenly items-center desktop:flex-row">
                <BreakDetails
                    cookieBreak={props.cookieBreak}
                    user={props.user}
                    setCardLoading={props.setCardLoading}
                    updateBreaks={props.updateBreaks}
                />
                {!props.user?.admin ? (
                    ""
                ) : (
                    <CardButtons width="w-36" buttons={buttons} />
                )}
            </div>
            {!isReimbursing ? (
                ""
            ) : (
                <div className="flex flex-col desktop:flex-row items-center">
                    <div className="font-bold mr-2">Break cost</div>
                    <input
                        autoFocus
                        className="m-1 rounded p-1"
                        size={5}
                        type="text"
                        value={breakCostText}
                        onKeyDown={onKeyDownCostBox}
                        onChange={onChangeCostBox}
                    />
                    <div>{errorText}</div>
                </div>
            )}
        </>
    )
}

export const AwaitingReimbursementCards = (props: {
    user: User | undefined
    cookieBreaks: CookieBreak[]
    updateBreaks: UpdateFn<CookieBreak>
}) => {
    const [breaksToReimburse, setBreaksToReimburse] = useState<CookieBreak[]>(
        []
    )
    useEffect(() => {
        setBreaksToReimburse(getBreaksToReimburse(props.cookieBreaks))
    }, [props.cookieBreaks])
    return (
        <div>
            <BreaksHeader title={"Awaiting reimbursement"} />
            {breaksToReimburse.map((b, i) => (
                <Card
                    key={b.id}
                    content={(setCardLoading, setColour) => (
                        <AwaitingReimbursementCard
                            index={i}
                            user={props.user}
                            cookieBreak={b}
                            updateBreaks={props.updateBreaks}
                            setCardLoading={setCardLoading}
                            setColour={setColour}
                        />
                    )}
                />
            ))}
        </div>
    )
}
