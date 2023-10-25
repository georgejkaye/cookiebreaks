import { useState } from "react"
import Loader from "./loader"

export const ActionButton = (props: {
    name: string
    hoverColour: string
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}) => {
    const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        props.onClick(e)
    }
    return (
        <button
            className={`p-2 border-2 bg-white border-bg2 rounded ${props.hoverColour}`}
            onClick={onClick}
        >
            {props.name}
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
}

export interface ExpandableCardProps {
    type: CardAction.EXPAND
    cardContentExpanded: JSX.Element
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
    cardAction: CardActionProps
    isLoading: boolean
    setLoading: (loading: boolean) => void
    cardContent: JSX.Element
}) => {
    let border = props.index === 0 ? "border-y-2" : "border-b-2"
    let selectableStyles =
        props.cardAction.type === CardAction.SELECT
            ? "cursor-pointer hover:bg-gray-50"
            : ""
    let cardColour =
        props.cardAction.type === CardAction.SELECT &&
        props.cardAction.isSelected
            ? props.cardAction.selectedColour
            : props.cardColour
    let cardStyle =
        `flex flex-col desktop:flex-row py-2 px-2 mx-auto align-center ` +
        `items-center ${cardColour} ${border} ${selectableStyles}`
    const [isExpanded, setExpanded] = useState(false)
    const onClickCard = (e: React.MouseEvent<HTMLDivElement>) =>
        props.cardAction.type === CardAction.SELECT
            ? props.cardAction.setSelected(!props.cardAction.isSelected)
            : props.cardAction.type === CardAction.EXPAND
            ? setExpanded(!isExpanded)
            : () => {}
    return (
        <div className={cardStyle} onClick={onClickCard}>
            {props.isLoading ? (
                <Loader size={2} styles="h-10 my-1" />
            ) : isExpanded && props.cardAction.type === CardAction.EXPAND ? (
                props.cardAction.cardContentExpanded
            ) : (
                props.cardContent
            )}
        </div>
    )
}

export const Button = <T,>(props: {
    button: CardSelector<T>
    selectedCards: T[]
    setCardsLoading: (ts: T[], isLoading: boolean) => void
}) => (
    <span className="flex flex-row justify-center items-center border-2 border-bg2 rounded">
        <button
            className="bg-bg2 text-fg2 font-bold p-2 hover:opacity-80"
            onClick={(_) =>
                props.button.submitSelection(
                    props.selectedCards,
                    props.setCardsLoading
                )
            }
        >
            {props.button.buttonName}
        </button>
        <div className="font-bold p-2">
            {props.button.flavourText(props.selectedCards)}
        </div>
    </span>
)

export const Buttons = <T,>(props: {
    buttons: CardSelector<T>[] | undefined
    selectedCards: T[]
    setCardsLoading: (ts: T[], isLoading: boolean) => void
}) =>
    props.selectedCards.length === 0 || !props.buttons ? (
        ""
    ) : (
        <div className="text-center mb-4 flex justify-center">
            {props.buttons.map((button) => (
                <Button
                    button={button}
                    selectedCards={props.selectedCards}
                    setCardsLoading={props.setCardsLoading}
                />
            ))}
        </div>
    )

export interface SelectableCardsProps<T> {
    type: CardAction.SELECT
    buttons: CardSelector<T>[]
    getSelectedColour: (t: T) => string
}

export interface ExpandableCardsProps<T> {
    type: CardAction.EXPAND
    getCardContentExpanded: (
        t: T,
        setLoading: (loading: boolean) => void
    ) => JSX.Element
}

export interface NoneCardsProps {
    type: CardAction.NONE
}

export type CardsActionProps<T> =
    | SelectableCardsProps<T>
    | ExpandableCardsProps<T>
    | NoneCardsProps

export const Cards = <T,>(props: {
    title: string
    getCardColour: (t: T) => string
    getCardContent: (
        t: T,
        setLoading: (loading: boolean) => void
    ) => JSX.Element
    cardsAction: CardsActionProps<T>
    isLoading: boolean
    elements: T[]
    buttons?: CardSelector<T>[]
}) => {
    const [selectedCards, setSelectedCards] = useState<T[]>([])
    const [loadingCards, setLoadingCards] = useState<T[]>([])
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
    let getCardActionProps = (t: T): CardActionProps =>
        props.cardsAction.type === CardAction.SELECT
            ? {
                  type: CardAction.SELECT,
                  isSelected: selectedCards.includes(t),
                  setSelected: (b: boolean) => setCardSelected(t, b),
                  selectedColour: props.cardsAction.getSelectedColour(t),
              }
            : props.cardsAction.type === CardAction.EXPAND
            ? {
                  type: CardAction.EXPAND,
                  cardContentExpanded: props.cardsAction.getCardContentExpanded(
                      t,
                      (b) => setCardLoading(t, b)
                  ),
              }
            : {
                  type: CardAction.NONE,
              }

    return !props.isLoading && props.elements.length === 0 ? (
        ""
    ) : (
        <>
            <div className="text-xl font-bold m-5 mb-4 my-10 text-center">
                {props.title}
            </div>
            <Buttons
                buttons={props.buttons}
                selectedCards={selectedCards}
                setCardsLoading={setCardsLoading}
            />
            {props.isLoading ? (
                <Loader size={10} />
            ) : (
                props.elements.map((t, i) => (
                    <Card
                        index={i}
                        cardColour={props.getCardColour(t)}
                        cardAction={getCardActionProps(t)}
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
