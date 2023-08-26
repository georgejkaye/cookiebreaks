import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { announceBreak, reimburseBreak } from "./api"
import {
    getDatetimeText,
    User,
    CookieBreak,
    dateInPast,
    getCookieBreakDate,
    getCookieBreakTime,
    getFutureBreaks,
} from "./structs"
import Image from "next/image"
import Loader from "./loader"

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
    let opacity = !props.datetime ? 0.25 : 1
    const onClickIcon = (e: React.MouseEvent<HTMLDivElement>) => {
        if (props.clickable && props.onClick) {
            props.onClick()
        }
    }
    return (
        <Image
            className={
                props.clickable
                    ? "cursor-pointer hover:bg-gray-300 rounded-full bg-opacity-30 hover:"
                    : ""
            }
            onClick={onClickIcon}
            width={30}
            height={30}
            src={`/images/icons/${props.icon}.svg`}
            title={titleText}
            alt={titleText}
            style={{ opacity: opacity }}
        />
    )
}

const BreakIcons = (props: {
    cb: CookieBreak
    breaks: CookieBreak[]
    setBreaks: Dispatch<SetStateAction<CookieBreak[]>>
    user: User | undefined
    pastBreak: boolean
}) => {
    const [isLoadingCard, setLoadingCard] = useState(false)
    return (
        <div className="flex w-full desktop:w-1/6">
            {isLoadingCard ? (
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
                                      props.breaks,
                                      props.setBreaks,
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
                                              props.breaks,
                                              props.setBreaks,
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
    breaks: CookieBreak[]
    setBreaks: Dispatch<SetStateAction<CookieBreak[]>>
}) => {
    let pastBreak = dateInPast(props.cb.datetime)
    let hostText =
        props.cb.host === null
            ? pastBreak
                ? "Host reimbursed"
                : "Host required"
            : props.cb.host
    return (
        <div className="flex w-3/4 desktop:w-content tablet:w-tabletContent flex-wrap border-4 m-5 p-1 px-5 mx-auto items-center justify-center">
            <div className="w-full tablet:w-1/2 my-2 desktop:mx-0 desktop:w-1/3 text-center font-bold">
                {getCookieBreakDate(props.cb)}, {getCookieBreakTime(props.cb)}
            </div>
            <div
                className={`w-full tablet:w-1/2 desktop:flex-1 my-2 desktop:mx-0 text-center px-5 ${
                    props.cb.host === null ? "italic text-sm" : "bold"
                }`}
            >
                {hostText}
            </div>
            <BreakIcons
                cb={props.cb}
                breaks={props.breaks}
                setBreaks={props.setBreaks}
                user={props.user}
                pastBreak={pastBreak}
            />
        </div>
    )
}

export const BreakCards = (props: {
    user: User | undefined
    breaks: CookieBreak[]
    setBreaks: Dispatch<SetStateAction<CookieBreak[]>>
    isLoadingBreaks: boolean
}) => {
    const [renderedBreaks, setRenderedBreaks] = useState<CookieBreak[]>([])
    useEffect(() => {
        setRenderedBreaks(getFutureBreaks(props.breaks))
    }, [props.breaks])
    return props.isLoadingBreaks ? (
        <Loader margin={5} />
    ) : (
        renderedBreaks.map((cb) => (
            <BreakCard
                user={props.user}
                key={`${cb.id}`}
                cb={cb}
                breaks={props.breaks}
                setBreaks={props.setBreaks}
            />
        ))
    )
}