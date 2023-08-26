"use client"

import React, { useEffect, useState } from "react"
import { CookieBreak, User } from "./structs"
import { getBreaks } from "./api"
import { LoginBox } from "./login"
import { BreakCards } from "./breaks"

export const Home = () => {
    const [breaks, setBreaks] = useState<CookieBreak[]>([])
    const [token, setToken] = useState<string>("")
    const [user, setUser] = useState<User | undefined>(undefined)

    useEffect(() => {
        getBreaks(setBreaks)
    }, [])
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
                <BreakCards user={user} breaks={breaks} setBreaks={setBreaks} />
            </main>
        </>
    )
}

export default Home
