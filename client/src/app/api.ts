import axios from "axios"
import { Claim, CookieBreak, UpdateFn, User } from "./structs"
import { Data, SetState } from "./page"

const dateOrUndefined = (datetime: string | undefined) =>
    datetime ? new Date(datetime) : undefined

const responseToBreak = (b: any) => ({
    id: b.id,
    host: b.host,
    datetime: new Date(b.break_time),
    location: b.location,
    holiday: b.holiday,
    cost: parseFloat(b.cost),
    announced: dateOrUndefined(b.break_announced),
    reimbursed: dateOrUndefined(b.host_reimbursed),
    claimed: dateOrUndefined(b.admin_claimed),
    success: dateOrUndefined(b.admin_reimbursed),
})
const responseToBreaks = (bs: any[]) => bs.map(responseToBreak)

const responseToClaim = (c: any, breaks: CookieBreak[]): Claim => {
    let date = new Date(c.claim_date)
    let claimBreaks = c.breaks_claimed.map((id: number) => {
        const oldBreak = breaks.find((cookieBreak) => cookieBreak.id === id)
        return { ...oldBreak, claimed: date }
    })
    return {
        id: c.id,
        date: new Date(c.claim_date),
        breaks: claimBreaks,
        amount: parseFloat(c.claim_amount),
        reimbursed: dateOrUndefined(c.claim_reimbursed),
    }
}

export const login = async (
    username: string,
    password: string,
    setUser: SetState<User | undefined>,
    setStatus: SetState<string>,
    setBreaks: SetState<CookieBreak[]>,
    setClaims: SetState<Claim[]>,
    setLoading: SetState<boolean>
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
            let claimObjects = responseData.claims.map((c: any) =>
                responseToClaim(c, breakObjects)
            )
            setBreaks(breakObjects)
            setClaims(claimObjects)
        } catch (err) {
            console.log(err)
            setStatus("Could not log in...")
        } finally {
            setTimeout(() => setLoading(false), 1)
        }
    }
}

export const getData = async (
    user: User | undefined,
    setBreaks: SetState<CookieBreak[]>,
    setClaims: SetState<Claim[]>,
    setLoadingData: SetState<boolean>
) => {
    setLoadingData(true)
    let breaks = await getBreaks(user)
    let claims = await getClaims(user, breaks)
    setBreaks(breaks)
    setClaims(claims)
    setTimeout(() => setLoadingData(false))
}

export const getBreaks = async (user: User | undefined) => {
    let endpoint = `/api/breaks`
    let config = {
        headers: getHeaders(user),
    }
    let response = await axios.get(endpoint, config)
    let data = response.data
    let breaks = data.map(responseToBreak)
    return breaks
}

export const getClaims = async (
    user: User | undefined,
    breaks: CookieBreak[]
) => {
    if (!user || !user.admin) {
        return []
    } else {
        let endpoint = `/api/claims?reimbursed=false`
        let config = {
            headers: getHeaders(user),
        }
        let response = await axios.get(endpoint, config)
        let data = response.data
        let claims = data.map((c: any) => responseToClaim(c, breaks))
        return claims
    }
}

const getHeaders = (user: User | undefined) =>
    !user
        ? {}
        : {
              accept: "application/json",
              Authorization: `Bearer ${user.token}`,
          }

export const announceBreak = async (
    user: User | undefined,
    cookieBreak: CookieBreak,
    updateBreaks: UpdateFn<CookieBreak>,
    setLoadingCard: SetState<boolean>
) => {
    if (user) {
        let endpoint = `/api/breaks/announce`
        let config = {
            params: {
                break_id: cookieBreak.id,
            },
            headers: getHeaders(user),
        }
        setLoadingCard(true)
        let response = await axios.post(endpoint, null, config)
        let responseData = response.data
        updateBreaks([responseToBreak(responseData)], [])
        setTimeout(() => setLoadingCard(false), 1)
    }
}

export const reimburseBreak = async (
    user: User | undefined,
    cookieBreak: CookieBreak,
    cost: number,
    updateBreaks: UpdateFn<CookieBreak>,
    setLoadingCard: SetState<boolean>
) => {
    if (user) {
        let endpoint = `/api/breaks/reimburse`
        let config = {
            params: {
                break_id: cookieBreak.id,
                cost,
            },
            headers: getHeaders(user),
        }
        setLoadingCard(true)
        let response = await axios.post(endpoint, null, config)
        let responseData = response.data
        let newBreak = responseToBreak(responseData)
        updateBreaks([newBreak], [])
        setTimeout(() => setLoadingCard(false), 1)
    }
}

export const setHost = async (
    user: User,
    cookieBreak: CookieBreak,
    host: string,
    updateBreaks: UpdateFn<CookieBreak>,
    setLoadingCard: SetState<boolean>
) => {
    let actualHost = host === "" ? undefined : host
    let endpoint = `/api/breaks/host`
    let config = {
        params: {
            break_id: cookieBreak.id,
            host_name: actualHost,
        },
        headers: getHeaders(user),
    }
    setLoadingCard(true)
    let response = await axios.post(endpoint, null, config)
    let responseData = response.data
    updateBreaks([responseToBreak(responseData)], [])
    setTimeout(() => setLoadingCard(false), 1)
}

export const setHoliday = async (
    user: User | undefined,
    cookieBreak: CookieBreak,
    reason: string | undefined,
    updateBreaks: UpdateFn<CookieBreak>,
    setLoadingCard: SetState<boolean>
) => {
    if (user) {
        let endpoint = `/api/breaks/holiday`
        let config = {
            params: {
                break_id: cookieBreak.id,
                reason,
            },
            headers: getHeaders(user),
        }
        setLoadingCard(true)
        let response = await axios.post(endpoint, null, config)
        let responseData = response.data
        updateBreaks([responseToBreak(responseData)], [])
        setTimeout(() => setLoadingCard(false), 1)
    }
}

export const deleteBreak = async (
    user: User | undefined,
    cookieBreak: CookieBreak,
    updateBreaks: UpdateFn<CookieBreak>,
    setLoadingCard: SetState<boolean>
) => {
    if (user) {
        let endpoint = `/api/breaks/${cookieBreak.id}`
        let config = {
            headers: getHeaders(user),
        }
        setLoadingCard(true)
        await axios.delete(endpoint, config)
        updateBreaks([], [cookieBreak])
        setTimeout(() => setLoadingCard(false), 1)
    }
}

export const submitClaim = async (
    user: User | undefined,
    breaksToClaim: CookieBreak[],
    updateClaims: UpdateFn<Claim>,
    updateBreaks: UpdateFn<CookieBreak>,
    setLoadingCards: (loading: boolean) => void
) => {
    if (user) {
        let endpoint = `api/claims/claim`
        let config = {
            headers: getHeaders(user),
        }
        setLoadingCards(true)
        let response = await axios.post(
            endpoint,
            breaksToClaim.map((cookieBreak) => cookieBreak.id),
            config
        )
        let responseData = response.data
        let newClaim = responseToClaim(responseData, breaksToClaim)
        let claims = updateClaims([newClaim], [])
        updateBreaks(newClaim.breaks, [])
        setTimeout(() => setLoadingCards(false), 1)
    }
}

export const completeClaim = async (
    user: User | undefined,
    claim: Claim,
    breaks: CookieBreak[],
    updateClaims: UpdateFn<Claim>,
    setLoadingCard: SetState<boolean>
) => {
    if (user) {
        let endpoint = `api/claims/success`
        let config = {
            headers: getHeaders(user),
            params: {
                claim_id: claim.id,
            },
        }
        setLoadingCard(true)
        let response = await axios.post(endpoint, null, config)
        let responseData = response.data
        updateClaims([], [responseToClaim(responseData[0], breaks)])
        setTimeout(() => setLoadingCard(false), 1)
    }
}
