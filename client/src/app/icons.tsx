import Image from "next/image"
import {
    CookieBreak,
    UpdateFn,
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
            width={30}
            height={30}
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

export const getHoverColour = (cookieBreak: CookieBreak) =>
    cookieBreak.holiday ? "hover:bg-gray-500/50" : "hover:bg-gray-100"

export const HolidayBreakIcon = (props: {
    user: User | undefined
    cookieBreak: CookieBreak
    updateBreaks: UpdateFn<CookieBreak>
    setCardLoading: SetState<boolean>
}) => {
    const onClickDelete = (e: React.MouseEvent<HTMLDivElement>) => {
        if (props.user) {
            deleteBreak(
                props.user,
                props.cookieBreak,
                props.updateBreaks,
                props.setCardLoading
            )
        }
    }
    return (
        <SmallIcon
            icon={props.cookieBreak.holiday ? "landing" : "takeoff"}
            title={props.cookieBreak.holiday ? "Unset holiday" : "Set holiday"}
            alt={
                props.cookieBreak.holiday ? "Plane landing" : "Plane taking off"
            }
            onClick={onClickDelete}
            hoverColour={getHoverColour(props.cookieBreak)}
        />
    )
}

export const DeleteBreakIcon = (props: {
    user: User | undefined
    cookieBreak: CookieBreak
    updateBreaks: UpdateFn<CookieBreak>
    setCardLoading: SetState<boolean>
}) => {
    const onClickDelete = (e: React.MouseEvent<HTMLDivElement>) => {
        if (props.user) {
            deleteBreak(
                props.user,
                props.cookieBreak,
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
            hoverColour={getHoverColour(props.cookieBreak)}
        />
    )
}

export const BreakControlIcons = (props: {
    user: User | undefined
    cookieBreak: CookieBreak
    updateBreaks: UpdateFn<CookieBreak>
    setCardLoading: SetState<boolean>
}) => {
    let breakControlStyle =
        "flex flex-row w-16 desktop:justify-end justify-center"
    return (
        <div className={breakControlStyle}>
            {dateInPast(props.cookieBreak.datetime) ? (
                ""
            ) : (
                <HolidayBreakIcon
                    user={props.user}
                    cookieBreak={props.cookieBreak}
                    updateBreaks={props.updateBreaks}
                    setCardLoading={props.setCardLoading}
                />
            )}
            <DeleteBreakIcon
                user={props.user}
                cookieBreak={props.cookieBreak}
                updateBreaks={props.updateBreaks}
                setCardLoading={props.setCardLoading}
            />
        </div>
    )
}

const AnnounceIcon = (props: {
    cookieBreak: CookieBreak
    updateBreaks: UpdateFn<CookieBreak>
    user: User | undefined
    setCardLoading: SetState<boolean>
}) => {
    const onClickAnnounce = () => {
        props.user
            ? announceBreak(
                  props.user,
                  props.cookieBreak,
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
            datetime={props.cookieBreak.announced}
            clickable={props.cookieBreak.announced === undefined}
            onClick={onClickAnnounce}
            hoverColour={getHoverColour(props.cookieBreak)}
        />
    )
}

const HeldIcon = (props: { cookieBreak: CookieBreak }) => (
    <BreakIcon
        icon="cookie"
        doneText="Break held"
        waitingText="Break not held yet"
        datetime={
            breakInPast(props.cookieBreak)
                ? props.cookieBreak.datetime
                : undefined
        }
    />
)

const ReimburseIcon = (props: {
    cookieBreak: CookieBreak
    user: User | undefined
    updateBreaks: UpdateFn<CookieBreak>
    setCardLoading: SetState<boolean>
    setReimbursing: () => void
}) => {
    const onClickReimburse = () => {
        props.setReimbursing()
    }
    return (
        <BreakIcon
            icon="reimburse"
            doneText={`Reimbursed host £${
                props.cookieBreak.cost
                    ? ((props.cookieBreak.cost * 100) / 100).toFixed(2)
                    : "0.00"
            }`}
            waitingText="Host not reimbursed yet"
            datetime={props.cookieBreak.reimbursed}
            clickable={props.cookieBreak.reimbursed === undefined}
            onClick={onClickReimburse}
            hoverColour={getHoverColour(props.cookieBreak)}
        />
    )
}

const ClaimIcon = (props: { cookieBreak: CookieBreak }) => {
    return (
        <BreakIcon
            icon="claim"
            doneText="Claimed"
            waitingText="Not claimed yet"
            datetime={props.cookieBreak.claimed}
        />
    )
}

const SuccessIcon = (props: { cookieBreak: CookieBreak }) => {
    return (
        <BreakIcon
            icon="success"
            doneText="Admin reimbursed"
            waitingText="Admin not reimbursed yet"
            datetime={props.cookieBreak.success}
        />
    )
}

const ReimburseHostBox = (props: {
    cookieBreak: CookieBreak
    updateBreaks: UpdateFn<CookieBreak>
    user: User | undefined
    setCardLoading: SetState<boolean>
    setMode: SetState<StatusIconsMode>
}) => {
    const onClickConfirmReimburse = (text: string) => {
        if (props.user) {
            let amount = parseFloat(text)
            reimburseBreak(
                props.user,
                props.cookieBreak,
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
    cookieBreak: CookieBreak
    updateBreaks: UpdateFn<CookieBreak>
    user: User | undefined
    setCardLoading: SetState<boolean>
}) => {
    let iconBoxStyle = `flex mr-4 desktop:w-40 h-10 justify-center`
    const [mode, setMode] = useState(StatusIconsMode.Normal)
    return (
        <div className={iconBoxStyle}>
            {props.cookieBreak.holiday || !props.user?.admin ? (
                ""
            ) : mode === StatusIconsMode.Normal ? (
                <>
                    <AnnounceIcon
                        cookieBreak={props.cookieBreak}
                        updateBreaks={props.updateBreaks}
                        user={props.user}
                        setCardLoading={props.setCardLoading}
                    />
                    <HeldIcon cookieBreak={props.cookieBreak} />
                    <ReimburseIcon
                        cookieBreak={props.cookieBreak}
                        updateBreaks={props.updateBreaks}
                        user={props.user}
                        setCardLoading={props.setCardLoading}
                        setReimbursing={() =>
                            setMode(StatusIconsMode.Reimburse)
                        }
                    />
                    <ClaimIcon cookieBreak={props.cookieBreak} />
                    <SuccessIcon cookieBreak={props.cookieBreak} />
                </>
            ) : (
                <ReimburseHostBox
                    user={props.user}
                    cookieBreak={props.cookieBreak}
                    setMode={setMode}
                    setCardLoading={props.setCardLoading}
                    updateBreaks={props.updateBreaks}
                />
            )}
        </div>
    )
}
