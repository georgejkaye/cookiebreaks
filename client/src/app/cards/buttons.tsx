import { announceBreak, deleteBreak, setHoliday } from "../api"
import { SetState } from "../page"
import { User, CookieBreak, UpdateBreaksFn } from "../structs"
import { ActionButton } from "./cards"

const buttonHoverColour = "hover:bg-gray-300"

export const DeleteButton = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setLoading: SetState<boolean>
}) => {
    const onClickDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (props.user) {
            deleteBreak(
                props.user,
                props.cb,
                props.updateBreaks,
                props.setLoading
            )
        }
    }
    return (
        <ActionButton
            icon="bin"
            hoverColour={buttonHoverColour}
            onClick={onClickDelete}
        />
    )
}

export const HolidayButton = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    holidayText: string | undefined
    setLoading: SetState<boolean>
}) => {
    const onClickHoliday = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (props.user) {
            setHoliday(
                props.user,
                props.cb,
                props.cb.holiday ? undefined : "Holiday",
                props.updateBreaks,
                props.setLoading
            )
        }
    }
    const icon = props.cb.holiday ? "landing" : "takeoff"
    return (
        <ActionButton
            icon={icon}
            hoverColour={buttonHoverColour}
            onClick={onClickHoliday}
        />
    )
}

export const AnnounceButton = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setLoading: SetState<boolean>
}) => {
    const onClickAnnounce = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (props.user) {
            announceBreak(
                props.user,
                props.cb,
                props.updateBreaks,
                props.setLoading
            )
        }
    }
    return (
        <ActionButton
            icon="announce"
            hoverColour={buttonHoverColour}
            onClick={onClickAnnounce}
        />
    )
}
