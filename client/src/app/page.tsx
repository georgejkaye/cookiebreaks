"use client"

import React, { useEffect, useState } from "react"
import {
    CookieBreak,
    User,
    formatAsPrice,
    getBreaksToClaim,
    getBreaksToComplete,
    getBreaksToReimburse,
    getFutureBreaks,
    getOutstandingBreaks,
    replaceBreaks,
} from "./structs"
import { getBreaks, submitClaim } from "./api"
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
    const [breaksToReimburse, setBreaksToReimburse] = useState<CookieBreak[]>(
        []
    )
    const [breaksToClaim, setBreaksToClaim] = useState<CookieBreak[]>([])
    const [breaksToComplete, setBreaksToComplete] = useState<CookieBreak[]>([])
    const [user, setUser] = useState<User | undefined>(undefined)
    const [isLoadingBreaks, setLoadingBreaks] = useState(false)
    useEffect(() => {
        getBreaks(setBreaks, setLoadingBreaks)
    }, [])
    useEffect(() => {
        setUpcomingBreaks(getFutureBreaks(breaks))
        setBreaksToReimburse(getBreaksToReimburse(breaks))
        setBreaksToClaim(getBreaksToClaim(breaks))
        setBreaksToComplete(getBreaksToComplete(breaks))
    }, [breaks])
    const updateBreaks = (
        newBreaks: CookieBreak[],
        breaksToRemove: CookieBreak[]
    ) => setBreaks(replaceBreaks(breaks, newBreaks, breaksToRemove))
    const makeClaim = (
        cbs: CookieBreak[],
        setLoadingCards: (cbs: CookieBreak[], loading: boolean) => void
    ) => {
        if (user) {
            submitClaim(user, cbs, updateBreaks, (b) => setLoadingCards(cbs, b))
        }
    }
    return (
        <>
            <main className={`text-fg ${manrope.className}`}>
                <TopBar setUser={setUser} user={user} setBreaks={setBreaks} />
                <div className="text-center m-5 w-mobileContent tablet:w-tabletContent desktop:w-content mx-auto">
                    <div>
                        The cookie break is the school's longest running social
                        event: every week a different host buys some biscuits up
                        to the amount of £10 and shares them with everyone else.
                        Thanks to the gracious funding of Research Committee,
                        they get reimbursed for their troubles!
                    </div>
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
                        <>
                            <BreakCards
                                title="Awaiting reimbursement"
                                user={user}
                                breaks={breaksToReimburse}
                                updateBreaks={updateBreaks}
                                isLoadingBreaks={isLoadingBreaks}
                                reverseBreaks={false}
                            />
                            <BreakCards
                                title="Awaiting claim"
                                user={user}
                                breaks={breaksToClaim}
                                updateBreaks={updateBreaks}
                                isLoadingBreaks={isLoadingBreaks}
                                reverseBreaks={false}
                                buttons={[
                                    {
                                        buttonName: "Make claim",
                                        submitSelection: makeClaim,
                                        flavourText: (cbs) => {
                                            let cost = cbs.reduce(
                                                (acc, cur) =>
                                                    acc +
                                                    (cur.cost ? cur.cost : 0),
                                                0
                                            )
                                            return formatAsPrice(cost)
                                        },
                                    },
                                ]}
                            />
                            <BreakCards
                                title="Awaiting completion"
                                user={user}
                                breaks={breaksToComplete}
                                updateBreaks={updateBreaks}
                                isLoadingBreaks={isLoadingBreaks}
                                reverseBreaks={false}
                            />
                        </>
                    )}
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
