import React, { Dispatch, SetStateAction, useState } from "react"
import { User, CookieBreak } from "./structs"
import Loader from "./loader"
import { login } from "./api"

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
            className="text-black h-8 p-2 mx-1 bg-white rounded-2xl border w-full tablet:w-1/4 desktop:w-1/3"
            type={props.type}
            placeholder={props.placeholder}
            value={props.text}
            onChange={onChangeText}
        />
    )
}

const LoginButton = (props: {
    setUser: Dispatch<SetStateAction<User | undefined>>
    setBreaks: Dispatch<SetStateAction<CookieBreak[]>>
    setLoadingLogin: Dispatch<SetStateAction<boolean>>
    user: User | undefined
}) => {
    const [isActive, setActive] = useState(false)
    const [userText, setUserText] = useState("")
    const [passwordText, setPasswordText] = useState("")
    const [status, setStatus] = useState("")
    const toggleLoginButton = (e: React.MouseEvent<HTMLDivElement>) =>
        setActive(!isActive)
    const clickLoginButton = (e: React.MouseEvent<HTMLDivElement>) => {
        setStatus("")
        login(
            userText,
            passwordText,
            props.setUser,
            setStatus,
            props.setBreaks,
            props.setLoadingLogin
        )
        setPasswordText("")
    }
    return isActive ? (
        <div className="flex items-center justify-end">
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
            <div
                className="hover:underline cursor-pointer px-2"
                onClick={clickLoginButton}
            >
                Login
            </div>
            <div
                className="hover:underline cursor-pointer px-2"
                onClick={toggleLoginButton}
            >
                Cancel
            </div>
        </div>
    ) : (
        <div
            className="hover:underline cursor-pointer px-2"
            onClick={toggleLoginButton}
        >
            Login
        </div>
    )
}

const LoginBar = (props: {
    setUser: Dispatch<SetStateAction<User | undefined>>
    setBreaks: Dispatch<SetStateAction<CookieBreak[]>>
    user: User | undefined
}) => {
    const [isLoadingLogin, setLoadingLogin] = useState(false)
    return (
        <div className="ml-auto">
            {isLoadingLogin ? (
                <Loader size={10} />
            ) : props.user ? (
                <div>{props.user.user}</div>
            ) : (
                <LoginButton
                    user={props.user}
                    setBreaks={props.setBreaks}
                    setUser={props.setUser}
                    setLoadingLogin={setLoadingLogin}
                />
            )}
        </div>
    )
}

export const TopBar = (props: {
    setUser: Dispatch<SetStateAction<User | undefined>>
    setBreaks: Dispatch<SetStateAction<CookieBreak[]>>
    user: User | undefined
}) => {
    return (
        <div className="flex items-center h-10 p-4 pr-2 bg-bg2 text-fg2">
            <div className="text-lg font-bold">Cookie breaks</div>
            <LoginBar
                user={props.user}
                setBreaks={props.setBreaks}
                setUser={props.setUser}
            />
        </div>
    )
}
