import { useState, useEffect } from "react"
import { BreakDetails } from "./breaks"
import {
    ActionButton,
    BreaksHeader,
    Card,
    CardButtonProps,
    CardButtons,
    buttonHoverColour,
} from "./cards"
import { User, CookieBreak, UpdateFn, getFutureBreaks } from "../structs"
import { SetState } from "../page"
import { announceBreak, deleteBreak, setHoliday, setHost } from "../api"

const BreakHostEditor = (props: {
    user: User | undefined
    cookieBreak: CookieBreak
    updateBreaks: UpdateFn<CookieBreak>
    setCardLoading: SetState<boolean>
    setEditingHost: SetState<CookieBreak | undefined>
}) => {
    const [hostName, setHostName] = useState(props.cookieBreak.host)
    const [hostEmail, setHostEmail] = useState(props.cookieBreak.email)
    const onSubmitHost = () => {
        setHost(
            props.user,
            props.cookieBreak,
            hostName,
            hostEmail,
            props.updateBreaks,
            props.setCardLoading
        )
        props.setEditingHost(undefined)
    }
    const onKeyDownHostNameBox = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSubmitHost()
        }
    }
    const onChangeHostNameBox = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHostName(e.target.value)
    }
    const onKeyDownHostEmailBox = (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Enter") {
            onSubmitHost()
        }
    }
    const onChangeHostEmailBox = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHostEmail(e.target.value)
    }
    return (
        <div className="flex flex-col desktop:flex-row items-center my-2">
            <div className="mr-2">Host name</div>
            <input
                autoFocus
                className="m-1 rounded p-1 border-2 bg-white border-bg2"
                size={20}
                type="text"
                value={hostName}
                onKeyDown={onKeyDownHostNameBox}
                onChange={onChangeHostNameBox}
            />
            <div className="ml-4 mr-2">Host email</div>
            <input
                className="m-1 mr-4 rounded p-1 border-2 bg-white border-bg2"
                size={20}
                type="text"
                value={hostEmail}
                onKeyDown={onKeyDownHostEmailBox}
                onChange={onChangeHostEmailBox}
            />
            <ActionButton
                hoverColour={buttonHoverColour}
                icon={"tick"}
                onClick={(e) => onSubmitHost()}
            />
            <ActionButton
                hoverColour={buttonHoverColour}
                icon={"cross"}
                onClick={(e) => props.setEditingHost(undefined)}
            />
        </div>
    )
}

export const UpcomingBreakCard = (props: {
    index: number
    user: User | undefined
    cookieBreak: CookieBreak
    updateBreaks: UpdateFn<CookieBreak>
    setCardLoading: SetState<boolean>
    editingHostBreak: CookieBreak | undefined
    setEditingHostBreak: SetState<CookieBreak | undefined>
}) => {
    const buttons: CardButtonProps[] = [
        {
            isVisible: props.index === 0 && !props.cookieBreak.announced,
            icon: "announce",
            onClick: () =>
                announceBreak(
                    props.user,
                    props.cookieBreak,
                    props.updateBreaks,
                    props.setCardLoading
                ),
        },
        {
            isVisible: props.cookieBreak.holiday === undefined,
            icon: "person",
            onClick: () => {
                if (props.editingHostBreak === props.cookieBreak) {
                    props.setEditingHostBreak(undefined)
                } else {
                    props.setEditingHostBreak(props.cookieBreak)
                }
            },
        },
        {
            isVisible: true,
            icon: props.cookieBreak.holiday ? "landing" : "takeoff",
            onClick: () =>
                setHoliday(
                    props.user,
                    props.cookieBreak,
                    props.cookieBreak.holiday ? undefined : "Holiday",
                    props.updateBreaks,
                    props.setCardLoading
                ),
        },
        {
            isVisible: true,
            icon: "bin",
            onClick: () =>
                deleteBreak(
                    props.user,
                    props.cookieBreak,
                    props.updateBreaks,
                    props.setCardLoading
                ),
        },
    ]
    return (
        <>
            <div className="flex align-stretch flex-col desktop:flex-row">
                <BreakDetails
                    cookieBreak={props.cookieBreak}
                    user={props.user}
                    setCardLoading={props.setCardLoading}
                    updateBreaks={props.updateBreaks}
                />
                {!props.user?.admin ? (
                    ""
                ) : (
                    <CardButtons width={"w-36"} buttons={buttons} />
                )}
            </div>
            {props.cookieBreak !== props.editingHostBreak ? (
                ""
            ) : (
                <BreakHostEditor
                    setEditingHost={props.setEditingHostBreak}
                    user={props.user}
                    cookieBreak={props.cookieBreak}
                    updateBreaks={props.updateBreaks}
                    setCardLoading={props.setCardLoading}
                />
            )}
        </>
    )
}

export const UpcomingBreaksCards = (props: {
    user: User | undefined
    cookieBreaks: CookieBreak[]
    updateBreaks: UpdateFn<CookieBreak>
}) => {
    const [upcomingBreaks, setUpcomingBreaks] = useState<CookieBreak[]>([])
    const [editingHostBreak, setEditingHostBreak] = useState<
        CookieBreak | undefined
    >(undefined)
    useEffect(() => {
        setUpcomingBreaks(getFutureBreaks(props.cookieBreaks))
    }, [props.cookieBreaks])
    return (
        <div>
            <BreaksHeader title={"Upcoming breaks"} first={true} />
            {upcomingBreaks.map((b, i) => (
                <Card
                    key={b.id}
                    content={(setCardLoading) => (
                        <UpcomingBreakCard
                            index={i}
                            user={props.user}
                            cookieBreak={b}
                            updateBreaks={props.updateBreaks}
                            setCardLoading={setCardLoading}
                            editingHostBreak={editingHostBreak}
                            setEditingHostBreak={setEditingHostBreak}
                        />
                    )}
                    colour={!b.holiday ? "bg-white" : "bg-gray-200"}
                />
            ))}
        </div>
    )
}
