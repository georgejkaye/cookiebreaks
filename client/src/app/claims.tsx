import { useState } from "react"
import { ActionButton, CardAction, Cards, CardsActionProps } from "./cards"
import {
    Claim,
    CookieBreak,
    UpdateClaimsFn,
    User,
    getCookieBreakDate,
    getDateString,
} from "./structs"
import { SmallIcon, getHoverColour } from "./icons"

const ClaimBreak = (props: { cb: CookieBreak }) => {
    let breakCost = !props.cb.cost ? "" : `£${props.cb.cost.toFixed(2)}`
    return (
        <div className="flex flex-row m-2 p-2 w-11/12 desktop:w-5/12 border-2 rounded items-center bg-white justify-center">
            <SmallIcon icon="cookie" title="" alt="Cookie" styles="mr-2" />
            <div className="mx-2 flex-1 line-height-0">
                {getDateString(props.cb.datetime)}
            </div>
            <div className="mx-2 bg-bg2 rounded text-white font-bold px-2">
                {breakCost}
            </div>
        </div>
    )
}

export const ClaimCard = (props: { claim: Claim }) => {
    const [isExpanded, setExpanded] = useState(false)
    const onClickDelete = (e: React.MouseEvent<HTMLDivElement>) => {}
    const onClickComplete = (e: React.MouseEvent<HTMLButtonElement>) => {
        console.log("completed")
    }
    const hoverColour = "hover:bg-gray-100"
    return (
        <div className="flex flex-col desktop:flex-row w-full justify-center items-center justify-between p-2 desktop:p-0">
            <div className="flex flex-row w-full desktop:w-2/3 flex-1 p-2 desktop:p-0">
                <div className="w-full font-bold">
                    {getDateString(props.claim.date)}
                </div>
                <div className="w-full font-bold">
                    £{props.claim.amount.toFixed(2)}
                </div>
            </div>
            <div className="w-full desktop:w-1/4 mt-2 tablet:mt-0 flex items-center justify-center">
                <div className="desktop:w-40 m-2 desktop:m-0">
                    <ActionButton
                        name="Complete"
                        onClick={onClickComplete}
                        hoverColour={hoverColour}
                    />
                </div>
                <div className="desktop:ml-auto ml-2">
                    <SmallIcon
                        icon="bin"
                        title="Delete claim"
                        alt="Bin"
                        onClick={onClickDelete}
                        hoverColour={hoverColour}
                    />
                </div>
            </div>
        </div>
    )
}
export const ClaimCardExpanded = (props: { claim: Claim }) => {
    return (
        <div className="flex w-full flex-col">
            <ClaimCard claim={props.claim} />
            <div className="m-2 p-2 border-t-2 flex flex-row flex-wrap justify-center">
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
