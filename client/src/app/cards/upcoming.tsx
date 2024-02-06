import { useState, useEffect } from "react"
import { BreakDetails } from "./breaks"
import { BreaksHeader, Card, CardButtonProps, CardButtons } from "./cards"
import { User, CookieBreak, UpdateFn, getFutureBreaks } from "../structs"
import { SetState } from "../page"
import { announceBreak, deleteBreak, setHoliday } from "../api"

export const UpcomingBreakCard = (props: {
    index: number
    user: User | undefined
    cookieBreak: CookieBreak
    updateBreaks: UpdateFn<CookieBreak>
    setCardLoading: SetState<boolean>
}) => {
    const buttons: CardButtonProps[] = [
        {
            isVisible: props.index === 0,
            icon: "announce",
            onClick: () =>
                announceBreak(
                    props.user,
                    props.cookieBreak,
                    props.updateBreaks,
                    props.setCardLoading
                ),
        },
        {
            isVisible: true,
            icon: props.cookieBreak.holiday ? "landing" : "takeoff",
            onClick: () =>
                setHoliday(
                    props.user,
                    props.cookieBreak,
                    props.cookieBreak.holiday ? undefined : "Holiday",
                    props.updateBreaks,
                    props.setCardLoading
                ),
        },
        {
            isVisible: true,
            icon: "bin",
            onClick: () =>
                deleteBreak(
                    props.user,
                    props.cookieBreak,
                    props.updateBreaks,
                    props.setCardLoading
                ),
        },
    ]
    return (
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
                <CardButtons width={"w-36"} buttons={buttons} />
            )}
        </div>
    )
}

export const UpcomingBreaksCards = (props: {
    user: User | undefined
    cookieBreaks: CookieBreak[]
    updateBreaks: UpdateFn<CookieBreak>
}) => {
    const [upcomingBreaks, setUpcomingBreaks] = useState<CookieBreak[]>([])
    useEffect(() => {
        setUpcomingBreaks(getFutureBreaks(props.cookieBreaks))
    }, [props.cookieBreaks])
    return (
        <div>
            <BreaksHeader title={"Upcoming breaks"} />
            {upcomingBreaks.map((b, i) => (
                <Card
                    content={(setCardLoading) => (
                        <UpcomingBreakCard
                            index={i}
                            user={props.user}
                            cookieBreak={b}
                            updateBreaks={props.updateBreaks}
                            setCardLoading={setCardLoading}
                        />
                    )}
                />
            ))}
        </div>
    )
}
