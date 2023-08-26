import axios from "axios"
import { Dispatch, SetStateAction } from "react"
import { CookieBreak, User } from "./structs"

const dateOrUndefined = (datetime: string | undefined) =>
    datetime ? new Date(datetime) : undefined

const replaceBreaks = (oldBreaks: CookieBreak[], newBreaks: CookieBreak[]) =>
    oldBreaks.map(
        (old) => newBreaks.find((newBreak) => newBreak.id === old.id) || old
    )

const responseToBreak = (b: any) => ({
    id: b.id,
    host: b.host,
    datetime: new Date(b.break_time),
    location: b.location,
    cost: b.cost,
    announced: dateOrUndefined(b.break_announced),
    reimbursed: dateOrUndefined(b.host_reimbursed),
    claimed: dateOrUndefined(b.admin_claimed),
    success: dateOrUndefined(b.admin_reimbursed),
})

export const login = async (
    username: string,
    password: string,
    setToken: Dispatch<SetStateAction<string>>,
    setUser: Dispatch<SetStateAction<User | undefined>>,
    setStatus: Dispatch<SetStateAction<string>>,
    setBreaks: Dispatch<SetStateAction<CookieBreak[]>>,
    setLoading: Dispatch<SetStateAction<boolean>>
) => {
    let endpoint = `/api/users/token`
    let data = new FormData()
    data.append("username", username)
    data.append("password", password)
    data.append("grant_type", "")
    data.append("client_id", "")
    data.append("client_secret", "")
    if (username === "") {
        setStatus("Username cannot be empty")
    } else if (password === "") {
        setStatus("Password cannot be empty")
    } else {
        try {
            setLoading(true)
            let response = await axios.post(endpoint, data)
            let responseData = response.data
            setToken(responseData.access_token)
            setUser({ user: username, admin: responseData.admin })
            setBreaks(responseData.breaks.map(responseToBreak))
        } catch (err) {
            setStatus("Could not log in...")
        } finally {
            setLoading(false)
        }
    }
}

export const getBreaks = async (
    setBreaks: Dispatch<SetStateAction<CookieBreak[]>>
) => {
    let endpoint = `/api/breaks`
    let response = await axios.get(endpoint)
    let data = response.data
    let breaks = data.map(responseToBreak)
    setBreaks(breaks)
}

const headers = (token: string) => ({
    accept: "application/json",
    Authorization: `Bearer ${token}`,
})

export const announceBreak = async (
    token: string,
    id: number,
    oldBreaks: CookieBreak[],
    setBreaks: Dispatch<SetStateAction<CookieBreak[]>>
) => {
    let endpoint = `/api/breaks/announce`
    let config = {
        params: {
            break_id: id,
        },
        headers: headers(token),
    }
    let response = await axios.post(endpoint, null, config)
    let responseData = response.data
    setBreaks(replaceBreaks(oldBreaks, [responseToBreak(responseData)]))
}

export const reimburseBreak = async (
    token: string,
    id: number,
    cost: number,
    oldBreaks: CookieBreak[],
    setBreaks: Dispatch<SetStateAction<CookieBreak[]>>
) => {
    let endpoint = `/api/breaks/reimburse`
    let config = {
        params: {
            break_id: id,
            cost,
        },
        headers: headers(token),
    }
    let response = await axios.post(endpoint, null, config)
    let responseData = response.data
    setBreaks(replaceBreaks(oldBreaks, [responseToBreak(responseData)]))
}
