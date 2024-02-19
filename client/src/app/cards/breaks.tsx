import React, { useEffect, useRef, useState } from "react"
import { setHoliday, setHost, submitClaim } from "../api"
import {
    User,
    CookieBreak,
    getCookieBreakDate,
    getCookieBreakTime,
    breakInPast,
    UpdateFn,
    getBreaksToClaim,
    Claim,
    formatAsPrice,
    getDatetimeText,
    getShortDate,
} from "../structs"
import {
    BreakControlIcons,
    BreakStatusIcons,
    DeleteBreakIcon,
    SmallIcon,
} from "../icons"
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
    cookieBreak: CookieBreak
    updateBreaks: UpdateFn<CookieBreak>
    setEditingText: SetState<boolean>
    setCardLoading: SetState<boolean>
}) => {
    const discardContentText = () => {
        props.setEditingText(false)
    }
    const submitContentText = (text: string) => {
        if (props.user) {
            let request = props.cookieBreak.holiday ? setHoliday : setHost
            let currentValue =
                props.cookieBreak.holiday && text === "" ? "Holiday" : text
            request(
                props.user,
                props.cookieBreak,
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
            placeholder={
                props.cookieBreak.holiday ? "Holiday" : "Host required"
            }
            size={16}
        />
    )
}

const BreakContent = (props: {
    user: User | undefined
    cookieBreak: CookieBreak
    updateBreaks: UpdateFn<CookieBreak>
    setCardLoading: SetState<boolean>
}) => {
    let isHoliday = props.cookieBreak.holiday
    let hasHost = props.cookieBreak.host
    let contentTextStyle = isHoliday || !hasHost ? "text-sm" : "font-bold"
    let contentText = isHoliday
        ? props.cookieBreak.holiday
        : !hasHost
        ? breakInPast(props.cookieBreak)
            ? "Host reimbursed"
            : "Host required"
        : props.cookieBreak.host
    let breakContentStyle = "flex flex-row desktop:mx-4 mb-2 desktop:my-0"
    return <div className={breakContentStyle}>{contentText}</div>
}

export const BreakDate = (props: { cookieBreak: CookieBreak }) => {
    let dateStyle = "w-full desktop:w-1/2 my-2 font-bold"
    return (
        <div className={dateStyle}>
            {getCookieBreakDate(props.cookieBreak)},{" "}
            {getCookieBreakTime(props.cookieBreak)}
        </div>
    )
}

export const BreakDetails = (props: {
    user: User | undefined
    cookieBreak: CookieBreak
    updateBreaks: UpdateFn<CookieBreak>
    setCardLoading: SetState<boolean>
}) => {
    let detailsStyle = "flex flex-col desktop:flex-row flex-1"
    return (
        <div className={detailsStyle}>
            <BreakDate cookieBreak={props.cookieBreak} />
            <BreakContent
                user={props.user}
                cookieBreak={props.cookieBreak}
                setCardLoading={props.setCardLoading}
                updateBreaks={props.updateBreaks}
            />
        </div>
    )
}

const AdminIcons = (props: {
    user: User | undefined
    cookieBreak: CookieBreak
    updateBreaks: UpdateFn<CookieBreak>
    setCardLoading: SetState<boolean>
}) => {
    let adminIconsStyle =
        "h-12 desktop:my-0 w-full desktop:w-1/4 flex flex-row desktop:flex-end"
    return (
        <div className={adminIconsStyle}>
            <BreakStatusIcons
                cookieBreak={props.cookieBreak}
                updateBreaks={props.updateBreaks}
                user={props.user}
                setCardLoading={props.setCardLoading}
            />
            <BreakControlIcons
                cookieBreak={props.cookieBreak}
                updateBreaks={props.updateBreaks}
                user={props.user}
                setCardLoading={props.setCardLoading}
            />
        </div>
    )
}

const BreakCard = (props: {
    user: User | undefined
    cookieBreak: CookieBreak
    updateBreaks: UpdateFn<CookieBreak>
    setLoading: SetState<boolean>
}) => (
    <>
        <BreakDetails
            cookieBreak={props.cookieBreak}
            user={props.user}
            setCardLoading={props.setLoading}
            updateBreaks={props.updateBreaks}
        />
        {!props.user?.admin ? (
            ""
        ) : (
            <AdminIcons
                cookieBreak={props.cookieBreak}
                user={props.user}
                setCardLoading={props.setLoading}
                updateBreaks={props.updateBreaks}
            />
        )}
    </>
)

export const getCardColour = (cookieBreak: CookieBreak) =>
    cookieBreak.holiday ? "bg-gray-200" : "bg-white"
export const getSelectedColour = (_: CookieBreak) => "bg-gray-100"
const getHoverColour = (_: CookieBreak) => "hover:bg-gray-50"
