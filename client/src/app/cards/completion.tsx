import { useState, useEffect } from "react"
import { SetState } from "../page"
import {
    User,
    CookieBreak,
    UpdateFn,
    Claim,
    getClaimsToComplete,
} from "../structs"
import { BreaksHeader, Card } from "./cards"

const AwaitingCompletionCard = (props: {
    index: number
    user: User | undefined
    claim: Claim
    updateClaims: UpdateFn<Claim>
    setCardLoading: SetState<boolean>
}) => {
    return (
        <div className="flex align-stretch flex-col justify-evenly items-center desktop:flex-row">
            Claim
        </div>
    )
}

export const AwaitingCompletionCards = (props: {
    user: User | undefined
    claims: Claim[]
    updateClaims: UpdateFn<Claim>
}) => {
    const [claimsToComplete, setClaimsToComplete] = useState<Claim[]>([])
    useEffect(() => {
        setClaimsToComplete(getClaimsToComplete(props.claims))
    }, [props.claims])
    return (
        <div>
            <BreaksHeader title={"Awaiting completion"} />
            {claimsToComplete.map((c, i) => (
                <Card
                    content={(setCardLoading) => (
                        <AwaitingCompletionCard
                            index={i}
                            user={props.user}
                            claim={c}
                            updateClaims={props.updateClaims}
                            setCardLoading={setCardLoading}
                        />
                    )}
                />
            ))}
        </div>
    )
}
