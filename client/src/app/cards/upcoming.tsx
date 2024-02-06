import { useState, useEffect } from "react"
import { announceBreak, submitClaim } from "../api"
import { getSelectedColour, getCardColour, BreakDetails } from "./breaks"
import { ActionButton, BreaksHeader, Card } from "./cards"
import { getHoverColour } from "../icons"
import {
    User,
    CookieBreak,
    UpdateBreaksFn,
    UpdateClaimsFn,
    getBreaksToClaim,
    formatAsPrice,
    getOutstandingBreaks,
    getFutureBreaks,
} from "../structs"
import { SetState } from "../page"
import { AnnounceButton, DeleteButton, HolidayButton } from "./buttons"
import { TailSpin } from "react-loader-spinner"

const UpcomingBreakButtons = (props: {
    index: number
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setCardLoading: SetState<boolean>
}) => (
    <div className="w-36 flex justify-end">
        {props.index > 0 ? (
            ""
        ) : (
            <AnnounceButton
                user={props.user}
                cb={props.cb}
                updateBreaks={props.updateBreaks}
                setLoading={props.setCardLoading}
            />
        )}
        <HolidayButton
            user={props.user}
            cb={props.cb}
            updateBreaks={props.updateBreaks}
            holidayText={""}
            setLoading={props.setCardLoading}
        />
        <DeleteButton
            user={props.user}
            cb={props.cb}
            updateBreaks={props.updateBreaks}
            setLoading={props.setCardLoading}
        />
    </div>
)

export const UpcomingBreakCard = (props: {
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
                <UpcomingBreakButtons
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

export const UpcomingBreaksCards = (props: {
    user: User | undefined
    breaks: CookieBreak[]
    updateBreaks: UpdateBreaksFn
}) => {
    const [upcomingBreaks, setUpcomingBreaks] = useState<CookieBreak[]>([])
    useEffect(() => {
        setUpcomingBreaks(getFutureBreaks(props.breaks))
    }, [props.breaks])
    return (
        <div>
            <BreaksHeader title={"Upcoming breaks"} />
            {upcomingBreaks.map((b, i) => (
                <Card
                    content={(setCardLoading) => (
                        <UpcomingBreakCard
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
