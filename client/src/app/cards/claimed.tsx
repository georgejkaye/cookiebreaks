import {
    ActionButton,
    CardAction,
    Cards,
    CardsActionProps,
    SmallInfoCard,
} from "./cards"
import {
    Claim,
    CookieBreak,
    UpdateFn<Claim>,
    User,
    getClaimsToComplete,
    getDateString,
} from "../structs"
import { SmallIcon } from "../icons"
import { completeClaim } from "../api"
import { useEffect, useState } from "react"
const ClaimBreakDate = (props: { cookieBreak: CookieBreak }) => {
    const claimBreakDateStyles = "mx-2 flex-1 line-height-0"
    return (
        <div className={claimBreakDateStyles}>
            {getDateString(props.cookieBreak.datetime)}
        </div>
    )
}
export const ClaimBreakCost = (props: { cookieBreak: CookieBreak }) => {
    console.log(props.cookieBreak.cost)
    const breakCost = !props.cookieBreak.cost
        ? ""
        : `£${props.cookieBreak.cost.toFixed(2)}`
    const claimBreakCostStyles =
        "mx-2 bg-bg2 rounded text-white font-bold px-2 py-1"
    return <span className={claimBreakCostStyles}>{breakCost}</span>
}
const ClaimBreak = (props: { cookieBreak: CookieBreak }) => {
    let content = (
        <>
            <ClaimBreakDate cookieBreak={props.cookieBreak} />
            <ClaimBreakCost cookieBreak={props.cookieBreak} />
        </>
    )
    return (
        <SmallInfoCard
            icon="cookie"
            alt="Cookie"
            width="w-11/12 desktop:w-5/12"
            content={content}
        />
    )
}
const ClaimCompleteButton = (props: {
    user: User | undefined
    claim: Claim
    breaks: CookieBreak[]
    hoverColour: string
    updateClaims: UpdateFn<Claim>
    setLoadingCard: SetState<boolean>
}) => {
    const onClickComplete = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (props.user) {
            completeClaim(
                props.user,
                props.claim,
                props.cookieBreaks,
                props.updateClaims,
                props.setLoadingCard
            )
        }
    }
    return (
        <div className="desktop:w-40 m-2 desktop:m-0">
            <ActionButton
                name="Complete"
                onClick={onClickComplete}
                hoverColour={props.hoverColour}
                icon="success"
            />
        </div>
    )
}
const ClaimDeleteButton = (props: { claim: Claim; hoverColour: string }) => {
    const onClickDelete = (e: React.MouseEvent<HTMLDivElement>) => {}
    return (
        <div className="desktop:ml-auto ml-2">
            <SmallIcon
                icon="bin"
                title="Delete claim"
                alt="Bin"
                onClick={onClickDelete}
                hoverColour={props.hoverColour}
            />
        </div>
    )
}
const ClaimButtons = (props: {
    user: User | undefined
    claim: Claim
    breaks: CookieBreak[]
    setLoadingCard: SetState<boolean>
    updateClaims: UpdateFn<Claim>
}) => {
    const buttonHoverColour = "hover:bg-gray-100"
    const claimButtonsStyles =
        "w-full desktop:w-1/4 mt-2 tablet:mt-0 flex items-center justify-center"
    return (
        <div className={claimButtonsStyles}>
            <ClaimCompleteButton
                user={props.user}
                claim={props.claim}
                breaks={props.cookieBreaks}
                hoverColour={buttonHoverColour}
                setLoadingCard={props.setLoadingCard}
                updateClaims={props.updateClaims}
            />
        </div>
    )
}
const ClaimDetails = (props: { claim: Claim }) => {
    const claimDetailStyles =
        "flex flex-row w-full desktop:w-2/3 flex-1 p-2 desktop:p-0"
    return (
        <div className={claimDetailStyles}>
            <div className="w-full font-bold">
                {getDateString(props.claim.date)}
            </div>
            <div className="w-full font-bold">
                £{props.claim.amount.toFixed(2)}
            </div>
        </div>
    )
}
const ClaimCard = (props: {
    user: User | undefined
    claim: Claim
    breaks: CookieBreak[]
    updateClaims: UpdateFn<Claim>
    setLoadingCard: SetState<boolean>
}) => {
    const claimCardStyles =
        "flex flex-col desktop:flex-row w-full justify-center " +
        "items-center justify-between p-2 desktop:p-0"
    return (
        <div className={claimCardStyles}>
            <ClaimDetails claim={props.claim} />
            <ClaimButtons
                user={props.user}
                claim={props.claim}
                breaks={props.cookieBreaks}
                updateClaims={props.updateClaims}
                setLoadingCard={props.setLoadingCard}
            />
        </div>
    )
}
const ClaimCardExpanded = (props: {
    user: User | undefined
    claim: Claim
    breaks: CookieBreak[]
    updateClaims: UpdateFn<Claim>
    setLoadingCard: SetState<boolean>
}) => {
    const claimCardExpandedStyles = "flex w-full flex-col"
    const claimBreaksStyles =
        "m-2 p-2 border-t-2 flex flex-row flex-wrap justify-center"
    return (
        <div className={claimCardExpandedStyles}>
            <ClaimCard
                user={props.user}
                claim={props.claim}
                breaks={props.cookieBreaks}
                updateClaims={props.updateClaims}
                setLoadingCard={props.setLoadingCard}
            />
            <div className={claimBreaksStyles}>
                {props.claim.breaks.map((cookieBreak: CookieBreak) => (
                    <ClaimBreak cookieBreak={cb} />
                ))}
            </div>
        </div>
    )
}
export const ClaimCards = (props: {
    title: string
    user: User | undefined
    claims: Claim[]
    updateClaims: UpdateFn<Claim>
    isLoadingClaims: boolean
    breaks: CookieBreak[]
}) => {
    const [claimsToComplete, setClaimsToComplete] = useState<Claim[]>(
        getClaimsToComplete(props.claims)
    )
    useEffect(() => {
        setClaimsToComplete(getClaimsToComplete(props.claims))
    }, [props.claims])

    const getCardColour = (c: Claim) => "bg-white"
    const getHoverColour = (c: Claim) => "hover:bg-gray-100"
    const getCardContent = (
        c: Claim,
        setLoading: (loading: boolean) => void
    ) => (
        <ClaimCard
            user={props.user}
            claim={c}
            breaks={props.cookieBreaks}
            updateClaims={props.updateClaims}
            setLoadingCard={setLoading}
        />
    )
    const getCardContentExpanded = (
        c: Claim,
        setLoading: (loading: boolean) => void
    ) => (
        <ClaimCardExpanded
            user={props.user}
            claim={c}
            breaks={props.cookieBreaks}
            updateClaims={props.updateClaims}
            setLoadingCard={setLoading}
        />
    )
    const cardsAction: CardsActionProps<Claim> = {
        type: CardAction.EXPAND,
        getCardContentExpanded: getCardContentExpanded,
        getHoverColour: getHoverColour,
    }
    return (
        <Cards<Claim>
            title={props.title}
            cardsAction={cardsAction}
            isLoading={props.isLoadingClaims}
            elements={claimsToComplete}
            getCardColour={getCardColour}
            getCardContent={getCardContent}
        />
    )
}
