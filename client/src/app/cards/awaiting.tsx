import { useState, useEffect } from "react"
import { SetState } from "../page"
import { User, CookieBreak, UpdateFn, getBreaksToClaim } from "../structs"
import { BreakDetails } from "./breaks"
import { BreaksHeader, Card, CardButtons } from "./cards"

const AwaitingClaimCard = (props: {
    index: number
    user: User | undefined
    cookieBreak: CookieBreak
    updateBreaks: UpdateFn<CookieBreak>
    setCardLoading: SetState<boolean>
}) => {
    return (
        <div className="flex flex-col items-center desktop:flex-row">
            <BreakDetails
                cookieBreak={props.cookieBreak}
                user={props.user}
                setCardLoading={props.setCardLoading}
                updateBreaks={props.updateBreaks}
            />
            {!props.user?.admin ? (
                ""
            ) : (
                <CardButtons width={"w-36"} buttons={[]} />
            )}
        </div>
    )
}

export const AwaitingClaimCards = (props: {
    user: User | undefined
    cookieBreaks: CookieBreak[]
    updateBreaks: UpdateFn<CookieBreak>
}) => {
    const [breaksToClaim, setBreaksToClaim] = useState<CookieBreak[]>([])

    useEffect(() => {
        setBreaksToClaim(getBreaksToClaim(props.cookieBreaks))
    }, [props.cookieBreaks])
    return (
        <div>
            <BreaksHeader title={"Awaiting claim"} />
            {breaksToClaim.map((b, i) => (
                <Card
                    key={b.id}
                    content={(setCardLoading) => (
                        <AwaitingClaimCard
                            index={i}
                            user={props.user}
                            cookieBreak={b}
                            updateBreaks={props.updateBreaks}
                            setCardLoading={setCardLoading}
                        />
                    )}
                />
            ))}
        </div>
    )
}
