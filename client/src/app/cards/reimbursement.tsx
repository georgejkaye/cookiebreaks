import { useState, useEffect } from "react"
import { User, CookieBreak, UpdateFn, getBreaksToReimburse } from "../structs"
import { BreakDetails } from "./breaks"
import { SetState } from "../page"
import { Card, BreaksHeader, CardButtonProps, CardButtons } from "./cards"
import { reimburseBreak } from "../api"

const AwaitingReimbursementCard = (props: {
    index: number
    user: User | undefined
    cookieBreak: CookieBreak
    updateBreaks: UpdateFn<CookieBreak>
    setCardLoading: SetState<boolean>
}) => {
    const buttons: CardButtonProps[] = [
        {
            isVisible: true,
            icon: "reimburse",
            onClick: () =>
                reimburseBreak(
                    props.user,
                    props.cookieBreak,
                    10.0,
                    props.updateBreaks,
                    props.setCardLoading
                ),
        },
    ]
    return (
        <div className="flex align-stretch flex-col justify-evenly items-center desktop:flex-row">
            <BreakDetails
                cookieBreak={props.cookieBreak}
                user={props.user}
                setCardLoading={props.setCardLoading}
                updateBreaks={props.updateBreaks}
            />
            {!props.user?.admin ? (
                ""
            ) : (
                <CardButtons width="w-36" buttons={buttons} />
            )}
        </div>
    )
}

export const AwaitingReimbursementCards = (props: {
    user: User | undefined
    cookieBreaks: CookieBreak[]
    updateBreaks: UpdateFn<CookieBreak>
}) => {
    const [breaksToReimburse, setBreaksToReimburse] = useState<CookieBreak[]>(
        []
    )
    useEffect(() => {
        setBreaksToReimburse(getBreaksToReimburse(props.cookieBreaks))
    }, [props.cookieBreaks])
    return (
        <div>
            <BreaksHeader title={"Awaiting reimbursement"} />
            {breaksToReimburse.map((b, i) => (
                <Card
                    key={b.id}
                    content={(setCardLoading) => (
                        <AwaitingReimbursementCard
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
