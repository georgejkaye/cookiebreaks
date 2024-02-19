import { useState, useEffect } from "react"
import { Data, SetState } from "../page"
import {
    User,
    CookieBreak,
    UpdateFn,
    getBreaksToClaim,
    formatAsPrice,
    Claim,
} from "../structs"
import { BreakDate, BreakDetails } from "./breaks"
import { BreaksHeader, Card, CardButtonProps, CardButtons } from "./cards"
import { submitClaim } from "../api"

const AwaitingClaimCard = (props: {
    index: number
    user: User | undefined
    cookieBreak: CookieBreak
    updateBreaks: UpdateFn<CookieBreak>
    setCardLoading: SetState<boolean>
    isCardSelected: boolean
    setCardSelected: (selected: boolean) => void
}) => {
    const buttons: CardButtonProps[] = [
        {
            isVisible: true,
            icon: "claim",
            onClick: () => props.setCardSelected(!props.isCardSelected),
        },
    ]
    return (
        <div className="flex flex-col desktop:flex-row">
            <div className="flex flex-col desktop:flex-row flex-1">
                <BreakDate cookieBreak={props.cookieBreak} />
                <div className="flex flex-row desktop:mx-4 mb-2 desktop:my-0">
                    {formatAsPrice(
                        !props.cookieBreak.cost ? 0 : props.cookieBreak.cost
                    )}
                </div>
            </div>
            {!props.user?.admin ? (
                ""
            ) : (
                <CardButtons width={"w-36"} buttons={buttons} />
            )}
        </div>
    )
}

export const AwaitingClaimCards = (props: {
    user: User | undefined
    breaks: CookieBreak[]
    updateBreaks: UpdateFn<CookieBreak>
    updateClaims: UpdateFn<Claim>
}) => {
    const [breaksToClaim, setBreaksToClaim] = useState<CookieBreak[]>([])
    const [selectedBreaks, setSelectedBreaks] = useState<CookieBreak[]>([])
    const [claimTotal, setClaimTotal] = useState(0.0)
    const [loadingCards, setLoadingCards] = useState<CookieBreak[]>([])
    const toggleLoadingCards = (loading: boolean, cbs: CookieBreak[]) => {
        if (loading) {
            setLoadingCards(loadingCards.concat(cbs))
        } else {
            setLoadingCards(loadingCards.filter((cb) => !cbs.includes(cb)))
        }
    }
    const setSelectedBreak = (b: CookieBreak, selected: boolean) => {
        if (selected) {
            if (!selectedBreaks.includes(b)) {
                setSelectedBreaks([...selectedBreaks, b])
                setClaimTotal(claimTotal + (b.cost ? b.cost : 0))
            }
        } else {
            setSelectedBreaks(selectedBreaks.filter((cb) => cb !== b))
            setClaimTotal(claimTotal - (b.cost ? b.cost : 0))
        }
    }
    useEffect(() => {
        setBreaksToClaim(getBreaksToClaim(props.breaks))
    }, [props.breaks])
    const onClickClaimButton = (e: React.MouseEvent<HTMLButtonElement>) => {
        submitClaim(
            props.user,
            selectedBreaks,
            props.updateClaims,
            props.updateBreaks,
            (loading) => toggleLoadingCards(loading, selectedBreaks)
        )
        setClaimTotal(0)
        setSelectedBreaks([])
    }
    return (
        <div>
            <div className="flex flex-col desktop:flex-row border-t">
                <h2 className="flex-1 p-4 text-2xl font-bold">
                    Awaiting claim
                </h2>
                {selectedBreaks.length === 0 ? (
                    ""
                ) : (
                    <button
                        className="rounded border-2 border-bg2 mb-4 desktop:m-2 desktop:mr-4 flex flex-row hover:bg-gray-300"
                        onClick={onClickClaimButton}
                    >
                        <div className="bg-bg2 p-2 text-white">
                            {formatAsPrice(claimTotal)}
                        </div>
                        <div className="p-2">Claim</div>
                    </button>
                )}
            </div>
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
                            isCardSelected={selectedBreaks.includes(b)}
                            setCardSelected={(selected) =>
                                setSelectedBreak(b, selected)
                            }
                        />
                    )}
                    colour={
                        selectedBreaks.includes(b) ? "bg-gray-200" : undefined
                    }
                    isLoading={loadingCards.includes(b)}
                />
            ))}
        </div>
    )
}
