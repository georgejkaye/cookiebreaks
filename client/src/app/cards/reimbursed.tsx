import { useState, useEffect } from "react"
import { submitClaim } from "../api"
import { SmallInfoCard, SelectableCardsProps, CardAction, Cards } from "./cards"
import { ClaimBreakCost } from "./claimed"
import { getHoverColour } from "../icons"
import {
    CookieBreak,
    UpdateBreaksFn,
    UpdateClaimsFn,
    User,
    formatAsPrice,
    getBreaksToClaim,
    getDatetimeText,
} from "../structs"
import { BreakDetails, getCardColour, getSelectedColour } from "./breaks"

const AwaitingClaimCard = (props: {
    user: User | undefined
    cb: CookieBreak
    setLoading: (loading: boolean) => void
    updateBreaks: UpdateBreaksFn
}) => {
    const cardStyles =
        "flex flex-col desktop:flex-row w-full justify-center " +
        "items-center justify-between p-2 desktop:p-0"
    return (
        <div className={cardStyles}>
            <div className="flex-1">
                <BreakDetails
                    user={props.user}
                    cb={props.cb}
                    updateBreaks={props.updateBreaks}
                    setCardLoading={props.setLoading}
                />
            </div>
            <ClaimBreakCost cb={props.cb} />
        </div>
    )
}

const AwaitingClaimInfoCards = (props: { cb: CookieBreak }) => {
    let content = (
        <>
            {!props.cb.reimbursed
                ? ""
                : `Reimbursed on ${getDatetimeText(props.cb.reimbursed)}`}
        </>
    )
    return (
        <>
            <SmallInfoCard
                width="w-7/12"
                icon="reimburse"
                alt="Coin"
                content={content}
            />
        </>
    )
}

export const AwaitingClaimCards = (props: {
    user: User | undefined
    breaks: CookieBreak[]
    updateBreaks: UpdateBreaksFn
    updateClaims: UpdateClaimsFn
    isLoadingBreaks: boolean
}) => {
    const [breaksToClaim, setBreaksToClaim] = useState<CookieBreak[]>()
    useEffect(() => {
        setBreaksToClaim(getBreaksToClaim(props.breaks))
    }, [props.breaks])
    const getCardContent = (
        cb: CookieBreak,
        setLoading: (loading: boolean) => void
    ) => (
        <AwaitingClaimCard
            user={props.user}
            cb={cb}
            setLoading={setLoading}
            updateBreaks={props.updateBreaks}
        />
    )
    const makeClaim = (
        cbs: CookieBreak[],
        setLoadingCards: (cbs: CookieBreak[], loading: boolean) => void
    ) => {
        if (props.user) {
            submitClaim(
                props.user,
                cbs,
                props.updateBreaks,
                props.updateClaims,
                (b) => setLoadingCards(cbs, b)
            )
        }
    }
    const claimButton = {
        buttonName: "Make claim",
        submitSelection: makeClaim,
        flavourText: (cbs: CookieBreak[]) => {
            let cost = cbs.reduce(
                (acc, cur) => acc + (cur.cost ? cur.cost : 0),
                0
            )
            return `${formatAsPrice(cost)} (${cbs.length})`
        },
    }
    const cardsAction: SelectableCardsProps<CookieBreak> = {
        type: CardAction.SELECT,
        getSelectedColour: getSelectedColour,
        getHoverColour: getHoverColour,
        buttons: [claimButton],
    }
    return (
        <Cards<CookieBreak>
            title="Awaiting claim"
            getCardColour={getCardColour}
            getCardContent={getCardContent}
            cardsAction={cardsAction}
            isLoading={props.isLoadingBreaks}
            elements={breaksToClaim}
        />
    )
}
