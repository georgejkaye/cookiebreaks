import axios from "axios"
import { Dispatch, SetStateAction } from "react"
import {
    Claim,
    CookieBreak,
    UpdateBreaksFn,
    UpdateClaimsFn,
    User,
} from "./structs"
import { SetState } from "./breaks"

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
const responseToBreaks = (bs: any[]) => bs.map(responseToBreak)

const responseToClaim = (c: any, breaks: CookieBreak[]) => ({
    id: c.id,
    date: new Date(c.claim_date),
    breaks: c.breaks_claimed.map((id: number) =>
        breaks.find((cb) => cb.id === id)
    ),
    amount: c.claim_amount,
    reimbursed: dateOrUndefined(c.claim_reimbursed),
})

export const login = async (
    username: string,
    password: string,
    setUser: Dispatch<SetStateAction<User | undefined>>,
    setStatus: Dispatch<SetStateAction<string>>,
    setBreaks: Dispatch<SetStateAction<CookieBreak[]>>,
    setClaims: Dispatch<SetStateAction<Claim[]>>,
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
            let breakObjects = responseData.breaks.map(responseToBreak)
            setBreaks(breakObjects)
            let claimObjects = responseData.claims.map((c: any) =>
                responseToClaim(c, breakObjects)
            )
            setClaims(claimObjects)
        } catch (err) {
            console.log(err)
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
    setTimeout(() => setLoadingBreaks(false), 1)
}

export const getClaims = async (
    setClaims: SetState<Claim[]>,
    setLoadingClaims: SetState<boolean>
) => {
    let endpoint = `/api/claims`
    setLoadingClaims(true)
    let response = await axios.get(endpoint)
    let data = response.data
    let claims = data.map(responseToClaim)
    setClaims(claims)
    setTimeout(() => setLoadingClaims(true), 1)
}

const headers = (token: string) => ({
    accept: "application/json",
    Authorization: `Bearer ${token}`,
})

export const announceBreak = async (
    user: User,
    id: number,
    updateBreaks: UpdateBreaksFn,
    setLoadingCard: (loading: boolean) => void
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
    setTimeout(() => setLoadingCard(false), 1)
}

export const reimburseBreak = async (
    user: User,
    id: number,
    cost: number,
    updateBreaks: UpdateBreaksFn,
    setLoadingCard: (loading: boolean) => void
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
    setTimeout(() => setLoadingCard(false), 1)
}

export const setHost = async (
    user: User,
    id: number,
    host: string,
    updateBreaks: UpdateBreaksFn,
    setLoadingCard: (loading: boolean) => void
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
    updateBreaks([responseToBreak(responseData)], [])
    setTimeout(() => setLoadingCard(false), 1)
}

export const setHoliday = async (
    user: User,
    id: number,
    reason: string | undefined,
    updateBreaks: UpdateBreaksFn,
    setLoadingCard: (loading: boolean) => void
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
    updateBreaks([responseToBreak(responseData)], [])
    setTimeout(() => setLoadingCard(false), 1)
}

export const deleteBreak = async (
    user: User,
    cb: CookieBreak,
    updateBreaks: UpdateBreaksFn,
    setLoadingCard: (loading: boolean) => void
) => {
    let endpoint = `/api/breaks/${cb.id}`
    let config = {
        headers: headers(user.token),
    }
    setLoadingCard(true)
    await axios.delete(endpoint, config)
    updateBreaks([], [cb])
    setTimeout(() => setLoadingCard(false), 1)
}

export const submitClaim = async (
    user: User,
    cbs: CookieBreak[],
    updateBreaks: UpdateBreaksFn,
    updateClaims: UpdateClaimsFn,
    setLoadingCards: (loading: boolean) => void
) => {
    let endpoint = `api/claims/claim`
    let config = {
        headers: headers(user.token),
    }
    setLoadingCards(true)
    let response = await axios.post(
        endpoint,
        cbs.map((cb) => cb.id),
        config
    )
    let responseData = response.data
    let updatedBreaks = responseData.breaks
    let updatedClaims = responseData.claims
    let breaks = updateBreaks(responseToBreaks(updatedBreaks), [])
    updateClaims([responseToClaim(updatedClaims, breaks)], [])
    setTimeout(() => setLoadingCards(false), 1)
}
