export const getDatetimeText = (datetime: Date) => {
    let date = getDateString(datetime)
    let time = getTimeString(datetime)
    return `${date} at ${time}`
}

export const dateInPast = (dt: Date) => dt.getTime() < Date.now()

export interface CookieBreak {
    id: number
    host: string
    location: string
    holiday?: string
    cost?: number
    datetime: Date
    announced?: Date
    reimbursed?: Date
    claimed?: Date
    success?: Date
}
export interface Claim {
    id: number
    date: Date
    breaks: CookieBreak[]
    amount: number
    reimbursed?: Date
}

export const breakInPast = (cb: CookieBreak) => dateInPast(cb.datetime)

export type UpdateBreaksFn = (
    breaksToAdd: CookieBreak[],
    breaksToRemove: CookieBreak[]
) => CookieBreak[]

export type UpdateClaimsFn = (
    claimsToAdd: Claim[],
    claimsToRemove: Claim[]
) => Claim[]

export const replaceItems = <T>(
    oldItems: T[],
    itemsToAdd: T[],
    itemsToRemove: T[],
    eqCheck: (t1: T, t2: T) => boolean
) =>
    oldItems
        .filter(
            (oldItem) =>
                !itemsToAdd.find((newItem) => eqCheck(oldItem, newItem)) &&
                !itemsToRemove.find((remItem) => eqCheck(oldItem, remItem))
        )
        .concat(itemsToAdd)

export const getDateString = (datetime: Date) => {
    let weekday = datetime.toLocaleDateString("en-GB", {
        weekday: "long",
        timeZone: "Europe/London",
    })
    let date = datetime.toLocaleDateString("en-GB", {
        day: "2-digit",
        timeZone: "Europe/London",
    })
    let month = datetime.toLocaleDateString("en-GB", {
        month: "long",
        timeZone: "Europe/London",
    })
    return `${weekday} ${date} ${month}`
}
export const getTimeString = (datetime: Date) => {
    let time = datetime.toLocaleTimeString("en-GB", {
        timeStyle: "short",
        timeZone: "Europe/London",
    })
    return time
}
export const getCookieBreakDate = (cb: CookieBreak) =>
    getDateString(cb.datetime)
export const getCookieBreakTime = (cb: CookieBreak) =>
    getTimeString(cb.datetime)
export const getFutureBreaks = (cbs: CookieBreak[]) => {
    let date = new Date()
    date.setHours(0, 0, 0, 0)
    return cbs.filter((cb) => cb.datetime.getTime() > date.getTime())
}
export const getOutstandingBreaks = (cbs: CookieBreak[]) => {
    let date = new Date()
    date.setHours(0, 0, 0, 0)
    return cbs.filter(
        (cb) => !cb.success && cb.datetime.getTime() < date.getTime()
    )
}
export const getBreaksToReimburse = (cbs: CookieBreak[]) =>
    cbs.filter((cb) => breakInPast(cb) && cb.host && !cb.reimbursed)
export const getBreaksToClaim = (cbs: CookieBreak[]) =>
    cbs.filter((cb) => cb.reimbursed && !cb.claimed)
export const getBreaksToComplete = (cbs: CookieBreak[]) =>
    cbs.filter((cb) => cb.claimed && !cb.success)

export interface User {
    user: string
    admin: boolean
    token: string
}

export const formatAsPrice = (cost: number) => `£${cost.toFixed(2)}`

export const getShortDate = (dt: Date) =>
    `${dt.getFullYear()}-${dt.getMonth().toString().padStart(2, "0")}-${dt
        .getDate()
        .toString()
        .padStart(2, "0")} ${dt.getHours().toString().padStart(2, "0")}:${dt
        .getMinutes()
        .toString()
        .padStart(2, "0")}`

export const getClaimsToComplete = (cs: Claim[]) =>
    cs.filter((c) => !c.reimbursed)
