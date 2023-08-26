import { Dispatch, SetStateAction, useState, useEffect } from "react"
import { User, CookieBreak } from "./structs"
import { login } from "./api"
import Loader from "./loader"

const InputBox = (props: {
    type: string
    placeholder: string
    text: string
    setText: Dispatch<SetStateAction<string>>
}) => {
    const onChangeText = (e: React.ChangeEvent<HTMLInputElement>) =>
        props.setText(e.target.value)
    return (
        <input
            className="mx-4 text-fg p-4 m-1 mx-auto text-bg bg-bg2 border w-full tablet:w-1/4 desktop:w-1/3"
            type={props.type}
            placeholder={props.placeholder}
            value={props.text}
            onChange={onChangeText}
        />
    )
}

export const LoginBox = (props: {
    setToken: Dispatch<SetStateAction<string>>
    setUser: Dispatch<SetStateAction<User | undefined>>
    setBreaks: Dispatch<SetStateAction<CookieBreak[]>>
    user: User | undefined
}) => {
    const [userText, setUserText] = useState("")
    const [passwordText, setPasswordText] = useState("")
    const [status, setStatus] = useState("")
    const [isLoading, setLoading] = useState(false)
    const onClickSubmitButton = (e: React.MouseEvent<HTMLButtonElement>) => {
        setStatus("")
        login(
            userText,
            passwordText,
            props.setToken,
            props.setUser,
            setStatus,
            props.setBreaks,
            setLoading
        )
        setPasswordText("")
    }
    const onClickLogoutButton = (e: React.MouseEvent<HTMLButtonElement>) => {
        props.setToken("")
        props.setUser(undefined)
    }
    useEffect(() => {
        if (props.user) {
            if (props.user.admin) {
                setStatus(`Logged in as admin ${props.user.user}`)
            } else {
                setStatus(`Logged in as ${props.user.user}`)
            }
        } else {
            setStatus("")
        }
    }, [props.user])
    return (
        <div className="bg-bg2 text-fg2 border-4 p-5 mx-auto flex flex-col w-3/4 desktop:w-content tablet:w-tabletContent items-center justify-center">
            {isLoading ? (
                <Loader />
            ) : !props.user ? (
                <>
                    <div className="font-bold text-center pb-5">
                        Admin login
                    </div>
                    <div className="m-auto flex flex-col tablet:flex-row justify-center items-center">
                        <InputBox
                            type="text"
                            placeholder="User"
                            text={userText}
                            setText={setUserText}
                        />
                        <InputBox
                            type="password"
                            placeholder="Password"
                            text={passwordText}
                            setText={setPasswordText}
                        />
                        <button
                            className="bg-fg2 text-fg px-5 h-6 mx-auto"
                            onClick={onClickSubmitButton}
                        >
                            Submit
                        </button>
                    </div>
                    {status === "" ? (
                        ""
                    ) : (
                        <div className="text-center mt-5">{status}</div>
                    )}
                </>
            ) : (
                <div className="flex justify-center">
                    <div className="text-center">{status}</div>
                    <button
                        className="bg-fg2 text-fg px-5 mx-5"
                        onClick={onClickLogoutButton}
                    >
                        Log out
                    </button>
                </div>
            )}
        </div>
    )
}
