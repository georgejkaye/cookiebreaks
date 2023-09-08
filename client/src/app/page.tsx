"use client"

import React, { useEffect, useState } from "react"
import {
    CookieBreak,
    User,
    getFutureBreaks,
    getOutstandingBreaks,
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

    return (
        <>
            <main className="text-fg">
                <TopBar setUser={setUser} user={user} setBreaks={setBreaks} />
                <BreakCards
                    title="Upcoming"
                    user={user}
                    breaks={upcomingBreaks}
                    setBreaks={setBreaks}
                    isLoadingBreaks={isLoadingBreaks}
                    reverseBreaks=false
                />
                {!user?.admin ? (
                    ""
                ) : (
                    <BreakCards
                        title="Outstanding"
                        user={user}
                        breaks={outstandingBreaks}
                        setBreaks={setBreaks}
                        isLoadingBreaks={isLoadingBreaks}
                        reverseBreaks=true
                    />
                )}
            </main>
        </>
    )
}

export default Home
