import React, { useRef, useState } from "react"
import { setHoliday, setHost } from "./api"
import {
    User,
    CookieBreak,
    getCookieBreakDate,
    getCookieBreakTime,
    breakInPast,
    UpdateBreaksFn,
} from "./structs"
import Loader from "./loader"
import {
    BreakControlIcons,
    BreakStatusIcons,
    SmallIcon,
    getHoverColour,
} from "./icons"

export type SetState<T> = React.Dispatch<React.SetStateAction<T>>

export const TickCrossInputBox = (props: {
    onClickClose: (text: string) => void
    onClickConfirm: (text: string) => void
    divStyle: string
    inputStyle: string
    placeholder: string
    size: number
}) => {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const closeText = () => {
        if (inputRef.current) {
            props.onClickClose(inputRef.current.value)
        }
    }
    const confirmText = () => {
        if (inputRef.current) {
            props.onClickConfirm(inputRef.current.value)
        }
    }
    const onClickCloseText = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        closeText()
    }
    const onClickConfirmText = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        confirmText()
    }
    const onKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            confirmText()
        } else if (e.key === "Escape") {
            closeText()
        }
    }
    const divStyle = `flex-1 flex flex-row items-center ${props.divStyle}`
    const inputStyle = `flex-1 text-center m-2 py-2 ${props.inputStyle}`
    return (
        <div className={divStyle}>
            <SmallIcon
                icon="cross"
                styles=""
                title="Close"
                alt="cross"
                onClick={onClickCloseText}
            />
            <input
                ref={inputRef}
                className={inputStyle}
                autoFocus
                type="text"
                placeholder={props.placeholder}
                onKeyDown={onKeyDownInput}
                size={props.size}
            />
            <SmallIcon
                icon="tick"
                styles=""
                title="Confirm"
                alt="tick"
                onClick={onClickConfirmText}
            />
        </div>
    )
}

const BreakContentEditor = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setEditingText: SetState<boolean>
    setCardLoading: (loading: boolean) => void
}) => {
    const discardContentText = () => {
        props.setEditingText(false)
    }
    const submitContentText = (text: string) => {
        if (props.user) {
            let request = props.cb.holiday ? setHoliday : setHost
            let currentValue =
                props.cb.holiday && text === "" ? "Holiday" : text
            request(
                props.user,
                props.cb.id,
                currentValue,
                props.updateBreaks,
                props.setCardLoading
            )
        }
        props.setEditingText(false)
    }
    return (
        <TickCrossInputBox
            onClickClose={discardContentText}
            onClickConfirm={submitContentText}
            divStyle="h=10"
            inputStyle="text-sm"
            placeholder={props.cb.holiday ? "Holiday" : "Host required"}
            size={16}
        />
    )
}

const BreakContent = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setCardLoading: (loading: boolean) => void
}) => {
    const [editingText, setEditingText] = useState(false)
    let isHoliday = props.cb.holiday
    let hasHost = props.cb.host
    let isAdmin = props.user?.admin
    let contentTextStyle =
        isHoliday || !hasHost ? "text-sm" : editingText ? "" : "font-bold"
    let clickable = isAdmin && !breakInPast(props.cb)
    let hoverColour = getHoverColour(props.cb)
    let clickableStyle = clickable
        ? `cursor-pointer ${hoverColour} rounded-md`
        : ""
    let contentText = isHoliday
        ? props.cb.holiday
        : !hasHost
        ? breakInPast(props.cb)
            ? "Host reimbursed"
            : "Host required"
        : props.cb.host
    const onClickText = (e: React.MouseEvent<HTMLDivElement>) => {
        if (clickable) {
            setEditingText(true)
        }
    }
    let breakContentStyle =
        "w-full flex flex-row justify-center items-center mx-4"
    return (
        <div className={breakContentStyle}>
            {!editingText ? (
                <span
                    className={`p-2 m-1 ${clickableStyle} ${contentTextStyle}`}
                    onClick={onClickText}
                >
                    {contentText}
                </span>
            ) : (
                <BreakContentEditor
                    cb={props.cb}
                    user={props.user}
                    updateBreaks={props.updateBreaks}
                    setCardLoading={props.setCardLoading}
                    setEditingText={setEditingText}
                />
            )}
        </div>
    )
}

const BreakDate = (props: { cb: CookieBreak }) => {
    let dateStyle = "w-full desktop:my-2 text-center font-bold"
    return (
        <div className={dateStyle}>
            {getCookieBreakDate(props.cb)}, {getCookieBreakTime(props.cb)}
        </div>
    )
}

const BreakDetails = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setCardLoading: (loading: boolean) => void
}) => {
    let detailsStyle =
        "flex flex-col justify-around tablet:flex-row " +
        "items-center flex-1 w-full desktop:w-2/3"
    return (
        <div className={detailsStyle}>
            <BreakDate cb={props.cb} />
            <BreakContent
                user={props.user}
                cb={props.cb}
                setCardLoading={props.setCardLoading}
                updateBreaks={props.updateBreaks}
            />
        </div>
    )
}

const AdminIcons = (props: {
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    setCardLoading: (loading: boolean) => void
}) => {
    let adminIconsStyle =
        "h-12 desktop:my-0 w-full justify-center items-center desktop:w-1/4 flex flex-row desktop:flex-end"
    return (
        <div className={adminIconsStyle}>
            <BreakStatusIcons
                cb={props.cb}
                updateBreaks={props.updateBreaks}
                user={props.user}
                setCardLoading={props.setCardLoading}
            />
            <BreakControlIcons
                cb={props.cb}
                updateBreaks={props.updateBreaks}
                user={props.user}
                setCardLoading={props.setCardLoading}
            />
        </div>
    )
}

const BreakCard = (props: {
    index: number
    user: User | undefined
    cb: CookieBreak
    updateBreaks: UpdateBreaksFn
    selectable: boolean
    isSelected: boolean
    isLoading: boolean
    setSelected?: (selected: boolean) => void
    setLoading: (loading: boolean) => void
}) => {
    let border = props.index === 0 ? "border-y-2" : "border-b-2"
    let selectableStyles = props.selectable
        ? "cursor-pointer hover:bg-gray-50"
        : ""
    let cardColour = props.cb.holiday
        ? "bg-gray-200"
        : props.isSelected
        ? "bg-gray-100"
        : "bg-white"
    let cardStyle =
        `flex flex-col desktop:flex-row py-2 px-2 mx-auto align-center ` +
        `items-center ${cardColour} ${border} ${selectableStyles}`
    const onSelect = (e: React.MouseEvent<HTMLDivElement>) => {
        if (props.selectable) {
            if (props.setSelected) {
                props.setSelected(!props.isSelected)
            }
        }
    }
    return (
        <div className={cardStyle} onClick={onSelect}>
            {props.isLoading ? (
                <Loader size={2} styles="h-10 my-1" />
            ) : (
                <>
                    <BreakDetails
                        cb={props.cb}
                        user={props.user}
                        setCardLoading={props.setLoading}
                        updateBreaks={props.updateBreaks}
                    />
                    {!props.user?.admin ? (
                        ""
                    ) : (
                        <AdminIcons
                            cb={props.cb}
                            user={props.user}
                            setCardLoading={props.setLoading}
                            updateBreaks={props.updateBreaks}
                        />
                    )}
                </>
            )}
        </div>
    )
}

export interface BreakCardSelector {
    buttonName: string
    submitSelection: (
        cb: CookieBreak[],
        setLoadingCards: (cbs: CookieBreak[], loading: boolean) => void
    ) => void
    flavourText: (cbs: CookieBreak[]) => string
}

export const BreakCards = (props: {
    title: string
    user: User | undefined
    breaks: CookieBreak[]
    updateBreaks: UpdateBreaksFn
    isLoadingBreaks: boolean
    reverseBreaks: boolean
    buttons?: BreakCardSelector[]
}) => {
    const [selectedCards, setSelectedCards] = useState<CookieBreak[]>([])
    const [loadingCards, setLoadingCards] = useState<CookieBreak[]>([])
    const setCardSelected = (cb: CookieBreak, selected: boolean) =>
        selected
            ? setSelectedCards([...selectedCards, cb])
            : setSelectedCards(selectedCards.filter((cb1) => cb1 !== cb))
    const setCardsSelected = (cbs: CookieBreak[], selected: boolean) =>
        selected
            ? setSelectedCards(selectedCards.concat(cbs))
            : setSelectedCards(selectedCards.filter((cb) => !cbs.includes(cb)))
    const addCardToLoadingCards = (cb: CookieBreak) => {
        setLoadingCards([...loadingCards, cb])
        setCardSelected(cb, false)
    }
    const addCardsToLoadingCards = (cbs: CookieBreak[]) => {
        setLoadingCards(loadingCards.concat(cbs))
        setCardsSelected(cbs, false)
    }
    const removeCardFromLoadingCards = (cb: CookieBreak) =>
        setLoadingCards(loadingCards.filter((b) => b !== cb))
    const removeCardsFromLoadingCards = (cbs: CookieBreak[]) =>
        setLoadingCards(loadingCards.filter((b) => !cbs.includes(b)))
    const setCardLoading = (cb: CookieBreak, isLoading: boolean) =>
        isLoading ? addCardToLoadingCards(cb) : removeCardFromLoadingCards(cb)
    const setCardsLoading = (cbs: CookieBreak[], isLoading: boolean) =>
        isLoading
            ? addCardsToLoadingCards(cbs)
            : removeCardsFromLoadingCards(cbs)
    return !props.isLoadingBreaks && props.breaks.length === 0 ? (
        ""
    ) : (
        <>
            <div className="text-xl font-bold m-5 mb-4 my-10 text-center">
                {props.title}
            </div>
            {selectedCards.length === 0 || !props.buttons ? (
                ""
            ) : (
                <div className="text-center mb-4 flex justify-center">
                    {props.buttons.map((button) => (
                        <span className="flex flex-row justify-center items-center border-2 border-bg2 rounded">
                            <button
                                className="bg-bg2 text-fg2 font-bold p-2 hover:opacity-80"
                                onClick={(e) =>
                                    button.submitSelection(
                                        selectedCards,
                                        setCardsLoading
                                    )
                                }
                            >
                                {button.buttonName}
                            </button>
                            <div className="font-bold p-2">
                                {button.flavourText(selectedCards)}
                            </div>
                        </span>
                    ))}
                </div>
            )}
            {props.isLoadingBreaks ? (
                <Loader size={10} />
            ) : (
                props.breaks.map((cb, i) => (
                    <BreakCard
                        index={i}
                        user={props.user}
                        key={cb.id}
                        cb={cb}
                        updateBreaks={props.updateBreaks}
                        selectable={
                            props.buttons !== undefined &&
                            props.buttons.length > 0 &&
                            !loadingCards.includes(cb)
                        }
                        isSelected={selectedCards.includes(cb)}
                        isLoading={loadingCards.includes(cb)}
                        setLoading={(b) => setCardLoading(cb, b)}
                        setSelected={(b) => setCardSelected(cb, b)}
                    />
                ))
            )}
        </>
    )
}
