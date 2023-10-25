import { ActionButton, CardAction, Cards, CardsActionProps } from "./cards"
import {
    Claim,
    CookieBreak,
    UpdateClaimsFn,
    User,
    getDateString,
} from "./structs"
import { SmallIcon } from "./icons"
const ClaimBreakDate = (props: { cb: CookieBreak }) => {
    const claimBreakDateStyles = "mx-2 flex-1 line-height-0"
    return (
        <div className={claimBreakDateStyles}>
            {getDateString(props.cb.datetime)}
        </div>
    )
}
const ClaimBreakCost = (props: { cb: CookieBreak }) => {
    const breakCost = !props.cb.cost ? "" : `£${props.cb.cost.toFixed(2)}`
    const claimBreakCostStyles = "mx-2 bg-bg2 rounded text-white font-bold px-2"
    return <div className={claimBreakCostStyles}>{breakCost}</div>
}
const ClaimBreak = (props: { cb: CookieBreak }) => {
    const claimBreakStyles =
        "flex flex-row m-2 p-2 w-11/12 desktop:w-5/12 border-2 rounded " +
        "items-center bg-white justify-center"
    return (
        <div className={claimBreakStyles}>
            <SmallIcon icon="cookie" title="" alt="Cookie" styles="mr-2" />
            <ClaimBreakDate cb={props.cb} />
            <ClaimBreakCost cb={props.cb} />
        </div>
    )
}
const ClaimCompleteButton = (props: { claim: Claim; hoverColour: string }) => {
    const onClickComplete = (e: React.MouseEvent<HTMLButtonElement>) => {}
    return (
        <div className="desktop:w-40 m-2 desktop:m-0">
            <ActionButton
                name="Complete"
                onClick={onClickComplete}
                hoverColour={props.hoverColour}
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
const ClaimButtons = (props: { claim: Claim }) => {
    const buttonHoverColour = "hover:bg-gray-100"
    const claimButtonsStyles =
        "w-full desktop:w-1/4 mt-2 tablet:mt-0 flex items-center justify-center"
    return (
        <div className={claimButtonsStyles}>
            <ClaimCompleteButton
                claim={props.claim}
                hoverColour={buttonHoverColour}
            />
            <ClaimDeleteButton
                claim={props.claim}
                hoverColour={buttonHoverColour}
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
const ClaimCard = (props: { claim: Claim }) => {
    const claimCardStyles =
        "flex flex-col desktop:flex-row w-full justify-center " +
        "items-center justify-between p-2 desktop:p-0"
    return (
        <div className={claimCardStyles}>
            <ClaimDetails claim={props.claim} />
            <ClaimButtons claim={props.claim} />
        </div>
    )
}
const ClaimCardExpanded = (props: { claim: Claim }) => {
    const claimCardExpandedStyles = "flex w-full flex-col"
    const claimBreaksStyles =
        "m-2 p-2 border-t-2 flex flex-row flex-wrap justify-center"
    return (
        <div className={claimCardExpandedStyles}>
            <ClaimCard claim={props.claim} />
            <div className={claimBreaksStyles}>
                {props.claim.breaks.map((cb: CookieBreak) => (
                    <ClaimBreak cb={cb} />
                ))}
            </div>
        </div>
    )
}
export const ClaimCards = (props: {
    title: string
    user: User | undefined
    claims: Claim[]
    updateClaims: UpdateClaimsFn
    isLoadingClaims: boolean
}) => {
    const getCardColour = (c: Claim) => "bg-white"
    const getHoverColour = (c: Claim) => "hover:bg-gray-100"
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
        getHoverColour: getHoverColour,
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
