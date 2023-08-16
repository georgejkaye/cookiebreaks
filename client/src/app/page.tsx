"use client"

import { useEffect, useState } from "react"
import {
    CookieBreak,
    dateInPast,
    getCookieBreakDate,
    getCookieBreakTime,
    getDatetimeText,
    getFutureBreaks,
} from "./structs"
import { getBreaks } from "./api"
import Image from "next/image"

const BreakIcon = (props: {
    icon: string
    doneText: string
    waitingText: string
    datetime?: Date
}) => {
    let titleText = !props.datetime
        ? props.waitingText
        : `${props.doneText} on ${getDatetimeText(props.datetime)}`
    let opacity = !props.datetime ? 0.25 : 1
    return (
        <div className="my-2 mx-2 desktop:mx-0">
            <Image
                width={30}
                height={30}
                src={`/images/icons/${props.icon}.svg`}
                title={titleText}
                alt={titleText}
                style={{ opacity: opacity }}
            />
        </div>
    )
}

const BreakCard = (props: { cb: CookieBreak }) => {
    let pastBreak = dateInPast(props.cb.datetime)
    let hostText =
        props.cb.host === null
            ? pastBreak
                ? "Host reimbursed"
                : "Host required"
            : props.cb.host
    return (
        <div className="flex w-3/4 desktop:w-content tablet:w-tabletContent flex-wrap border-4 m-5 p-1 px-5 mx-auto">
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
            <div className="flex w-full desktop:w-1/6 justify-center desktop:justify-end d:w-auto">
                <BreakIcon
                    icon="announce"
                    doneText="Announced"
                    waitingText="Not announced yet"
                    datetime={props.cb.announced}
                />
                <BreakIcon
                    icon="cookie"
                    doneText="Break held"
                    waitingText="Break not held yet"
                    datetime={pastBreak ? props.cb.datetime : undefined}
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
            </div>
        </div>
    )
}

export const Home = () => {
    const [breaks, setBreaks] = useState<CookieBreak[]>([])
    const [futureBreaks, setFutureBreaks] = useState<CookieBreak[]>([])

    useEffect(() => {
        getBreaks(setBreaks)
    }, [])
    useEffect(() => {
        setFutureBreaks(getFutureBreaks(breaks))
    }, [breaks])

    return (
        <>
            <main className="text-fg">
                <h1 className="text-6xl text-center p-10">Cookie breaks</h1>
                {futureBreaks.map((cb) => (
                    <BreakCard key={`${cb.id}`} cb={cb} />
                ))}
            </main>
        </>
    )
}

export default Home
