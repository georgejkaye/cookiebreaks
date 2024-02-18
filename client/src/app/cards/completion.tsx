import { useState, useEffect } from "react"
import { Data, SetState } from "../page"
import {
    User,
    CookieBreak,
    UpdateFn,
    Claim,
    getClaimsToComplete,
    getDatetimeString,
    formatAsPrice,
} from "../structs"
import { BreaksHeader, Card, CardButtons } from "./cards"
import { completeClaim } from "../api"

export const ClaimDetails = (props: { claim: Claim }) => {
    let detailsStyle = "flex flex-col desktop:flex-row flex-1"
    return (
        <div className={detailsStyle}>
            <div className="w-full desktop:w-1/2 my-2 font-bold">
                {getDatetimeString(props.claim.date)}
            </div>
            <div className="flex flex-row justify-center items-center mx-4 mb-2 desktop:my-0">
                {formatAsPrice(props.claim.amount)}
            </div>
        </div>
    )
}

const AwaitingCompletionCard = (props: {
    index: number
    user: User | undefined
    claim: Claim
    breaks: CookieBreak[]
    updateClaims: UpdateFn<Claim>
    setCardLoading: SetState<boolean>
}) => {
    let buttons = [
        {
            isVisible: true,
            icon: "success",
            onClick: () =>
                completeClaim(
                    props.user,
                    props.claim,
                    props.breaks,
                    props.updateClaims,
                    props.setCardLoading
                ),
        },
    ]
    return (
        <div className="flex align-stretch flex-col justify-evenly items-center desktop:flex-row">
            <ClaimDetails claim={props.claim} />
            {!props.user?.admin ? (
                ""
            ) : (
                <CardButtons width={"w-36"} buttons={buttons} />
            )}
        </div>
    )
}

export const AwaitingCompletionCards = (props: {
    user: User | undefined
    claims: Claim[]
    breaks: CookieBreak[]
    updateClaims: UpdateFn<Claim>
}) => {
    const [claimsToComplete, setClaimsToComplete] = useState<Claim[]>([])
    useEffect(() => {
        console.log("Upading claims")
        console.log("The claims seen by awaiting completion are", props.claims)
        setClaimsToComplete(getClaimsToComplete(props.claims))
    }, [props.claims])
    return (
        <div>
            <BreaksHeader title={"Awaiting completion"} />
            {claimsToComplete.map((c, i) => (
                <Card
                    key={c.id}
                    content={(setCardLoading) => (
                        <AwaitingCompletionCard
                            index={i}
                            user={props.user}
                            claim={c}
                            updateClaims={props.updateClaims}
                            setCardLoading={setCardLoading}
                            breaks={props.breaks}
                        />
                    )}
                />
            ))}
        </div>
    )
}
