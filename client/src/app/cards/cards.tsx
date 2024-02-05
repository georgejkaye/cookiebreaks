import React, { useState } from "react"
import Loader from "../loader"
import { SmallIcon } from "../icons"
import { SetState } from "../page"

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
