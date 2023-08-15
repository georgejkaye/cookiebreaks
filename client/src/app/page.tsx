"use client"

import { useEffect, useState } from "react"
import {
    CookieBreak,
    getCookieBreakDate,
    getCookieBreakTime,
    getFutureBreaks,
} from "./structs"
import { getBreaks } from "./api"
import Head from "next/head"

const BreakCard = (props: { cb: CookieBreak }) => (
    <div className="flex border-4 m-5">
        <div className="w-64 text-center px-5 py-2 font-bold">
            {getCookieBreakDate(props.cb)}
        </div>
        <div className="w-24 text-center px-5 py-2 font-bold">
            {getCookieBreakTime(props.cb)}
        </div>
        <div className="w-80 text-center px-5 py-2">{props.cb.host}</div>
    </div>
)

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
