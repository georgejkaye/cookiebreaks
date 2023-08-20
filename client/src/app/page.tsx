"use client"

import React, {
    ChangeEventHandler,
    Dispatch,
    SetStateAction,
    useEffect,
    useState,
} from "react"
import {
    CookieBreak,
    dateInPast,
    getCookieBreakDate,
    getCookieBreakTime,
    getDatetimeText,
    getFutureBreaks,
    User,
} from "./structs"
import { announceBreak, getBreaks, getToken as login } from "./api"
import Image from "next/image"

const BreakIcon = (props: {
    icon: string
    doneText: string
    waitingText: string
    datetime?: Date
    onClick?: () => any
}) => {
    let titleText = !props.datetime
        ? props.waitingText
        : `${props.doneText} on ${getDatetimeText(props.datetime)}`
    let opacity = !props.datetime ? 0.25 : 1
    const onClickIcon = (e: React.MouseEvent<HTMLDivElement>) => {
        if (props.onClick) {
            props.onClick()
        }
    }
    return (
        <div
            className={`my-2 mx-2 desktop:mx-0 ${
                props.onClick ? "cursor-pointer" : ""
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
            <div className="flex w-full desktop:w-1/6 justify-center desktop:justify-end d:w-auto">
                <BreakIcon
                    icon="announce"
                    doneText="Announced"
                    waitingText="Not announced yet"
                    datetime={props.cb.announced}
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

const LoginBox = (props: {
    setToken: Dispatch<SetStateAction<string>>
    setUser: Dispatch<SetStateAction<User | undefined>>
    user: User | undefined
}) => {
    const [userText, setUserText] = useState("")
    const [passwordText, setPasswordText] = useState("")
    const [status, setStatus] = useState("")
    const onChangeUserText = (e: React.ChangeEvent<HTMLInputElement>) =>
        setUserText(e.target.value)
    const onChangePasswordText = (e: React.ChangeEvent<HTMLInputElement>) =>
        setPasswordText(e.target.value)
    const onClickSubmitButton = (e: React.MouseEvent<HTMLButtonElement>) =>
        login(userText, passwordText, props.setToken, props.setUser, setStatus)
    const onClickLogoutButton = (e: React.MouseEvent<HTMLButtonElement>) => {
        props.setToken("")
        props.setUser(undefined)
    }
    useEffect(() => {
        if (props.user) {
            if (props.user.admin) {
                setStatus(`Logged in as admin ${props.user.user}`)
            } else {
                setStatus(`Logged in as ${props.user.user}`)
            }
        } else {
            setStatus("")
        }
    }, [props.user])
    return (
        <div className="bg-bg2 text-fg2 border-4 p-5 mx-auto flex flex-col w-3/4 desktop:w-content tablet:w-tabletContent align-center justify-center">
            {!props.user ? (
                <>
                    <div className="font-bold text-center pb-5">
                        Admin login
                    </div>
                    <div className="m-auto flex justify-center">
                        User
                        <input
                            className="mx-4 text-fg px-2 w-1/4"
                            type="text"
                            onChange={onChangeUserText}
                        />
                        Password
                        <input
                            className="mx-4 text-fg px-2 w-1/4"
                            type="password"
                            onChange={onChangePasswordText}
                        />
                        <button
                            className="bg-fg2 text-fg px-5"
                            onClick={onClickSubmitButton}
                        >
                            Submit
                        </button>
                    </div>
                    <div className="text-center mt-5">{status}</div>
                </>
            ) : (
                <div className="flex justify-center">
                    <div className="text-center">{status}</div>
                    <button
                        className="bg-fg2 text-fg px-5 mx-5"
                        onClick={onClickLogoutButton}
                    >
                        Log out
                    </button>
                </div>
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
                <LoginBox setToken={setToken} setUser={setUser} user={user} />
                {futureBreaks.map((cb) => (
                    <BreakCard
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
