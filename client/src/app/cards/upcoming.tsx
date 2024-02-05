import { useState, useEffect } from "react"
import { announceBreak, submitClaim } from "../api"
import { getSelectedColour, getCardColour, BreakDetails } from "./breaks"
import { ActionButton } from "./cards"
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

const UpcomingBreakButtons = (props: {
    index: number
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setLoadingCard: SetState<boolean>
}) => (
    <div className="w-36 flex justify-end">
        {props.index > 0 ? (
            ""
        ) : (
            <AnnounceButton
                user={props.user}
                cb={props.cb}
                updateBreaks={props.updateBreaks}
                setLoading={props.setLoadingCard}
            />
        )}
        <HolidayButton
            user={props.user}
            cb={props.cb}
            updateBreaks={props.updateBreaks}
            holidayText={""}
            setLoading={props.setLoadingCard}
        />
        <DeleteButton
            user={props.user}
            cb={props.cb}
            updateBreaks={props.updateBreaks}
            setLoading={props.setLoadingCard}
        />
    </div>
)

export const UpcomingBreakCard = (props: {
    index: number
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
}) => {
    const [isLoadingCard, setLoadingCard] = useState(false)
    return (
        <div className="flex align-stretch flex-col justify-evenly items-center desktop:flex-row">
            <BreakDetails
                cb={props.cb}
                user={props.user}
                setCardLoading={setLoadingCard}
                updateBreaks={props.updateBreaks}
            />
            {!props.user?.admin ? (
                ""
            ) : (
                <UpcomingBreakButtons
                    user={props.user}
                    index={props.index}
                    cb={props.cb}
                    setLoadingCard={setLoadingCard}
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
            {upcomingBreaks.map((b, i) => (
                <UpcomingBreakCard
                    index={i}
                    key={i}
                    user={props.user}
                    cb={b}
                    updateBreaks={props.updateBreaks}
                />
            ))}
        </div>
    )
}
