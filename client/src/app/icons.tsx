import Image from "next/image"
import {
    CookieBreak,
    UpdateBreaksFn,
    User,
    breakInPast,
    dateInPast,
    getDatetimeText,
} from "./structs"
import { Dispatch, SetStateAction, useRef, useState } from "react"
import { setHoliday, deleteBreak, announceBreak, reimburseBreak } from "./api"
import { TickCrossInputBox } from "./cards/breaks"
import { SetState } from "./page"

export const SmallIcon = (props: {
    icon: string
    width: number
    styles?: string
    title?: string
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
            width={props.width}
            height={props.width}
            src={`/images/icons/${props.icon}.svg`}
            alt={props.alt}
            onClick={props.onClick}
            title={!props.title ? "" : props.title}
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
    let style = `desktop:m-0 ${opacity}`
    return (
        <SmallIcon
            width={30}
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

export const getHoverColour = (cb: CookieBreak) =>
    cb.holiday ? "hover:bg-gray-500/50" : "hover:bg-gray-100"

export const HolidayBreakIcon = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setCardLoading: (loading: boolean) => void
}) => {
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
        <SmallIcon
            icon={props.cb.holiday ? "landing" : "takeoff"}
            title={props.cb.holiday ? "Unset holiday" : "Set holiday"}
            alt={props.cb.holiday ? "Plane landing" : "Plane taking off"}
            onClick={onClickDelete}
            hoverColour={getHoverColour(props.cb)}
        />
    )
}

export const DeleteBreakIcon = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setCardLoading: (loading: boolean) => void
}) => {
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
        <SmallIcon
            icon="bin"
            title="Delete break"
            alt="Bin"
            onClick={onClickDelete}
            hoverColour={getHoverColour(props.cb)}
        />
    )
}

export const BreakControlIcons = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setCardLoading: (loading: boolean) => void
}) => {
    let breakControlStyle =
        "flex flex-row w-16 desktop:justify-end justify-center"
    return (
        <div className={breakControlStyle}>
            {dateInPast(props.cb.datetime) ? (
                ""
            ) : (
                <HolidayBreakIcon
                    user={props.user}
                    cb={props.cb}
                    updateBreaks={props.updateBreaks}
                    setCardLoading={props.setCardLoading}
                />
            )}
            <DeleteBreakIcon
                user={props.user}
                cb={props.cb}
                updateBreaks={props.updateBreaks}
                setCardLoading={props.setCardLoading}
            />
        </div>
    )
}

const AnnounceIcon = (props: {
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    user: User | undefined
    setCardLoading: (loading: boolean) => void
}) => {
    const onClickAnnounce = () => {
        props.user
            ? announceBreak(
                  props.user,
                  props.cb,
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
    setCardLoading: (loading: boolean) => void
    setReimbursing: () => void
}) => {
    const onClickReimburse = () => {
        props.setReimbursing()
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

const ReimburseHostBox = (props: {
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    user: User | undefined
    setCardLoading: (loading: boolean) => void
    setMode: SetState<StatusIconsMode>
}) => {
    const onClickConfirmReimburse = (text: string) => {
        if (props.user) {
            let amount = parseFloat(text)
            reimburseBreak(
                props.user,
                props.cb.id,
                amount,
                props.updateBreaks,
                props.setCardLoading
            )
        }
        props.setMode(StatusIconsMode.Normal)
    }
    const onClickCloseReimburse = (text: string) => {
        props.setMode(StatusIconsMode.Normal)
    }
    return (
        <TickCrossInputBox
            onClickClose={onClickCloseReimburse}
            onClickConfirm={onClickConfirmReimburse}
            divStyle=""
            inputStyle="text-sm h-5"
            placeholder={"Cost"}
            size={7}
        />
    )
}

enum StatusIconsMode {
    Normal,
    Reimburse,
}

export const BreakStatusIcons = (props: {
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    user: User | undefined
    setCardLoading: (loading: boolean) => void
}) => {
    let iconBoxStyle = `flex mr-4 desktop:w-40 h-10 justify-center`
    const [mode, setMode] = useState(StatusIconsMode.Normal)
    return (
        <div className={iconBoxStyle}>
            {props.cb.holiday || !props.user?.admin ? (
                ""
            ) : mode === StatusIconsMode.Normal ? (
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
                        setReimbursing={() =>
                            setMode(StatusIconsMode.Reimburse)
                        }
                    />
                    <ClaimIcon cb={props.cb} />
                    <SuccessIcon cb={props.cb} />
                </>
            ) : (
                <ReimburseHostBox
                    user={props.user}
                    cb={props.cb}
                    setMode={setMode}
                    setCardLoading={props.setCardLoading}
                    updateBreaks={props.updateBreaks}
                />
            )}
        </div>
    )
}
