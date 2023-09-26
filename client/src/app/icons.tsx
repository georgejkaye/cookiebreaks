import Image from "next/image"
import {
    CookieBreak,
    UpdateBreaksFn,
    User,
    breakInPast,
    dateInPast,
    getDatetimeText,
} from "./structs"
import { Dispatch, SetStateAction } from "react"
import { setHoliday, deleteBreak, announceBreak, reimburseBreak } from "./api"
import { SetStateBoolean } from "./breaks"

export const SmallIcon = (props: {
    icon: string
    styles?: string
    title: string
    alt: string
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
    hoverColour?: string
}) => {
    let hoverColour = props.hoverColour ? props.hoverColour : ""
    let style = `${props.styles} ${
        props.onClick ? `cursor-pointer rounded-full ${hoverColour}` : ""
    }`
    return (
        <Image
            className={style}
            width={30}
            height={30}
            src={`/images/icons/${props.icon}.svg`}
            alt={props.title}
            onClick={props.onClick}
            title={props.title}
        />
    )
}

export const BreakIcon = (props: {
    icon: string
    doneText: string
    waitingText: string
    datetime?: Date
    clickable?: boolean
    onClick?: () => any
    hoverColour?: string
}) => {
    let titleText = !props.datetime
        ? props.waitingText
        : `${props.doneText} on ${getDatetimeText(props.datetime)}`
    let opacity =
        props.datetime && dateInPast(props.datetime)
            ? "opacity-100"
            : "opacity-25"
    let style = `my-2 desktop:m-0 ${opacity}`
    return (
        <SmallIcon
            styles={style}
            onClick={
                props.onClick && props.clickable ? props.onClick : undefined
            }
            hoverColour={props.hoverColour}
            icon={props.icon}
            title={titleText}
            alt={titleText}
        />
    )
}

export const BreakControlIcons = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setCardLoading: SetStateBoolean
}) => {
    let hoverColour = getHoverColour(props.cb)
    const onClickHoliday = (e: React.MouseEvent<HTMLDivElement>) => {
        if (props.user) {
            let reason = props.cb.holiday ? undefined : "Holiday"
            setHoliday(
                props.user,
                props.cb.id,
                reason,
                props.updateBreaks,
                props.setCardLoading
            )
        }
    }
    const onClickDelete = (e: React.MouseEvent<HTMLDivElement>) => {
        if (props.user) {
            deleteBreak(
                props.user,
                props.cb,
                props.updateBreaks,
                props.setCardLoading
            )
        }
    }
    return (
        <div className="flex flex-row desktop:ml-auto w-16 desktop:justify-end">
            {dateInPast(props.cb.datetime) ? (
                ""
            ) : (
                <SmallIcon
                    icon={props.cb.holiday ? "landing" : "takeoff"}
                    title={props.cb.holiday ? "Unset holiday" : "Set holiday"}
                    alt="Beach umbrella"
                    onClick={onClickHoliday}
                    hoverColour={hoverColour}
                />
            )}
            <SmallIcon
                styles="ml-auto"
                icon="bin"
                title="Delete break"
                alt="Bin"
                onClick={onClickDelete}
                hoverColour={hoverColour}
            />
        </div>
    )
}

export const getHoverColour = (cb: CookieBreak) =>
    cb.holiday ? "hover:bg-gray-500/50" : "hover:bg-gray-400/50"

const AnnounceIcon = (props: {
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    user: User | undefined
    setCardLoading: Dispatch<SetStateAction<boolean>>
}) => {
    const onClickAnnounce = () => {
        props.user
            ? announceBreak(
                  props.user,
                  props.cb.id,
                  props.updateBreaks,
                  props.setCardLoading
              )
            : undefined
    }
    return (
        <BreakIcon
            icon="announce"
            doneText="Announced"
            waitingText="Not announced yet"
            datetime={props.cb.announced}
            clickable={props.cb.announced === undefined}
            onClick={onClickAnnounce}
            hoverColour={getHoverColour(props.cb)}
        />
    )
}

const HeldIcon = (props: { cb: CookieBreak }) => (
    <BreakIcon
        icon="cookie"
        doneText="Break held"
        waitingText="Break not held yet"
        datetime={breakInPast(props.cb) ? props.cb.datetime : undefined}
    />
)

const ReimburseIcon = (props: {
    cb: CookieBreak
    user: User | undefined
    updateBreaks: UpdateBreaksFn
    setCardLoading: Dispatch<SetStateAction<boolean>>
}) => {
    const onClickReimburse = () => {
        let cost = prompt("Break cost?")
        if (!cost) {
            alert("Invalid cost!")
        } else {
            let costFloat = parseFloat(cost)
            if (isNaN(costFloat)) {
                alert("Invalid cost!")
            } else {
                props.user
                    ? reimburseBreak(
                          props.user,
                          props.cb.id,
                          costFloat,
                          props.updateBreaks,
                          props.setCardLoading
                      )
                    : undefined
            }
        }
    }
    return (
        <BreakIcon
            icon="reimburse"
            doneText={`Reimbursed host £${
                props.cb.cost
                    ? ((props.cb.cost * 100) / 100).toFixed(2)
                    : "0.00"
            }`}
            waitingText="Host not reimbursed yet"
            datetime={props.cb.reimbursed}
            clickable={props.cb.reimbursed === undefined}
            onClick={onClickReimburse}
            hoverColour={getHoverColour(props.cb)}
        />
    )
}

const ClaimIcon = (props: { cb: CookieBreak }) => {
    return (
        <BreakIcon
            icon="claim"
            doneText="Claimed"
            waitingText="Not claimed yet"
            datetime={props.cb.claimed}
        />
    )
}

const SuccessIcon = (props: { cb: CookieBreak }) => {
    return (
        <BreakIcon
            icon="success"
            doneText="Admin reimbursed"
            waitingText="Admin not reimbursed yet"
            datetime={props.cb.success}
        />
    )
}

export const BreakStatusIcons = (props: {
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    user: User | undefined
    setCardLoading: Dispatch<SetStateAction<boolean>>
}) => {
    let iconBoxStyle = `flex ${!props.cb.holiday ? "mr-4 desktop:mr-auto" : ""}`
    return (
        <div className={iconBoxStyle}>
            {props.cb.holiday || !props.user?.admin ? (
                ""
            ) : (
                <>
                    <AnnounceIcon
                        cb={props.cb}
                        updateBreaks={props.updateBreaks}
                        user={props.user}
                        setCardLoading={props.setCardLoading}
                    />
                    <HeldIcon cb={props.cb} />
                    <ReimburseIcon
                        cb={props.cb}
                        updateBreaks={props.updateBreaks}
                        user={props.user}
                        setCardLoading={props.setCardLoading}
                    />
                    <ClaimIcon cb={props.cb} />
                    <SuccessIcon cb={props.cb} />
                </>
            )}
        </div>
    )
}
