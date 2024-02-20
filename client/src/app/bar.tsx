import React, { Dispatch, SetStateAction, useState } from "react"
import { User, CookieBreak, Claim, Settings, Mode } from "./structs"
import Loader from "./loader"
import { getData, login } from "./api"
import { LoginModal, LogoutModal } from "./modals/login"
import { Data, SetState } from "./page"

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
    setUser: SetState<User | undefined>
    setBreaks: SetState<CookieBreak[]>
    setClaims: SetState<Claim[]>
    setLoadingLogin: SetState<boolean>
    user: User | undefined
    mode: Mode
    setMode: SetState<Mode>
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
            props.setClaims,
            props.setLoadingLogin
        )
        setPasswordText("")
    }
    return (
        <>
            <div
                className="hover:underline cursor-pointer px-2"
                onClick={(e) =>
                    props.mode === Mode.Main
                        ? props.setMode(Mode.Admin)
                        : props.setMode(Mode.Main)
                }
            >
                {!props.user ? "Login" : "Settings"}
            </div>
            {!props.user ? (
                <LoginModal
                    isOpen={isActive}
                    setOpen={setActive}
                    setUser={props.setUser}
                    setBreaks={props.setBreaks}
                    setClaims={props.setClaims}
                    setLoading={props.setLoadingLogin}
                    setStatus={setStatus}
                />
            ) : (
                <LogoutModal
                    isOpen={isActive}
                    user={props.user}
                    setOpen={setActive}
                    setUser={props.setUser}
                />
            )}
        </>
    )
}

const LoginRegion = (props: {
    setUser: SetState<User | undefined>
    setBreaks: SetState<CookieBreak[]>
    setClaims: SetState<Claim[]>
    user: User | undefined
    mode: Mode
    setMode: SetState<Mode>
}) => {
    const [isLoadingLogin, setLoadingLogin] = useState(false)
    return (
        <div>
            {isLoadingLogin ? (
                <Loader size={10} />
            ) : (
                <LoginButton
                    user={props.user}
                    setBreaks={props.setBreaks}
                    setClaims={props.setClaims}
                    setUser={props.setUser}
                    setLoadingLogin={setLoadingLogin}
                    mode={props.mode}
                    setMode={props.setMode}
                />
            )}
        </div>
    )
}

const RefreshButton = (props: {
    user: User | undefined
    setBreaks: SetState<CookieBreak[]>
    setClaims: SetState<Claim[]>
    setSettings: SetState<Settings | undefined>
    setLoadingData: SetState<boolean>
}) => {
    const onClickRefresh = (e: React.MouseEvent<HTMLButtonElement>) =>
        getData(
            props.user,
            props.setBreaks,
            props.setClaims,
            props.setSettings,
            props.setLoadingData
        )
    return <button onClick={onClickRefresh}>Refresh</button>
}

const RightButtons = (props: {
    setUser: SetState<User | undefined>
    setBreaks: SetState<CookieBreak[]>
    setClaims: SetState<Claim[]>
    setSettings: SetState<Settings | undefined>
    setLoadingData: SetState<boolean>
    user: User | undefined
    mode: Mode
    setMode: SetState<Mode>
}) => {
    return (
        <div className="ml-auto flex flex-row gap-5">
            <RefreshButton
                user={props.user}
                setBreaks={props.setBreaks}
                setClaims={props.setClaims}
                setSettings={props.setSettings}
                setLoadingData={props.setLoadingData}
            />
            <LoginRegion
                user={props.user}
                setBreaks={props.setBreaks}
                setClaims={props.setClaims}
                setUser={props.setUser}
                mode={props.mode}
                setMode={props.setMode}
            />
        </div>
    )
}

export const TopBar = (props: {
    setUser: SetState<User | undefined>
    setBreaks: SetState<CookieBreak[]>
    setClaims: SetState<Claim[]>
    setSettings: SetState<Settings | undefined>
    setLoadingData: SetState<boolean>
    user: User | undefined
    mode: Mode
    setMode: SetState<Mode>
}) => {
    return (
        <div className="flex items-center h-10 p-4 pr-2 bg-bg2 text-fg2">
            <div className="text-lg font-bold">Cookie breaks</div>
            <RightButtons
                user={props.user}
                setBreaks={props.setBreaks}
                setClaims={props.setClaims}
                setSettings={props.setSettings}
                setLoadingData={props.setLoadingData}
                setUser={props.setUser}
                mode={props.mode}
                setMode={props.setMode}
            />
        </div>
    )
}
