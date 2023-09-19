import React, { useRef, useState } from "react"
import { announceBreak, reimburseBreak, setHoliday, setHost } from "./api"
import {
    getDatetimeText,
    User,
    CookieBreak,
    dateInPast,
    getCookieBreakDate,
    getCookieBreakTime,
} from "./structs"
import Image from "next/image"
import Loader from "./loader"

const SmallIcon = (props: {
    icon: string
    styles: string
    title: string
    alt: string
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}) => {
    let style = `${props.styles}  ${
        props.onClick ? " cursor-pointer hover:bg-gray-300 rounded-full" : ""
    }`
    return (
        <Image
            className={style}
            onClick={props.onClick}
            width={30}
            height={30}
            src={`/images/icons/${props.icon}.svg`}
            title={props.title}
            alt={props.title}
        />
    )
}

const BreakIcon = (props: {
    icon: string
    doneText: string
    waitingText: string
    datetime?: Date
    clickable?: boolean
    onClick?: () => any
}) => {
    let titleText = !props.datetime
        ? props.waitingText
        : `${props.doneText} on ${getDatetimeText(props.datetime)}`
    let opacity = !props.datetime ? "25" : "100"
    const onClickIcon = (e: React.MouseEvent<HTMLDivElement>) => {
        if (props.clickable && props.onClick) {
            props.onClick()
        }
    }
    return (
        <SmallIcon
            styles={`my-2 desktop:m-0 opacity-${opacity}`}
            onClick={onClickIcon}
            icon={props.icon}
            title={titleText}
            alt={titleText}
        />
    )
}

const BreakIcons = (props: {
    cb: CookieBreak
    updateBreaks: (breaks: CookieBreak[]) => void
    user: User | undefined
    pastBreak: boolean
}) => {
    const [isLoadingCard, setLoadingCard] = useState(false)
    return (
        <div
            className={`flex ${
                props.user?.admin ? "w-full desktop:w-1/6" : ""
            } items-center justify-center`}
        >
            {props.cb.holiday ? (
                ""
            ) : isLoadingCard ? (
                <Loader size={10} />
            ) : props.user && props.user.admin ? (
                <>
                    <BreakIcon
                        icon="announce"
                        doneText="Announced"
                        waitingText="Not announced yet"
                        datetime={props.cb.announced}
                        clickable={props.cb.announced === undefined}
                        onClick={() => {
                            props.user
                                ? announceBreak(
                                      props.user,
                                      props.cb.id,
                                      props.updateBreaks,
                                      setLoadingCard
                                  )
                                : undefined
                        }}
                    />
                    <BreakIcon
                        icon="cookie"
                        doneText="Break held"
                        waitingText="Break not held yet"
                        datetime={
                            props.pastBreak ? props.cb.datetime : undefined
                        }
                    />
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
                        onClick={() => {
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
                                              setLoadingCard
                                          )
                                        : undefined
                                }
                            }
                        }}
                    />
                    <BreakIcon
                        icon="claim"
                        doneText="Claimed"
                        waitingText="Not claimed yet"
                        datetime={props.cb.claimed}
                    />
                    <BreakIcon
                        icon="success"
                        doneText="Admin reimbursed"
                        waitingText="Admin not reimbursed yet"
                        datetime={props.cb.success}
                    />
                </>
            ) : (
                ""
            )}{" "}
        </div>
    )
}

const BreakCard = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: (breaks: CookieBreak[]) => void
}) => {
    let hasPassed = dateInPast(props.cb.datetime)
    let isHoliday = props.cb.holiday !== null
    let hasHost = props.cb.host !== null
    let isAdmin = props.user?.admin

    const [contentLoading, setContentLoading] = useState(false)
    const [editingText, setEditingText] = useState(false)
    const contentTextRef = useRef<HTMLInputElement | null>(null)

    let contentText = isHoliday
        ? props.cb.holiday
        : !hasHost
        ? hasPassed
            ? "Host reimbursed"
            : "Host required"
        : props.cb.host
    let cardColour = isHoliday ? "bg-gray-300" : "bg-white"

    let contentTextStyle =
        isHoliday || !hasHost ? "text-sm" : editingText ? "" : "font-bold"
    let clickable = isAdmin && !dateInPast(props.cb.datetime)
    let clickableStyle = clickable
        ? "cursor-pointer hover:bg-gray-300/50 rounded-md"
        : ""

    const onClickText = (e: React.MouseEvent<HTMLDivElement>) => {
        if (clickable) {
            setEditingText(true)
        }
    }
    const discardContentText = () => {
        setEditingText(false)
    }
    const submitContentText = () => {
        if (props.user && contentTextRef.current) {
            let request = isHoliday ? setHoliday : setHost
            request(
                props.user,
                props.cb.id,
                contentTextRef.current.value,
                props.updateBreaks,
                setContentLoading
            )
        }
        setEditingText(false)
    }
    const onClickCloseText = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        discardContentText()
    }
    const onClickConfirmText = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        submitContentText()
    }
    const onKeyDownContentText = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            submitContentText()
        } else if (e.key === "Escape") {
            discardContentText()
        }
    }
    return (
        <div
            className={`flex w-3/4 desktop:w-content tablet:w-tabletContent flex-wrap border-4 m-5 p-1 px-5 mx-auto items-center justify-center ${cardColour}`}
        >
            <div className="w-full tablet:w-1/2 my-2 desktop:mx-0 desktop:w-1/3 text-center font-bold">
                {getCookieBreakDate(props.cb)}, {getCookieBreakTime(props.cb)}
            </div>
            <div
                className={`flex-1 desktop:mx-0 text-center px-5`}
                onClick={onClickText}
            >
                {contentLoading ? (
                    <Loader size={10} />
                ) : !editingText ? (
                    <span
                        className={`p-2 ${clickableStyle} ${contentTextStyle}`}
                    >
                        {contentText}
                    </span>
                ) : (
                    <div className="flex flex-row">
                        <SmallIcon
                            icon="cross"
                            styles=""
                            title="Close"
                            alt="cross"
                            onClick={onClickCloseText}
                        />
                        <input
                            ref={contentTextRef}
                            autoFocus
                            type="text"
                            className="w-full text-center mx-2"
                            placeholder="Host required"
                            onKeyDown={onKeyDownContentText}
                        />
                        <SmallIcon
                            icon="tick"
                            styles=""
                            title="Confirm"
                            alt="tick"
                            onClick={onClickConfirmText}
                        />
                    </div>
                )}
            </div>
            <BreakIcons
                cb={props.cb}
                updateBreaks={props.updateBreaks}
                user={props.user}
                pastBreak={hasPassed}
            />
        </div>
    )
}

export const BreakCards = (props: {
    title: string
    user: User | undefined
    breaks: CookieBreak[]
    updateBreaks: (breaks: CookieBreak[]) => void
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
                <>
                    {breakList.map((cb) => (
                        <BreakCard
                            user={props.user}
                            key={`${cb.id}`}
                            cb={cb}
                            updateBreaks={props.updateBreaks}
                        />
                    ))}
                </>
            )}
        </>
    )
}
