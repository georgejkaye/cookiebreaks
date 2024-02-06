import { useState, useEffect } from "react"
import {
    User,
    CookieBreak,
    UpdateBreaksFn,
    getFutureBreaks,
    getBreaksToReimburse,
} from "../structs"
import { UpcomingBreakCard } from "./upcoming"
import { TailSpin } from "react-loader-spinner"
import { BreakDetails } from "./breaks"
import { SetState } from "../page"
import { Card, BreaksHeader } from "./cards"

const AwaitingReimbursementButtons = (props: {
    user: User | undefined
    index: number
    cb: CookieBreak
    setCardLoading: SetState<boolean>
    updateBreaks: UpdateBreaksFn
}) => {
    return <div></div>
}

const AwaitingReimbursementCard = (props: {
    index: number
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setCardLoading: SetState<boolean>
}) => {
    return (
        <div className="flex align-stretch flex-col justify-evenly items-center desktop:flex-row">
            <BreakDetails
                cb={props.cb}
                user={props.user}
                setCardLoading={props.setCardLoading}
                updateBreaks={props.updateBreaks}
            />
            {!props.user?.admin ? (
                ""
            ) : (
                <AwaitingReimbursementButtons
                    user={props.user}
                    index={props.index}
                    cb={props.cb}
                    setCardLoading={props.setCardLoading}
                    updateBreaks={props.updateBreaks}
                />
            )}
        </div>
    )
}

export const AwaitingReimbursementCards = (props: {
    user: User | undefined
    breaks: CookieBreak[]
    updateBreaks: UpdateBreaksFn
}) => {
    const [breaksToReimburse, setBreaksToReimburse] = useState<CookieBreak[]>(
        []
    )
    useEffect(() => {
        setBreaksToReimburse(getBreaksToReimburse(props.breaks))
    }, [props.breaks])
    return (
        <div>
            <BreaksHeader title={"Awaiting reimbursement"} />
            {breaksToReimburse.map((b, i) => (
                <Card
                    content={(setCardLoading) => (
                        <AwaitingReimbursementCard
                            index={i}
                            user={props.user}
                            cb={b}
                            updateBreaks={props.updateBreaks}
                            setCardLoading={setCardLoading}
                        />
                    )}
                />
            ))}
        </div>
    )
}
