import React, { SetStateAction, useState } from "react"
import Loader from "../loader"
import { SmallIcon } from "../icons"
import { SetState } from "../page"

export const ActionButton = (props: {
    name?: string
    hoverColour: string
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
    title: string
    alt: string
    icon?: string
    style?: string
}) => {
    const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        props.onClick(e)
    }
    return (
        <button
            className={`px-2 border-2 bg-white border-bg2 rounded ${
                props.hoverColour
            } ${props.style ? props.style : ""}`}
            onClick={onClick}
            title={props.title}
        >
            <div className="flex align-items-center">
                {props.icon ? (
                    <SmallIcon
                        width={25}
                        styles="m-0"
                        icon={props.icon}
                        alt={"Tick"}
                    />
                ) : (
                    ""
                )}
                {props.name}
            </div>
        </button>
    )
}

export interface CardSelector<T> {
    buttonName: string
    submitSelection: (
        t: T[],
        setLoadingCards: (ts: T[], loading: boolean) => void
    ) => void
    flavourText: (ts: T[]) => string
}

export enum CardAction {
    NONE,
    EXPAND,
    SELECT,
}

export interface SelectableCardProps {
    type: CardAction.SELECT
    isSelected: boolean
    setSelected: (selected: boolean) => void
    selectedColour: string
    hoverColour: string
}

export interface ExpandableCardProps {
    type: CardAction.EXPAND
    setExpanded: (isExpanded: boolean) => void
    cardContentExpanded: JSX.Element
    hoverColour: string
}

export interface NoneCardProps {
    type: CardAction.NONE
}

export type CardActionProps =
    | SelectableCardProps
    | ExpandableCardProps
    | NoneCardProps

export const Card = <T,>(props: {
    index: number
    cardColour: string
    isLoading: boolean
    setLoading: (loading: boolean) => void
    cardContent: JSX.Element
}) => {
    let border = props.index === 0 ? "border-y-2" : "border-b-2"
    let cardStyle = `py-2 px-2 ${border}`
    return (
        <div className={cardStyle}>
            {props.isLoading ? (
                <Loader size={2} styles="h-10 my-1" />
            ) : (
                props.cardContent
            )}
        </div>
    )
}

export interface SelectableCardsProps<T> {
    type: CardAction.SELECT
    buttons: CardSelector<T>[]
    getSelectedColour: (t: T) => string
    getHoverColour: (t: T) => string
}

export interface ExpandableCardsProps<T> {
    type: CardAction.EXPAND
    getCardContentExpanded: (
        t: T,
        setLoading: (loading: boolean) => void
    ) => JSX.Element
    getHoverColour: (t: T) => string
}

export interface NoneCardsProps {
    type: CardAction.NONE
}

export type CardsActionProps<T> =
    | SelectableCardsProps<T>
    | ExpandableCardsProps<T>
    | NoneCardsProps

export interface ElementArrayState<T> {
    elements: T[]
    setElements: SetState<T[]>
}

export const Cards = <T,>(props: {
    title: string
    getCardColour: (t: T) => string
    getCardContent: (
        t: T,
        setLoading: (loading: boolean) => void
    ) => JSX.Element
    isLoading: boolean
    elements: T[] | undefined
    header?: (
        setLoading: (elements: T[], isLoading: boolean) => void,
        selectedCards: T[],
        setSelectedCards: SetState<T[]>
    ) => JSX.Element
}) => {
    const [loadingCards, setLoadingCards] = useState<T[]>([])
    const [selectedCards, setSelectedCards] = useState<T[]>([])
    const setCardSelected = (t: T, selected: boolean) =>
        selected
            ? setSelectedCards([...selectedCards, t])
            : setSelectedCards(selectedCards.filter((t1) => t1 !== t))

    const setCardsSelected = (ts: T[], selected: boolean) =>
        selected
            ? setSelectedCards(selectedCards.concat(ts))
            : setSelectedCards(selectedCards.filter((t) => !ts.includes(t)))
    const addCardToLoadingCards = (t: T) => {
        setLoadingCards([...loadingCards, t])
        setCardSelected(t, false)
    }
    const addCardsToLoadingCards = (ts: T[]) => {
        setLoadingCards(loadingCards.concat(ts))
        setCardsSelected(ts, false)
    }
    const removeCardFromLoadingCards = (t: T) =>
        setLoadingCards(loadingCards.filter((b) => b !== t))
    const removeCardsFromLoadingCards = (ts: T[]) =>
        setLoadingCards(loadingCards.filter((b) => !ts.includes(b)))
    const setCardLoading = (t: T, isLoading: boolean) =>
        isLoading ? addCardToLoadingCards(t) : removeCardFromLoadingCards(t)
    const setCardsLoading = (ts: T[], isLoading: boolean) =>
        isLoading ? addCardsToLoadingCards(ts) : removeCardsFromLoadingCards(ts)
    return !props.elements ||
        (!props.isLoading && props.elements.length === 0) ? (
        ""
    ) : (
        <>
            <div className="text-xl font-bold m-5 mb-4 my-10 text-center">
                {props.title}
            </div>
            {props.header
                ? props.header(setCardsLoading, selectedCards, setSelectedCards)
                : ""}
            {props.isLoading ? (
                <Loader size={10} />
            ) : (
                props.elements.map((t, i) => (
                    <Card
                        index={i}
                        cardColour={props.getCardColour(t)}
                        isLoading={loadingCards.includes(t)}
                        setLoading={(b) => setCardLoading(t, b)}
                        cardContent={props.getCardContent(t, (b) =>
                            setCardLoading(t, b)
                        )}
                    />
                ))
            )}
        </>
    )
}

export const SmallInfoCard = (props: {
    icon: string
    alt: string
    content: JSX.Element
    width: string
}) => {
    const claimBreakStyles =
        "flex flex-row m-2 p-2 border-2 rounded " +
        "items-center bg-white justify-between " +
        props.width
    return (
        <div className={claimBreakStyles}>
            <SmallIcon
                width={30}
                icon={props.icon}
                alt={props.alt}
                styles="mr-2"
            />
            {props.content}
        </div>
    )
}
