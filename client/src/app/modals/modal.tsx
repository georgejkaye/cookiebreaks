import { SetStateAction, useEffect, useRef, useState } from "react"

export const Modal = (props: {
    isOpen: boolean
    setOpen: React.Dispatch<SetStateAction<boolean>>
    style: string
    children: JSX.Element
}) => {
    const modalRef = useRef<HTMLDialogElement | null>(null)
    useEffect(() => {
        const modalElement = modalRef.current
        if (modalElement) {
            if (props.isOpen) {
                modalElement.showModal()
            } else {
                modalElement.close()
            }
        }
    }, [[props.isOpen]])
    const onCloseModal = () => {
        props.setOpen(false)
    }
    const onKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
        if (e.key === "Escape") {
            onCloseModal()
        }
    }
    return (
        <dialog
            ref={modalRef}
            onKeyDown={onKeyDown}
            className={`${props.style} backdrop:bg-black backdrop:opacity-75`}
        >
            {props.children}
        </dialog>
    )
}

export default Modal
