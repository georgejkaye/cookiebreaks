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
    const onClickCloseText = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        discardContentText()
    }
    const onClickConfirmText = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        submitContentText()
    }
    return (
        <div className="flex-1 flex flex-row h-10 items-center">
            <SmallIcon
                icon="cross"
                styles=""
                title="Close"
                alt="cross"
                onClick={onClickCloseText}
            />
            <BreakContentInput
                contentRef={contentTextRef}
                user={props.user}
                cb={props.cb}
                setEditingText={props.setEditingText}
                setCardLoading={props.setCardLoading}
                updateBreaks={props.updateBreaks}
                submitContentText={submitContentText}
                discardContentText={discardContentText}
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
    let breakContentStyle =
        "w-full m-2 h-8 flex flex-row justify-center items-center"
    return (
        <div className={breakContentStyle}>
            {!editingText ? (
                <span
                    className={`p-2 ${clickableStyle} ${contentTextStyle}`}
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
        "w-full tablet:w-2/3 my-2 desktop:mx-0 text-center font-bold"
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
        "flex flex-col tablet:flex-row justify-center " +
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
    let adminIconsStyle =
        "my-2 desktop:my-0 desktop:w-1/4 flex flex-row flex-end"
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
}) => {
    let cardColour = props.cb.holiday ? "bg-gray-300" : "bg-white"
    let cardStyle =
        `flex w-3/4 desktop:w-content flex-col desktop:flex-row ` +
        `tablet:w-tabletContent border-4 m-5 p-1 px-2 mx-auto align-center ` +
        `items-center ${cardColour}`

    const [contentLoading, setCardLoading] = useState(false)
    return (
        <div className={cardStyle}>
            {contentLoading ? (
                <Loader size={8} />
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
    const breakList = props.reverseBreaks
        ? props.breaks.reverse()
        : props.breaks
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
                breakList.map((cb) => (
                    <BreakCard
                        user={props.user}
                        key={`${cb.id}`}
                        cb={cb}
                        updateBreaks={props.updateBreaks}
                    />
                ))
            )}
        </>
    )
}
