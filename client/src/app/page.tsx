"use client"

import React, { useEffect, useState } from "react"
import {
    CookieBreak,
    User,
    getFutureBreaks,
    getOutstandingBreaks,
    replaceBreaks,
} from "./structs"
import { getBreaks } from "./api"
import { BreakCards } from "./breaks"
import { TopBar } from "./bar"
import { Manrope } from "next/font/google"

const manrope = Manrope({
    weight: ["400", "700"],
    style: ["normal"],
    subsets: ["latin"],
    display: "swap",
})

const Home = () => {
    const [breaks, setBreaks] = useState<CookieBreak[]>([])
    const [upcomingBreaks, setUpcomingBreaks] = useState<CookieBreak[]>([])
    const [outstandingBreaks, setOutstandingBreaks] = useState<CookieBreak[]>(
        []
    )
    const [user, setUser] = useState<User | undefined>(undefined)
    const [isLoadingBreaks, setLoadingBreaks] = useState(false)
    useEffect(() => {
        getBreaks(setBreaks, setLoadingBreaks)
    }, [])
    useEffect(() => {
        setUpcomingBreaks(getFutureBreaks(breaks))
        setOutstandingBreaks(getOutstandingBreaks(breaks).reverse())
    }, [breaks])
    const updateBreaks = (
        newBreaks: CookieBreak[],
        breaksToRemove: CookieBreak[]
    ) => setBreaks(replaceBreaks(breaks, newBreaks, breaksToRemove))
    return (
        <>
            <main className={`text-fg ${manrope.className}`}>
                <TopBar setUser={setUser} user={user} setBreaks={setBreaks} />
                <BreakCards
                    title="Upcoming"
                    user={user}
                    breaks={upcomingBreaks}
                    updateBreaks={updateBreaks}
                    isLoadingBreaks={isLoadingBreaks}
                    reverseBreaks={false}
                />
                {!user?.admin ? (
                    ""
                ) : (
                    <BreakCards
                        title="Outstanding"
                        user={user}
                        breaks={outstandingBreaks}
                        updateBreaks={updateBreaks}
                        isLoadingBreaks={isLoadingBreaks}
                        reverseBreaks={true}
                    />
                )}
                <div className="text-center">
                    This tool is in{" "}
                    <span className="text-red-600 font-bold">beta</span>! Please
                    report any bugs or suggestions on{" "}
                    <a
                        className="text-blue-600 font-bold"
                        href="https://github.com/georgejkaye/cookiebreaks/issues"
                        title="GitHub issues page"
                    >
                        GitHub
                    </a>
                    .
                </div>
            </main>
        </>
    )
}

export default Home
