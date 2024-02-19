"use client"

import React, { useEffect, useState } from "react"
import { Claim, CookieBreak, User, replaceItems } from "./structs"
import { getData, submitClaim } from "./api"
import { TopBar } from "./bar"
import { Manrope } from "next/font/google"
import { UpcomingBreaksCards } from "./cards/upcoming"
import { AwaitingReimbursementCards } from "./cards/reimbursement"
import { AwaitingClaimCards } from "./cards/awaiting"
import { AwaitingCompletionCards } from "./cards/completion"

export type SetState<T> = React.Dispatch<React.SetStateAction<T>>

const manrope = Manrope({
    weight: ["400", "700"],
    style: ["normal"],
    subsets: ["latin"],
    display: "swap",
})

export interface Data {
    breaks: CookieBreak[]
    claims: Claim[]
}

const Home = () => {
    const [user, setUser] = useState<User | undefined>(undefined)
    // All data
    const [claims, setClaims] = useState<Claim[]>([])
    const [breaks, setBreaks] = useState<CookieBreak[]>([])
    const [isLoadingData, setLoadingData] = useState(false)
    useEffect(() => {
        getData(user, setBreaks, setClaims, setLoadingData)
    }, [])
    useEffect(() => {
        console.log(claims)
    }, [claims])
    useEffect(() => {
        console.log(breaks)
    }, [breaks])
    const updateBreaks = (
        newBreaks: CookieBreak[],
        breaksToRemove: CookieBreak[]
    ) => {
        let updatedBreaks = replaceItems(
            breaks,
            newBreaks,
            breaksToRemove,
            (b1, b2) => b1.id === b2.id,
            (b1, b2) => b1.datetime.getTime() - b2.datetime.getTime()
        )
        setBreaks(updatedBreaks)
        return updatedBreaks
    }
    const updateClaims = (newClaims: Claim[], claimsToRemove: Claim[]) => {
        let updatedClaims = replaceItems(
            claims,
            newClaims,
            claimsToRemove,
            (c1, c2) => c1.id === c2.id,
            (c1, c2) => c1.date.getTime() - c2.date.getTime()
        )
        setClaims(updatedClaims)
        return updatedClaims
    }
    const makeClaim = (
        cbs: CookieBreak[],
        setLoadingCards: (cbs: CookieBreak[], loading: boolean) => void
    ) => {
        if (user) {
            submitClaim(user, cbs, updateClaims, updateBreaks, (b) =>
                setLoadingCards(cbs, b)
            )
        }
    }
    return (
        <>
            <main className={`text-fg ${manrope.className}`}>
                <TopBar
                    setUser={setUser}
                    user={user}
                    setBreaks={setBreaks}
                    setClaims={setClaims}
                    setLoadingData={setLoadingData}
                />
                <div className="m-5 w-mobileContent tablet:w-tabletContent desktop:w-content mx-auto">
                    <div className="text-lg">
                        The cookie break is the school's longest running social
                        event: every week a different host buys some biscuits up
                        to the amount of £15 and shares them with everyone else.
                        Thanks to the gracious funding of Research Committee,
                        they get reimbursed for their troubles!
                    </div>
                    <div className="my-4 border rounded-lg">
                        <UpcomingBreaksCards
                            user={user}
                            cookieBreaks={breaks}
                            updateBreaks={updateBreaks}
                        />
                        {!user?.admin ? (
                            ""
                        ) : (
                            <>
                                <AwaitingReimbursementCards
                                    user={user}
                                    cookieBreaks={breaks}
                                    updateBreaks={updateBreaks}
                                />
                                <AwaitingClaimCards
                                    user={user}
                                    breaks={breaks}
                                    updateBreaks={updateBreaks}
                                    updateClaims={updateClaims}
                                />
                                <AwaitingCompletionCards
                                    user={user}
                                    claims={claims}
                                    breaks={breaks}
                                    updateClaims={updateClaims}
                                />
                            </>
                        )}
                    </div>
                    <div className="text-center m-5">
                        This tool is in{" "}
                        <span className="text-red-600 font-bold">beta</span>!
                        Please report any bugs or suggestions on{" "}
                        <a
                            className="text-blue-600 font-bold"
                            href="https://github.com/georgejkaye/cookiebreaks/issues"
                            title="GitHub issues page"
                        >
                            GitHub
                        </a>
                        .
                    </div>
                </div>
            </main>
        </>
    )
}

export default Home
