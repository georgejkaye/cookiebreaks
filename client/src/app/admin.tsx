import { useEffect, useState } from "react"
import { SetState } from "./page"
import {
    User,
    CookieBreak,
    Claim,
    Settings,
    Day,
    dayNumberToDay,
    formatAsPrice,
    Mode,
} from "./structs"
import { login, postSettings } from "./api"
import { TailSpin } from "react-loader-spinner"

const LoginPage = (props: {
    setUser: SetState<User | undefined>
    setBreaks: SetState<CookieBreak[]>
    setClaims: SetState<Claim[]>
    setLoadingData: SetState<boolean>
    user: User | undefined
    setMode: SetState<Mode>
}) => {
    const [userText, setUserText] = useState("")
    const [passwordText, setPasswordText] = useState("")
    const [errorText, setErrorText] = useState("")
    const [isLoading, setLoading] = useState(false)
    const onSubmit = async () => {
        let result = await login(
            userText,
            passwordText,
            props.setUser,
            setErrorText,
            props.setBreaks,
            props.setClaims,
            setLoading
        )
        if (result === 0) {
            props.setMode(Mode.Main)
        }
    }
    const onClickSubmitButton = (e: React.MouseEvent<HTMLButtonElement>) => {
        onSubmit()
    }
    const onUserTextChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setUserText(e.target.value)
    const onPasswordTextChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setPasswordText(e.target.value)
    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSubmit()
        }
    }
    return (
        <div>
            <h1 className="text-2xl font-bold">Admin login</h1>
            <form>
                <div className="flex flex-col mb-5 align-center">
                    <div>
                        <input
                            autoFocus
                            className="border-2 p-2 my-2"
                            type="text"
                            id="user"
                            name="user"
                            placeholder="User"
                            value={userText}
                            onChange={onUserTextChange}
                            onKeyDown={onKeyDown}
                            required
                        />
                    </div>
                    <div>
                        <input
                            className="border-2 p-2 my-2"
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Password"
                            value={passwordText}
                            onChange={onPasswordTextChange}
                            onKeyDown={onKeyDown}
                            required
                        />
                    </div>
                    {isLoading ? (
                        <TailSpin
                            wrapperClass="m-10 justify-center"
                            height={50}
                        />
                    ) : (
                        ""
                    )}
                </div>
            </form>
        </div>
    )
}

const SettingsPage = (props: {
    user: User
    settings: Settings
    setUser: SetState<User | undefined>
    setMode: SetState<Mode>
}) => {
    const onClickLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
        props.setUser(undefined)
        props.setMode(Mode.Main)
    }
    const onClickSave = (e: React.MouseEvent<HTMLButtonElement>) => {
        let budgetNumber = Number.parseFloat(budgetText)
        if (isNaN(budgetNumber)) {
        } else {
            postSettings(
                props.user,
                selectedDay,
                new Date(`1970-01-01T${selectedTime}`),
                locationText,
                budgetNumber
            )
        }
    }
    const [selectedDay, setSelectedDay] = useState(props.settings.day)
    const [selectedTime, setSelectedTime] = useState(
        props.settings.time.toTimeString().substring(0, 5)
    )
    const [budgetText, setBudgetText] = useState(
        props.settings.budget.toFixed(2)
    )
    const [locationText, setLocationText] = useState(props.settings.location)
    const onChangeDay = (e: React.ChangeEvent<HTMLSelectElement>) =>
        setSelectedDay(dayNumberToDay(Number.parseInt(e.target.value)))
    const onChangeTime = (e: React.ChangeEvent<HTMLInputElement>) =>
        setSelectedTime(e.target.value)
    const onChangeBudgetText = (e: React.ChangeEvent<HTMLInputElement>) =>
        setBudgetText(e.target.value)
    const onChangeLocationText = (e: React.ChangeEvent<HTMLInputElement>) =>
        setLocationText(e.target.value)
    const settingHeaderStyle = "font-bold my-2"
    return (
        <div>
            <h1 className="text-2xl font-bold mb-2">Settings</h1>
            <div className="flex flex-row items-center">
                <div>
                    Logged in as{" "}
                    <span className="font-bold">{props.user?.user}</span>
                </div>
                <button
                    className="m-4 p-2 border-2 bg-white border-bg2 rounded hover:bg-gray-300"
                    onClick={onClickLogout}
                >
                    Logout
                </button>
            </div>
            <div className="flex flex-col items-start mb-4">
                <div className={settingHeaderStyle}>Day</div>
                <select value={selectedDay} onChange={onChangeDay}>
                    <option value={0}>Monday</option>
                    <option value={1}>Tuesday</option>
                    <option value={2}>Wednesday</option>
                    <option value={3}>Thursday</option>
                    <option value={4}>Friday</option>
                    <option value={5}>Saturday</option>
                    <option value={6}>Sunday</option>
                </select>
            </div>
            <div className="flex flex-col items-start mb-4">
                <div className={settingHeaderStyle}>Time</div>
                <input
                    type="time"
                    value={selectedTime}
                    onChange={onChangeTime}
                />
            </div>
            <div className="flex flex-col items-start mb-4">
                <div className={settingHeaderStyle}>Budget</div>
                <input
                    className="border-2 p-2 my-2"
                    type="text"
                    size={15}
                    value={budgetText}
                    onChange={onChangeBudgetText}
                />
            </div>
            <div className="flex flex-col items-start mb-4">
                <div className={settingHeaderStyle}>Location</div>
                <input
                    className="border-2 p-2 my-2"
                    type="text"
                    size={30}
                    value={locationText}
                    onChange={onChangeLocationText}
                />
            </div>
            <button
                className="mt-4 p-2 border-2 bg-white border-bg2 rounded hover:bg-gray-300"
                onClick={onClickSave}
            >
                Save
            </button>
        </div>
    )
}

export const AdminPage = (props: {
    setUser: SetState<User | undefined>
    setBreaks: SetState<CookieBreak[]>
    setClaims: SetState<Claim[]>
    setLoadingData: SetState<boolean>
    user: User | undefined
    setMode: SetState<Mode>
    settings: Settings | undefined
}) => {
    return (
        <div>
            {!props.user ? (
                <LoginPage
                    setUser={props.setUser}
                    setBreaks={props.setBreaks}
                    setClaims={props.setClaims}
                    setLoadingData={props.setLoadingData}
                    user={props.user}
                    setMode={props.setMode}
                />
            ) : !props.settings ? (
                ""
            ) : (
                <SettingsPage
                    user={props.user}
                    setUser={props.setUser}
                    setMode={props.setMode}
                    settings={props.settings}
                />
            )}
        </div>
    )
}
