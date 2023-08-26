"use client"

import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import {
    CookieBreak,
    dateInPast,
    getCookieBreakDate,
    getCookieBreakTime,
    getDatetimeText,
    getFutureBreaks,
    User,
} from "./structs"
import { announceBreak, getBreaks, reimburseBreak } from "./api"
import Image from "next/image"
import { LoginBox } from "./login"

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
        <div
            className={`my-2 mx-2 desktop:mx-0 ${
                props.clickable
                    ? "cursor-pointer hover:bg-gray-300 rounded-full bg-opacity-30 hover:"
                    : ""
            }`}
            onClick={onClickIcon}
        >
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

const BreakCard = (props: {
    user: User | undefined
    cb: CookieBreak
    breaks: CookieBreak[]
    token: string
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
            {props.user && props.user.admin ? (
                <div className="flex w-full desktop:w-1/6 justify-center desktop:justify-end d:w-auto">
                    <BreakIcon
                        icon="announce"
                        doneText="Announced"
                        waitingText="Not announced yet"
                        datetime={props.cb.announced}
                        clickable={props.cb.announced === undefined}
                        onClick={() => {
                            console.log("About to announce break")
                            announceBreak(
                                props.token,
                                props.cb.id,
                                props.breaks,
                                props.setBreaks
                            )
                        }}
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
                                    reimburseBreak(
                                        props.token,
                                        props.cb.id,
                                        costFloat,
                                        props.breaks,
                                        props.setBreaks
                                    )
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
                </div>
            ) : (
                ""
            )}
        </div>
    )
}

export const Home = () => {
    const [breaks, setBreaks] = useState<CookieBreak[]>([])
    const [futureBreaks, setFutureBreaks] = useState<CookieBreak[]>([])
    const [token, setToken] = useState<string>("")
    const [user, setUser] = useState<User | undefined>(undefined)

    useEffect(() => {
        getBreaks(setBreaks)
    }, [])
    useEffect(() => {
        setFutureBreaks(getFutureBreaks(breaks))
    }, [breaks])
    useEffect(() => {}, [token])

    return (
        <>
            <main className="text-fg">
                <h1 className="text-6xl text-center p-10">Cookie breaks</h1>
                <LoginBox
                    setToken={setToken}
                    setUser={setUser}
                    user={user}
                    setBreaks={setBreaks}
                />
                {futureBreaks.map((cb) => (
                    <BreakCard
                        user={user}
                        token={token}
                        key={`${cb.id}`}
                        cb={cb}
                        breaks={breaks}
                        setBreaks={setBreaks}
                    />
                ))}
            </main>
        </>
    )
}

export default Home
