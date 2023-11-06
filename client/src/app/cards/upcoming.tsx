import { useState, useEffect } from "react"
import { announceBreak, submitClaim } from "../api"
import { getSelectedColour, getCardColour, BreakDetails } from "./breaks"
import {
    SelectableCardsProps,
    CardAction,
    Cards,
    ActionButton,
    NoneCardProps,
    NoneCardsProps,
} from "./cards"
import { getHoverColour } from "../icons"
import {
    User,
    CookieBreak,
    UpdateBreaksFn,
    UpdateClaimsFn,
    getBreaksToClaim,
    formatAsPrice,
    getOutstandingBreaks,
    getFutureBreaks,
} from "../structs"

const buttonHoverColour = "hover:bg-gray-300"

const AnnounceButton = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setLoading: (loading: boolean) => void
}) => {
    const onClickAnnounce = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (props.user) {
            announceBreak(
                props.user,
                props.cb,
                props.updateBreaks,
                props.setLoading
            )
        }
    }
    return (
        <ActionButton
            name="Announce"
            hoverColour={buttonHoverColour}
            onClick={onClickAnnounce}
        />
    )
}

export const UpcomingBreakCard = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setLoading: (loading: boolean) => void
    isLoadingBreaks: boolean
}) => {
    return (
        <div className="flex flex-row">
            <div className="flex flex-col desktop:flex-row">
                <BreakDetails
                    cb={props.cb}
                    user={props.user}
                    setCardLoading={props.setLoading}
                    updateBreaks={props.updateBreaks}
                />
                {!props.user?.admin ? (
                    ""
                ) : (
                    <AnnounceButton
                        user={props.user}
                        cb={props.cb}
                        updateBreaks={props.updateBreaks}
                        setLoading={props.setLoading}
                    />
                )}
            </div>
        </div>
    )
}

export const UpcomingBreaksCards = (props: {
    user: User | undefined
    breaks: CookieBreak[]
    updateBreaks: UpdateBreaksFn
    isLoadingBreaks: boolean
}) => {
    const [upcomingBreaks, setUpcomingBreaks] = useState<CookieBreak[]>()
    useEffect(() => {
        setUpcomingBreaks(getFutureBreaks(props.breaks))
    }, [props.breaks])
    const getCardContent = (
        cb: CookieBreak,
        setLoading: (loading: boolean) => void
    ) => (
        <UpcomingBreakCard
            user={props.user}
            cb={cb}
            setLoading={setLoading}
            updateBreaks={props.updateBreaks}
            isLoadingBreaks={props.isLoadingBreaks}
        />
    )
    const cardsAction: NoneCardsProps = {
        type: CardAction.NONE,
    }
    return (
        <Cards<CookieBreak>
            title="Awaiting claim"
            getCardColour={getCardColour}
            getCardContent={getCardContent}
            cardsAction={cardsAction}
            isLoading={props.isLoadingBreaks}
            elements={upcomingBreaks}
        />
    )
}
