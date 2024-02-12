import React, { ReactNode, useState } from "react"
import Loader from "../loader"
import { SmallIcon, getHoverColour } from "../icons"
import { SetState } from "../page"
import { TailSpin } from "react-loader-spinner"
import { CookieBreak, UpdateFn, User } from "../structs"

export const ActionButton = (props: {
    hoverColour: string
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
    icon?: string
}) => {
    const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        props.onClick(e)
    }
    return (
        <button
            className={`m-1 border-2 bg-white border-bg2 rounded ${props.hoverColour}`}
            onClick={onClick}
        >
            <div className="flex align-items-center">
                {props.icon ? (
                    <SmallIcon styles="m-0" icon={props.icon} alt={"Tick"} />
                ) : (
                    ""
                )}
            </div>
        </button>
    )
}

export interface CardButtonProps {
    isVisible: boolean
    icon: string
    onClick: () => Promise<void>
}

const buttonHoverColour = "hover:bg-gray-300"

export const CardButtons = (props: {
    width: string
    buttons: CardButtonProps[]
}) => (
    <div className="w-36 flex justify-center desktop:justify-end">
        {props.buttons.map(({ isVisible, icon, onClick }) =>
            !isVisible ? (
                ""
            ) : (
                <div className="w-10">
                    <ActionButton
                        hoverColour={buttonHoverColour}
                        onClick={(e) => onClick()}
                        icon={icon}
                    />
                </div>
            )
        )}
    </div>
)

export const Card = (props: {
    content: (setCardLoading: SetState<boolean>) => ReactNode
    colour?: string
}) => {
    const [isCardLoading, setCardLoading] = useState(false)
    return (
        <div
            className={`${
                !props.colour ? "" : props.colour
            } border-t py-2 px-4`}
        >
            {isCardLoading ? (
                <TailSpin wrapperClass="justify-center" height={30} />
            ) : (
                props.content(setCardLoading)
            )}
        </div>
    )
}

export const BreaksHeader = (props: { title: string; first?: boolean }) => {
    let border = props.first === undefined || !props.first ? "border-t" : ""
    return <h2 className={`${border} p-4 text-2xl font-bold`}>{props.title}</h2>
}
