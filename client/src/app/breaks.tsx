import React, { useRef, useState } from "react"
import { setHoliday, setHost } from "./api"
import {
    User,
    CookieBreak,
    getCookieBreakDate,
    getCookieBreakTime,
    breakInPast,
    UpdateBreaksFn,
} from "./structs"
import {
    BreakControlIcons,
    BreakStatusIcons,
    SmallIcon,
    getHoverColour,
} from "./icons"
import { CardAction, CardSelector, Cards, CardsActionProps } from "./cards"

export type SetState<T> = React.Dispatch<React.SetStateAction<T>>

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
                props.cb.id,
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

const BreakDetails = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setCardLoading: (loading: boolean) => void
}) => {
    let detailsStyle =
        "flex flex-col justify-around tablet:flex-row " +
        "items-center flex-1 w-full desktop:w-2/3"
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

const AdminIcons = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setCardLoading: (loading: boolean) => void
}) => {
    let adminIconsStyle =
        "h-12 desktop:my-0 w-full justify-center items-center desktop:w-1/4 flex flex-row desktop:flex-end"
    return (
        <div className={adminIconsStyle}>
            <BreakStatusIcons
                cb={props.cb}
                updateBreaks={props.updateBreaks}
                user={props.user}
                setCardLoading={props.setCardLoading}
            />
            <BreakControlIcons
                cb={props.cb}
                updateBreaks={props.updateBreaks}
                user={props.user}
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

export const BreakCards = (props: {
    title: string
    user: User | undefined
    breaks: CookieBreak[]
    updateBreaks: UpdateBreaksFn
    isLoadingBreaks: boolean
    reverseBreaks: boolean
    buttons?: CardSelector<CookieBreak>[]
}) => {
    const getCardColour = (cb: CookieBreak) =>
        cb.holiday ? "bg-gray-200" : "bg-white"
    const getSelectedColour = (cb: CookieBreak) => "bg-gray-100"
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
            buttons={props.buttons}
        />
    )
}
