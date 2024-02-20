export const getDatetimeText = (datetime: Date) => {
    let date = getDateString(datetime)
    let time = getTimeString(datetime)
    return `${date} at ${time}`
}

export const dateInPast = (dt: Date) => dt.getTime() < Date.now()

export enum Mode {
    Main,
    Admin,
}

export interface CookieBreak {
    id: number
    host: string
    email?: string
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

export enum Day {
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
    Sunday,
}

export const dayNumberToDay = (d: number) =>
    d === 0
        ? Day.Monday
        : d === 1
        ? Day.Tuesday
        : d === 2
        ? Day.Wednesday
        : d === 3
        ? Day.Thursday
        : d === 4
        ? Day.Friday
        : d === 5
        ? Day.Saturday
        : Day.Sunday

export const dayToDayNumber = (d: Day) =>
    d === Day.Monday
        ? 0
        : d === Day.Tuesday
        ? 1
        : d === Day.Wednesday
        ? 2
        : d === Day.Thursday
        ? 3
        : d === Day.Friday
        ? 4
        : d === Day.Saturday
        ? 5
        : 6

export interface Settings {
    day: Day
    time: Date
    budget: number
    location: string
}

export const breakInPast = (cookieBreak: CookieBreak) =>
    dateInPast(cookieBreak.datetime)

export type UpdateFn<T> = (toAdd: T[], toRemove: T[]) => T[]

export const replaceItems = <T>(
    oldItems: T[],
    itemsToAdd: T[],
    itemsToRemove: T[],
    eqCheck: (t1: T, t2: T) => boolean,
    sortFn: (t1: T, t2: T) => number
) =>
    oldItems
        .filter(
            (oldItem) =>
                !itemsToAdd.find((newItem) => eqCheck(oldItem, newItem)) &&
                !itemsToRemove.find((remItem) => eqCheck(oldItem, remItem))
        )
        .concat(itemsToAdd)
        .sort(sortFn)

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
export const getDatetimeString = (datetime: Date) =>
    `${getDateString(datetime)}, ${getTimeString(datetime)}`
export const getCookieBreakDate = (cookieBreak: CookieBreak) =>
    getDateString(cookieBreak.datetime)
export const getCookieBreakTime = (cookieBreak: CookieBreak) =>
    getTimeString(cookieBreak.datetime)
export const getFutureBreaks = (cbs: CookieBreak[]) => {
    let date = new Date()
    date.setHours(0, 0, 0, 0)
    return cbs.filter(
        (cookieBreak) => cookieBreak.datetime.getTime() > date.getTime()
    )
}
export const getOutstandingBreaks = (cbs: CookieBreak[]) => {
    let date = new Date()
    date.setHours(0, 0, 0, 0)
    return cbs.filter(
        (cookieBreak) =>
            !cookieBreak.success &&
            cookieBreak.datetime.getTime() < date.getTime()
    )
}
export const getBreaksToReimburse = (cbs: CookieBreak[]) =>
    cbs.filter(
        (cookieBreak) =>
            breakInPast(cookieBreak) &&
            cookieBreak.host &&
            !cookieBreak.reimbursed
    )
export const getBreaksToClaim = (cbs: CookieBreak[]) =>
    cbs.filter((cookieBreak) => cookieBreak.reimbursed && !cookieBreak.claimed)
export const getBreaksToComplete = (cbs: CookieBreak[]) =>
    cbs.filter((cookieBreak) => cookieBreak.claimed && !cookieBreak.success)

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
