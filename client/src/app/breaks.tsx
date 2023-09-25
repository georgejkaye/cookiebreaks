import React, { Dispatch, SetStateAction, useRef, useState } from "react"
import {
    announceBreak,
    deleteBreak,
    reimburseBreak,
    setHoliday,
    setHost,
} from "./api"
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
    styles?: string
    title: string
    alt: string
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
    hoverColour?: string
}) => {
    let style = `${props.styles ? props.styles : ""} ${
        props.onClick
            ? `cursor-pointer hover:bg-${props.hoverColour} rounded-full`
            : ""
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
    hoverColour?: string
}) => {
    let titleText = !props.datetime
        ? props.waitingText
        : `${props.doneText} on ${getDatetimeText(props.datetime)}`
    let opacity = props.datetime && dateInPast(props.datetime) ? "100" : "25"
    let style = `my-2 desktop:m-0 opacity-${opacity}`
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
const BreakControlIcons = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: (
        breaksToAdd: CookieBreak[],
        breaksToRemove: CookieBreak[]
    ) => void
    setContentLoading: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    let hoverColour = props.cb.holiday ? "blue-500" : "gray-300"
    const onClickHoliday = (e: React.MouseEvent<HTMLDivElement>) => {
        if (props.user) {
            let reason = props.cb.holiday ? undefined : "Holiday"
            setHoliday(
                props.user,
                props.cb.id,
                reason,
                props.updateBreaks,
                props.setContentLoading
            )
        }
    }
    const onClickDelete = (e: React.MouseEvent<HTMLDivElement>) => {
        if (props.user) {
            deleteBreak(
                props.user,
                props.cb,
                props.updateBreaks,
                props.setContentLoading
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

const BreakStatusIcons = (props: {
    cb: CookieBreak
    updateBreaks: (
        breaksToAdd: CookieBreak[],
        breaksToRemove: CookieBreak[]
    ) => void
    user: User | undefined
    pastBreak: boolean
    setLoadingCard: Dispatch<SetStateAction<boolean>>
}) => {
    const [isLoadingCard, setLoadingCard] = useState(false)
    let hoverColour = props.cb.holiday ? "gray-500" : "gray-300"
    return (
        <div
            className={`flex ${
                !props.cb.holiday ? "mr-4 desktop:mr-auto" : ""
            }`}
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
                        hoverColour={hoverColour}
                    />
                    <BreakIcon
                        icon="cookie"
                        doneText="Break held"
                        waitingText="Break not held yet"
                        datetime={
                            props.pastBreak ? props.cb.datetime : undefined
                        }
                        hoverColour={hoverColour}
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
                        hoverColour={hoverColour}
                    />
                    <BreakIcon
                        icon="claim"
                        doneText="Claimed"
                        waitingText="Not claimed yet"
                        datetime={props.cb.claimed}
                        hoverColour={hoverColour}
                    />
                    <BreakIcon
                        icon="success"
                        doneText="Admin reimbursed"
                        waitingText="Admin not reimbursed yet"
                        datetime={props.cb.success}
                        hoverColour={hoverColour}
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
    updateBreaks: (
        breaksToAdd: CookieBreak[],
        breaksToRemove: CookieBreak[]
    ) => void
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
    let placeholderText = isHoliday ? "Holiday" : "Host required"
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
            className={`flex w-3/4 flex-col desktop:flex-row desktop:w-content tablet:w-tabletContent border-4 m-5 p-1 px-2 mx-auto align-center items-center ${cardColour}`}
        >
            <div className="flex flex-col tablet:flex-row justify-center items-center flex-1 w-full desktop:w-2/3">
                <div className="w-full tablet:w-1/2 my-2 desktop:mx-0 text-center font-bold">
                    {getCookieBreakDate(props.cb)},{" "}
                    {getCookieBreakTime(props.cb)}
                </div>
                <div
                    className={`flex flex-row justify-center flex-1 text-center px-2 w-full`}
                    onClick={onClickText}
                >
                    {contentLoading ? (
                        <Loader size={8} />
                    ) : (
                        <div className="w-full m-2 h-8 flex flex-row justify-center items-center">
                            {!editingText ? (
                                <span
                                    className={`p-2 ${clickableStyle} ${contentTextStyle}`}
                                >
                                    {contentText}
                                </span>
                            ) : (
                                <div className="flex-1 flex flex-row h-10">
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
                                        className="flex-1 text-center mx-2 text-sm"
                                        placeholder={placeholderText}
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
                    )}
                </div>
            </div>
            {!props.user?.admin ? (
                ""
            ) : (
                <div className="my-2 desktop:my-0 desktop:w-1/4 flex flex-row flex-end">
                    <BreakStatusIcons
                        cb={props.cb}
                        updateBreaks={props.updateBreaks}
                        user={props.user}
                        pastBreak={hasPassed}
                        setLoadingCard={setContentLoading}
                    />
                    {!props.user?.admin ? (
                        ""
                    ) : (
                        <BreakControlIcons
                            cb={props.cb}
                            updateBreaks={props.updateBreaks}
                            user={props.user}
                            setContentLoading={setContentLoading}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

export const BreakCards = (props: {
    title: string
    user: User | undefined
    breaks: CookieBreak[]
    updateBreaks: (
        breaksToAdd: CookieBreak[],
        breaksToRemove: CookieBreak[]
    ) => void
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
