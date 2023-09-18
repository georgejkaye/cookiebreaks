import { SetStateAction, useEffect, useRef, useState } from "react"
import Modal from "./modal"
import { login } from "../api"
import { CookieBreak, User } from "../structs"

export interface LoginData {
    user: string
    password: string
}

const initialLoginFormState = {
    user: "",
    password: "",
}

export const LoginModal = (props: {
    isOpen: boolean
    setOpen: React.Dispatch<SetStateAction<boolean>>
    setUser: React.Dispatch<SetStateAction<User | undefined>>
    setStatus: React.Dispatch<SetStateAction<string>>
    setBreaks: React.Dispatch<SetStateAction<CookieBreak[]>>
    setLoading: React.Dispatch<SetStateAction<boolean>>
}) => {
    const focusInputRef = useRef<HTMLInputElement | null>(null)
    const [formState, setFormState] = useState<LoginData>(initialLoginFormState)
    useEffect(() => {
        if (props.isOpen && focusInputRef.current) {
            setTimeout(() => {
                focusInputRef.current!.focus()
            }, 0)
        }
    }, [])
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormState((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }))
    }
    const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(formState.user, formState.password)
        setFormState(initialLoginFormState)
    }
    const onClickSubmitButton = (e: React.MouseEvent<HTMLButtonElement>) => {
        login(
            formState.user,
            formState.password,
            props.setUser,
            props.setStatus,
            props.setBreaks,
            props.setLoading
        )
    }
    const onClickBackButton = (e: React.MouseEvent<HTMLButtonElement>) =>
        props.setOpen(false)
    return (
        <Modal
            isOpen={props.isOpen}
            setOpen={props.setOpen}
            style={"w-96 p-5 mt-36"}
        >
            <>
                <div className="text-center text-lg font-bold mb-2">Login</div>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col mb-5 align-center">
                        <div>
                            <input
                                className="border-2 p-2 my-2 w-full"
                                ref={focusInputRef}
                                type="text"
                                id="user"
                                name="user"
                                placeholder="User"
                                value={formState.user}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <input
                                className="border-2 p-2 my-2 w-full"
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Password"
                                value={formState.password}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex flex-row justify-center">
                        <button
                            className="p-2 mx-2 bg-gray-600 text-white"
                            type="submit"
                            onClick={onClickSubmitButton}
                        >
                            Submit
                        </button>
                        <button
                            className="p-2 mx-2 bg-gray-600 text-white"
                            type="button"
                            onClick={onClickBackButton}
                        >
                            Back
                        </button>
                    </div>
                </form>
            </>
        </Modal>
    )
}

export const LogoutModal = (props: {
    isOpen: boolean
    setOpen: React.Dispatch<SetStateAction<boolean>>
    user: User
    setUser: React.Dispatch<SetStateAction<User | undefined>>
}) => {
    const onClickLogoutButton = (e: React.MouseEvent<HTMLButtonElement>) => {
        props.setUser(undefined)
        props.setOpen(false)
    }
    const onClickBackButton = (e: React.MouseEvent<HTMLButtonElement>) => {
        props.setOpen(false)
    }
    return (
        <Modal isOpen={props.isOpen} setOpen={props.setOpen} style={"w-96"}>
            <>
                <div className="m-4 flex flex-col align-center">
                    <div className="text-center text-lg font-bold pb-2">
                        You are logged in as{" "}
                        <span className="text-blue-800">{props.user.user}</span>
                        .
                    </div>
                    {props.user.admin ? (
                        <div className="text-center pb-4">
                            You are an admin.
                        </div>
                    ) : (
                        ""
                    )}
                    <div className="flex flex-row justify-center">
                        <button
                            className="p-2 mx-2 bg-gray-600 text-white self-center"
                            type="button"
                            onClick={onClickLogoutButton}
                        >
                            Logout
                        </button>
                        <button
                            className="p-2 mx-2 bg-gray-600 text-white self-center"
                            type="button"
                            onClick={onClickBackButton}
                        >
                            Back
                        </button>
                    </div>
                </div>
            </>
        </Modal>
    )
}
