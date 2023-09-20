import axios from "axios"
import { Dispatch, SetStateAction } from "react"
import { CookieBreak, User } from "./structs"

const dateOrUndefined = (datetime: string | undefined) =>
    datetime ? new Date(datetime) : undefined

const responseToBreak = (b: any) => ({
    id: b.id,
    host: b.host,
    datetime: new Date(b.break_time),
    location: b.location,
    holiday: b.holiday,
    cost: b.cost,
    announced: dateOrUndefined(b.break_announced),
    reimbursed: dateOrUndefined(b.host_reimbursed),
    claimed: dateOrUndefined(b.admin_claimed),
    success: dateOrUndefined(b.admin_reimbursed),
})

export const login = async (
    username: string,
    password: string,
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
            setUser({
                user: username,
                admin: responseData.admin,
                token: responseData.access_token,
            })
            setBreaks(responseData.breaks.map(responseToBreak))
        } catch (err) {
            setStatus("Could not log in...")
        } finally {
            setLoading(false)
        }
    }
}

export const getBreaks = async (
    setBreaks: Dispatch<SetStateAction<CookieBreak[]>>,
    setLoadingBreaks: Dispatch<SetStateAction<boolean>>
) => {
    let endpoint = `/api/breaks`
    setLoadingBreaks(true)
    let response = await axios.get(endpoint)
    let data = response.data
    let breaks = data.map(responseToBreak)
    setBreaks(breaks)
    setLoadingBreaks(false)
}

const headers = (token: string) => ({
    accept: "application/json",
    Authorization: `Bearer ${token}`,
})

export const announceBreak = async (
    user: User,
    id: number,
    updateBreaks: (
        breaksToAdd: CookieBreak[],
        breaksToRemove: CookieBreak[]
    ) => void,
    setLoadingCard: Dispatch<SetStateAction<boolean>>
) => {
    let endpoint = `/api/breaks/announce`
    let config = {
        params: {
            break_id: id,
        },
        headers: headers(user.token),
    }
    setLoadingCard(true)
    let response = await axios.post(endpoint, null, config)
    let responseData = response.data
    updateBreaks([responseToBreak(responseData)], [])
    setLoadingCard(false)
}

export const reimburseBreak = async (
    user: User,
    id: number,
    cost: number,
    updateBreaks: (
        breaksToAdd: CookieBreak[],
        breaksToRemove: CookieBreak[]
    ) => void,
    setLoadingCard: Dispatch<SetStateAction<boolean>>
) => {
    let endpoint = `/api/breaks/reimburse`
    let config = {
        params: {
            break_id: id,
            cost,
        },
        headers: headers(user.token),
    }
    setLoadingCard(true)
    let response = await axios.post(endpoint, null, config)
    let responseData = response.data
    updateBreaks([responseToBreak(responseData)], [])
    setLoadingCard(false)
}

export const setHost = async (
    user: User,
    id: number,
    host: string,
    updateBreaks: (
        breaksToAdd: CookieBreak[],
        breaksToRemove: CookieBreak[]
    ) => void,
    setLoadingCard: Dispatch<SetStateAction<boolean>>
) => {
    let actualHost = host === "" ? undefined : host
    let endpoint = `/api/breaks/host`
    let config = {
        params: {
            break_id: id,
            host_name: actualHost,
        },
        headers: headers(user.token),
    }
    setLoadingCard(true)
    let response = await axios.post(endpoint, null, config)
    let responseData = response.data
    console.log(responseData)
    updateBreaks([responseToBreak(responseData)], [])
    setLoadingCard(false)
}

export const setHoliday = async (
    user: User,
    id: number,
    reason: string | undefined,
    updateBreaks: (
        breaksToAdd: CookieBreak[],
        breaksToRemove: CookieBreak[]
    ) => void,
    setLoadingCard: Dispatch<SetStateAction<boolean>>
) => {
    let endpoint = `/api/breaks/holiday`
    let config = {
        params: {
            break_id: id,
            reason,
        },
        headers: headers(user.token),
    }
    setLoadingCard(true)
    let response = await axios.post(endpoint, null, config)
    let responseData = response.data
    console.log(responseData)
    updateBreaks([responseToBreak(responseData)], [])
    setLoadingCard(false)
}

export const deleteBreak = async (
    user: User,
    cb: CookieBreak,
    updateBreaks: (
        breaksToAdd: CookieBreak[],
        breaksToRemove: CookieBreak[]
    ) => void,
    setLoadingCard: Dispatch<SetStateAction<boolean>>
) => {
    let endpoint = `/api/breaks/${cb.id}`
    let config = {
        headers: headers(user.token),
    }
    setLoadingCard(true)
    await axios.delete(endpoint, config)
    updateBreaks([], [cb])
}
