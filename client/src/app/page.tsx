"use client"

import { useEffect, useState } from "react"
import { CookieBreak, getCookieBreakDate } from "./structs"
import { getBreaks } from "./api"
import Head from "next/head"

export const Home = () => {
    const [breaks, setBreaks] = useState<CookieBreak[]>([])

    useEffect(() => {
        getBreaks(setBreaks)
    }, [])

    return (
        <>
            <Head>
                <title>Cookie breaks</title>
            </Head>
            <main className="w-content m-auto">
                <h1 className="text-6xl text-center p-10">Cookie breaks</h1>
                <table className="m-auto">
                    {breaks.map((cb) => (
                        <tr id={`${cb.id}`}>
                            <td className="py-2 pr-5 text-center">
                                {getCookieBreakDate(cb)}
                            </td>
                            <td className="py-2 pr-5 text-center">{cb.host}</td>
                        </tr>
                    ))}
                </table>
            </main>
        </>
    )
}

export default Home
