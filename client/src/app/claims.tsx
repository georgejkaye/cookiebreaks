import { useState } from "react"
import { CardAction, Cards, CardsActionProps } from "./cards"
import { Claim, UpdateClaimsFn, User, getCookieBreakDate } from "./structs"

export const ClaimCard = (props: { claim: Claim }) => {
    const [isExpanded, setExpanded] = useState(false)
    return (
        <div className="flex">
            <div className="font-bold">
                {props.claim.date.toLocaleDateString()}
            </div>
            <div className="font-bold">£{props.claim.amount.toFixed(2)}</div>
        </div>
    )
}
export const ClaimCardExpanded = (props: { claim: Claim }) => {
    return <div>Poo</div>
}
export const ClaimCards = (props: {
    title: string
    user: User | undefined
    claims: Claim[]
    updateClaims: UpdateClaimsFn
    isLoadingClaims: boolean
}) => {
    const getCardColour = (c: Claim) => "bg-white"
    const getCardContent = (
        c: Claim,
        setLoading: (loading: boolean) => void
    ) => <ClaimCard claim={c} />
    const getCardContentExpanded = (
        c: Claim,
        setLoading: (loading: boolean) => void
    ) => <ClaimCardExpanded claim={c} />
    const cardsAction: CardsActionProps<Claim> = {
        type: CardAction.EXPAND,
        getCardContentExpanded: getCardContentExpanded,
    }
    return (
        <Cards<Claim>
            title={props.title}
            cardsAction={cardsAction}
            isLoading={props.isLoadingClaims}
            elements={props.claims}
            getCardColour={getCardColour}
            getCardContent={getCardContent}
        />
    )
}
