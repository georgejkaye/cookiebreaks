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
// import { LoginBox } from "./login"
import { BreakCards } from "./breaks"
import { TopBar } from "./bar"

const Home = () => {
    const [breaks, setBreaks] = useState<CookieBreak[]>([])
    const [upcomingBreaks, setUpcomingBreaks] = useState<CookieBreak[]>([])
    const [outstandingBreaks, setOutstandingBreaks] = useState<CookieBreak[]>(
        []
    )
    const [token, setToken] = useState<string>("")
    const [user, setUser] = useState<User | undefined>(undefined)
    const [isLoadingBreaks, setLoadingBreaks] = useState(false)
    useEffect(() => {
        getBreaks(setBreaks, setLoadingBreaks)
    }, [])
    useEffect(() => {}, [token])
    useEffect(() => {
        setUpcomingBreaks(getFutureBreaks(breaks))
        setOutstandingBreaks(getOutstandingBreaks(breaks))
    }, [breaks])
    const updateBreaks = (newBreaks: CookieBreak[]) =>
        setBreaks(replaceBreaks(breaks, newBreaks))
    return (
        <>
            <main className="text-fg">
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
