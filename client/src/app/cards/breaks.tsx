import React, { useEffect, useRef, useState } from "react"
import {
    announceBreak,
    deleteBreak,
    setHoliday,
    setHost,
    submitClaim,
} from "../api"
import {
    User,
    CookieBreak,
    getCookieBreakDate,
    getCookieBreakTime,
    breakInPast,
    UpdateBreaksFn,
    getBreaksToClaim,
    Claim,
    UpdateClaimsFn,
    formatAsPrice,
    getDatetimeText,
    getShortDate,
    isReimbursable,
} from "../structs"
import { BreakStatusIcons, SmallIcon } from "../icons"
import {
    ActionButton,
    CardAction,
    CardSelector,
    Cards,
    CardsActionProps,
    ExpandableCardProps,
    ExpandableCardsProps,
    SelectableCardsProps,
    SmallInfoCard,
} from "./cards"
import { ClaimBreakCost } from "./claimed"
import { SetState } from "../page"

export const TickCrossInputBox = (props: {
    onClickClose: (text: string) => void
    onClickConfirm: (text: string) => void
    divStyle: string
    inputStyle: string
    placeholder: string
    size: number
}) => {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const closeText = () => {
        if (inputRef.current) {
            props.onClickClose(inputRef.current.value)
        }
    }
    const confirmText = () => {
        if (inputRef.current) {
            props.onClickConfirm(inputRef.current.value)
        }
    }
    const onClickCloseText = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        closeText()
    }
    const onClickConfirmText = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        confirmText()
    }
    const onKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            confirmText()
        } else if (e.key === "Escape") {
            closeText()
        }
    }
    const divStyle = `flex-1 flex flex-row items-center ${props.divStyle}`
    const inputStyle = `flex-1 text-center m-2 py-2 ${props.inputStyle}`
    return (
        <div className={divStyle}>
            <SmallIcon
                width={30}
                icon="cross"
                styles=""
                title="Close"
                alt="cross"
                onClick={onClickCloseText}
            />
            <input
                ref={inputRef}
                className={inputStyle}
                autoFocus
                type="text"
                placeholder={props.placeholder}
                onKeyDown={onKeyDownInput}
                size={props.size}
            />
            <SmallIcon
                width={30}
                icon="tick"
                styles=""
                title="Confirm"
                alt="tick"
                onClick={onClickConfirmText}
            />
        </div>
    )
}

const BreakContentEditor = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setEditingText: SetState<boolean>
    setCardLoading: (loading: boolean) => void
}) => {
    const discardContentText = () => {
        props.setEditingText(false)
    }
    const submitContentText = (text: string) => {
        if (props.user) {
            let request = props.cb.holiday ? setHoliday : setHost
            let currentValue =
                props.cb.holiday && text === "" ? "Holiday" : text
            request(
                props.user,
                props.cb,
                currentValue,
                props.updateBreaks,
                props.setCardLoading
            )
        }
        props.setEditingText(false)
    }
    return (
        <TickCrossInputBox
            onClickClose={discardContentText}
            onClickConfirm={submitContentText}
            divStyle="h=10"
            inputStyle="text-sm"
            placeholder={props.cb.holiday ? "Holiday" : "Host required"}
            size={16}
        />
    )
}

const BreakContent = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setCardLoading: (loading: boolean) => void
}) => {
    const [editingText, setEditingText] = useState(false)
    let isHoliday = props.cb.holiday
    let hasHost = props.cb.host
    let isAdmin = props.user?.admin
    let contentTextStyle =
        isHoliday || !hasHost ? "text-sm" : editingText ? "" : "font-bold"
    let clickable = isAdmin && !breakInPast(props.cb)
    let hoverColour = getHoverColour(props.cb)
    let clickableStyle = clickable
        ? `cursor-pointer ${hoverColour} rounded-md`
        : ""
    let contentText = isHoliday
        ? props.cb.holiday
        : !hasHost
        ? breakInPast(props.cb)
            ? "Host reimbursed"
            : "Host required"
        : props.cb.host
    const onClickText = (e: React.MouseEvent<HTMLDivElement>) => {
        if (clickable) {
            setEditingText(true)
        }
    }
    let breakContentStyle =
        "w-full flex flex-row justify-center items-center mx-4"
    return (
        <div className={breakContentStyle}>
            {!editingText ? (
                <span
                    className={`p-2 m-1 ${clickableStyle} ${contentTextStyle}`}
                    onClick={onClickText}
                >
                    {contentText}
                </span>
            ) : (
                <BreakContentEditor
                    cb={props.cb}
                    user={props.user}
                    updateBreaks={props.updateBreaks}
                    setCardLoading={props.setCardLoading}
                    setEditingText={setEditingText}
                />
            )}
        </div>
    )
}

const BreakDate = (props: { cb: CookieBreak }) => {
    let dateStyle = "w-full desktop:my-2 text-center font-bold"
    return (
        <div className={dateStyle}>
            {getCookieBreakDate(props.cb)}, {getCookieBreakTime(props.cb)}
        </div>
    )
}

export const BreakDetails = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setCardLoading: (loading: boolean) => void
}) => {
    let detailsStyle =
        "flex flex-col justify-around tablet:flex-row items-center flex-1"
    return (
        <div className={detailsStyle}>
            <BreakDate cb={props.cb} />
            <BreakContent
                user={props.user}
                cb={props.cb}
                setCardLoading={props.setCardLoading}
                updateBreaks={props.updateBreaks}
            />
        </div>
    )
}

const AnnounceBreakButton = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setCardLoading: (loading: boolean) => void
}) => {
    const onClickAnnounce = (e: React.MouseEvent<HTMLButtonElement>) => {
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
        <ActionButton
            style="mx-1"
            hoverColour={getHoverColour(props.cb)}
            onClick={onClickAnnounce}
            icon="announce"
            alt="Loudspeaker"
            title="Announce this cookie break"
        />
    )
}
export const HolidayBreakButton = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setCardLoading: (loading: boolean) => void
}) => {
    const onClickHoliday = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (props.user) {
            setHoliday(
                props.user,
                props.cb,
                props.cb.holiday ? undefined : "Holiday",
                props.updateBreaks,
                props.setCardLoading
            )
        }
    }
    return (
        <ActionButton
            style="mx-1"
            icon={props.cb.holiday ? "landing" : "takeoff"}
            title={props.cb.holiday ? "Unset holiday" : "Set holiday"}
            alt={props.cb.holiday ? "Plane landing" : "Plane taking off"}
            onClick={onClickHoliday}
            hoverColour={getHoverColour(props.cb)}
        />
    )
}
export const ReimburseBreakButton = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setCardLoading: (loading: boolean) => void
}) => {
    const onClickReimburse = (e: React.MouseEvent<HTMLButtonElement>) => {}
    return (
        <ActionButton
            style="mx-1"
            icon={"reimburse"}
            title={"Reimburse"}
            alt={"Coin"}
            onClick={onClickReimburse}
            hoverColour={getHoverColour(props.cb)}
        />
    )
}
export const DeleteBreakButton = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setCardLoading: (loading: boolean) => void
}) => {
    const onClickDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
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
        <ActionButton
            style="mx-1"
            icon="bin"
            title="Delete break"
            alt="Bin"
            onClick={onClickDelete}
            hoverColour={getHoverColour(props.cb)}
        />
    )
}

const AdminIcons = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setCardLoading: (loading: boolean) => void
}) => {
    let adminIconsStyle =
        "h-12 desktop:my-0 w-full justify-center desktop:justify-end items-center desktop:w-1/4 flex flex-row desktop:flex-end"

    return (
        <div className={adminIconsStyle}>
            {breakInPast(props.cb) || props.cb.announced ? (
                ""
            ) : (
                <AnnounceBreakButton
                    user={props.user}
                    cb={props.cb}
                    updateBreaks={props.updateBreaks}
                    setCardLoading={props.setCardLoading}
                />
            )}
            {!isReimbursable(props.cb, false) ? (
                ""
            ) : (
                <ReimburseBreakButton
                    user={props.user}
                    cb={props.cb}
                    updateBreaks={props.updateBreaks}
                    setCardLoading={props.setCardLoading}
                />
            )}
            {breakInPast(props.cb) ? (
                ""
            ) : (
                <HolidayBreakButton
                    user={props.user}
                    cb={props.cb}
                    updateBreaks={props.updateBreaks}
                    setCardLoading={props.setCardLoading}
                />
            )}
            <DeleteBreakButton
                user={props.user}
                cb={props.cb}
                updateBreaks={props.updateBreaks}
                setCardLoading={props.setCardLoading}
            />
        </div>
    )
}

const BreakCard = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setLoading: (loading: boolean) => void
}) => (
    <>
        <BreakDetails
            cb={props.cb}
            user={props.user}
            setCardLoading={props.setLoading}
            updateBreaks={props.updateBreaks}
        />
        {!props.user?.admin ? (
            ""
        ) : (
            <AdminIcons
                cb={props.cb}
                user={props.user}
                setCardLoading={props.setLoading}
                updateBreaks={props.updateBreaks}
            />
        )}
    </>
)

export const getCardColour = (cb: CookieBreak) =>
    cb.holiday ? "bg-gray-200" : "bg-white"
export const getSelectedColour = (_: CookieBreak) => "bg-gray-100"
const getHoverColour = (_: CookieBreak) => "hover:bg-gray-400"

export const BreakCards = (props: {
    title: string
    user: User | undefined
    breaks: CookieBreak[]
    updateBreaks: UpdateBreaksFn
    isLoadingBreaks: boolean
    reverseBreaks: boolean
    buttons?: CardSelector<CookieBreak>[]
}) => {
    const getCardContent = (
        cb: CookieBreak,
        setLoading: (loading: boolean) => void
    ) => (
        <BreakCard
            user={props.user}
            cb={cb}
            updateBreaks={props.updateBreaks}
            setLoading={setLoading}
        />
    )
    let cardsActionProps: CardsActionProps<CookieBreak> =
        props.buttons && props.buttons.length > 0
            ? {
                  type: CardAction.SELECT,
                  buttons: props.buttons,
                  getSelectedColour: getSelectedColour,
                  getHoverColour: getHoverColour,
              }
            : {
                  type: CardAction.NONE,
              }
    return (
        <Cards<CookieBreak>
            title={props.title}
            cardsAction={cardsActionProps}
            isLoading={props.isLoadingBreaks}
            elements={props.breaks}
            getCardColour={getCardColour}
            getCardContent={getCardContent}
        />
    )
}

const BreakReimbursedDate = (props: { cb: CookieBreak }) => {
    const content = (
        <span className="mr-6">
            {!props.cb.reimbursed ? "" : getShortDate(props.cb.reimbursed)}
        </span>
    )
    return (
        <SmallInfoCard
            width="w-7/12"
            icon="reimburse"
            alt="Coin"
            content={content}
        />
    )
}
