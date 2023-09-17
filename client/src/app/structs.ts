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

export const replaceBreaks = (
    oldBreaks: CookieBreak[],
    newBreaks: CookieBreak[]
) =>
    oldBreaks.map(
        (old) => newBreaks.find((newBreak) => newBreak.id === old.id) || old
    )

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
export const getFutureBreaks = (cbs: CookieBreak[]) =>
    cbs.filter((cb) => cb.datetime.getTime() > Date.now())
export const getOutstandingBreaks = (cbs: CookieBreak[]) =>
    cbs.filter((cb) => !cb.success && cb.datetime.getTime() <= Date.now())

export interface User {
    user: string
    admin: boolean
    token: string
}
