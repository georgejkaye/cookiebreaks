import React, { ReactNode, useState } from "react"
import Loader from "../loader"
import { SmallIcon } from "../icons"
import { SetState } from "../page"
import { TailSpin } from "react-loader-spinner"

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

export const Card = (props: {
    content: (setCardLoading: SetState<boolean>) => ReactNode
}) => {
    const [isCardLoading, setCardLoading] = useState(false)
    return (
        <div className="py-2">
            {isCardLoading ? (
                <TailSpin wrapperClass="justify-center" height={30} />
            ) : (
                props.content(setCardLoading)
            )}
        </div>
    )
}

export const BreaksHeader = (props: { title: string }) => (
    <h2 className="text-xl font-bold">{props.title}</h2>
)
