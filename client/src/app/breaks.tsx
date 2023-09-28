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
import Loader from "./loader"
import {
    BreakControlIcons,
    BreakStatusIcons,
    SmallIcon,
    getHoverColour,
} from "./icons"

export type SetStateBoolean = React.Dispatch<React.SetStateAction<boolean>>

export const TickCrossInputBox = (props: {
    onClickClose: () => void
    onClickConfirm: () => void
    divStyle: string
    inputStyle: string
    inputRef: React.MutableRefObject<HTMLInputElement | null>
    placeholder: string
}) => {
    const onClickCloseText = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        props.onClickClose()
    }
    const onClickConfirmText = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        props.onClickConfirm()
    }
    const onKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            props.onClickConfirm()
        } else if (e.key === "Escape") {
            props.onClickClose()
        }
    }
    const divStyle = `flex-1 flex flex-row items-center ${props.divStyle}`
    const inputStyle = `flex-1 text-center mx-2 py-2 ${props.inputStyle}`
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
                ref={props.inputRef}
                className={inputStyle}
                autoFocus
                type="text"
                placeholder={props.placeholder}
                onKeyDown={onKeyDownInput}
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

const BreakContentInput = (props: {
    contentRef: React.MutableRefObject<HTMLInputElement | null>
    user: User | undefined
    cb: CookieBreak
    setEditingText: SetStateBoolean
    setCardLoading: SetStateBoolean
    updateBreaks: UpdateBreaksFn
    submitContentText: () => void
    discardContentText: () => void
}) => {
    let placeholderText = props.cb.holiday ? "Holiday" : "Host required"
    const onKeyDownContentText = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            props.submitContentText()
        } else if (e.key === "Escape") {
            props.discardContentText()
        }
    }
    return (
        <input
            ref={props.contentRef}
            className="flex-1 text-center mx-2 text-sm py-2"
            autoFocus
            type="text"
            placeholder={placeholderText}
            onKeyDown={onKeyDownContentText}
        />
    )
}

const BreakContentEditor = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setEditingText: SetStateBoolean
    setCardLoading: SetStateBoolean
}) => {
    const contentTextRef = useRef<HTMLInputElement | null>(null)
    const discardContentText = () => {
        props.setEditingText(false)
    }
    const submitContentText = () => {
        if (props.user && contentTextRef.current) {
            let request = props.cb.holiday ? setHoliday : setHost
            let currentText = contentTextRef.current.value
            let currentValue =
                props.cb.holiday && currentText === "" ? "Holiday" : currentText
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
            inputRef={contentTextRef}
            placeholder={props.cb.holiday ? "Holiday" : "Host required"}
        />
    )
}

const BreakContent = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setCardLoading: SetStateBoolean
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
    let breakContentStyle = "w-full flex flex-row justify-center items-center"
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
    let dateStyle =
        "w-full tablet:w-2/3 desktop:my-2 desktop:mx-0 text-center font-bold"
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
    setCardLoading: SetStateBoolean
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
    setCardLoading: SetStateBoolean
}) => {
    let adminIconsStyle = "desktop:my-0 desktop:w-1/4 flex flex-row flex-end"
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
    index: number
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
}) => {
    let cardColour = props.cb.holiday ? "bg-gray-200" : "bg-white"
    let cardHeight = props.user?.admin ? "h-36 desktop:h-16" : "desktop:h-16"
    let border = props.index === 0 ? "border-y-2" : "border-b-2"
    let cardStyle =
        `flex w-3/4 desktop:w-content flex-col desktop:flex-row ` +
        `tablet:w-tabletContent py-4 px-2 mx-auto align-center ` +
        `items-center ${cardColour} ${cardHeight} ${border}`
    const [contentLoading, setCardLoading] = useState(false)
    return (
        <div className={cardStyle}>
            {contentLoading ? (
                <Loader size={10} />
            ) : (
                <>
                    <BreakDetails
                        cb={props.cb}
                        user={props.user}
                        setCardLoading={setCardLoading}
                        updateBreaks={props.updateBreaks}
                    />
                    {!props.user?.admin ? (
                        ""
                    ) : (
                        <AdminIcons
                            cb={props.cb}
                            user={props.user}
                            setCardLoading={setCardLoading}
                            updateBreaks={props.updateBreaks}
                        />
                    )}
                </>
            )}
        </div>
    )
}

export const BreakCards = (props: {
    title: string
    user: User | undefined
    breaks: CookieBreak[]
    updateBreaks: UpdateBreaksFn
    isLoadingBreaks: boolean
    reverseBreaks: boolean
}) => {
    return (
        <>
            <div className="text-xl font-bold text-center m-5">
                {props.title}
            </div>
            {props.isLoadingBreaks ? (
                <div className="m-10">
                    <Loader size={10} />
                </div>
            ) : (
                props.breaks.map((cb, i) => (
                    <BreakCard
                        index={i}
                        user={props.user}
                        key={cb.id}
                        cb={cb}
                        updateBreaks={props.updateBreaks}
                    />
                ))
            )}
        </>
    )
}
