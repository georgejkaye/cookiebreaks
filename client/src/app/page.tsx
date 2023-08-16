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
        <div>
            <Image
                width={25}
                height={25}
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
        <div className="flex border-4 m-5 p-1">
            <div className="w-64 text-center px-5 font-bold">
                {getCookieBreakDate(props.cb)}
            </div>
            <div className="w-24 text-center px-5 font-bold">
                {getCookieBreakTime(props.cb)}
            </div>
            <div
                className={`w-80 text-center px-5 ${
                    props.cb.host === null ? "italic text-sm" : "bold"
                }`}
            >
                {hostText}
            </div>
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
            <main className="w-content m-auto text-fg">
                <h1 className="text-6xl text-center p-10">Cookie breaks</h1>
                <table className="m-auto">
                    {futureBreaks.map((cb) => (
                        <BreakCard cb={cb} />
                    ))}
                </table>
            </main>
        </>
    )
}

export default Home
