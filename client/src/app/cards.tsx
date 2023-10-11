import { useState } from "react"
import Loader from "./loader"

export interface CardSelector<T> {
    buttonName: string
    submitSelection: (
        t: T[],
        setLoadingCards: (ts: T[], loading: boolean) => void
    ) => void
    flavourText: (ts: T[]) => string
}

export const Card = <T,>(props: {
    index: number
    selectable: boolean
    isSelected: boolean
    isLoading: boolean
    setSelected?: (selected: boolean) => void
    setLoading: (loading: boolean) => void
    cardColour: string
    cardContent: JSX.Element
}) => {
    let border = props.index === 0 ? "border-y-2" : "border-b-2"
    let selectableStyles = props.selectable
        ? "cursor-pointer hover:bg-gray-50"
        : ""
    let cardStyle =
        `flex flex-col desktop:flex-row py-2 px-2 mx-auto align-center ` +
        `items-center ${props.cardColour} ${border} ${selectableStyles}`
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

export const Cards = <T,>(props: {
    title: string
    isLoading: boolean
    elements: T[]
    getCardColour: (t: T, isSelected: boolean) => string
    getCardContent: (
        t: T,
        setLoading: (loading: boolean) => void
    ) => JSX.Element
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
    const cardsSelectable =
        props.buttons !== undefined && props.buttons.length > 0
    const isSelected = (t: T) => selectedCards.includes(t)
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
                        selectable={
                            cardsSelectable && !loadingCards.includes(t)
                        }
                        isSelected={isSelected(t)}
                        setSelected={(b) => setCardSelected(t, b)}
                        isLoading={loadingCards.includes(t)}
                        setLoading={(b) => setCardLoading(t, b)}
                        cardColour={props.getCardColour(t, isSelected(t))}
                        cardContent={props.getCardContent(t, (b) =>
                            setCardLoading(t, b)
                        )}
                    />
                ))
            )}
        </>
    )
}
