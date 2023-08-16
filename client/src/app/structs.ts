export const getDatetimeText = (datetime: Date) => {
    console.log(datetime)
    let isoString = datetime.toISOString()
    let date = isoString.substring(0, 10)
    let time = isoString.substring(11, 16)
    return `${date} at ${time}`
}

export const dateInPast = (dt: Date) => dt.getTime() < Date.now()

export interface CookieBreak {
    id: number
    host: string
    location: string
    cost?: number
    datetime: Date
    announced?: Date
    reimbursed?: Date
    claimed?: Date
    success?: Date
}

export const getCookieBreakDate = (cb: CookieBreak) => {
    let weekday = cb.datetime.toLocaleDateString("en-GB", {
        weekday: "long",
        timeZone: "Europe/London",
    })
    let date = cb.datetime.toLocaleDateString("en-GB", {
        day: "2-digit",
        timeZone: "Europe/London",
    })
    let month = cb.datetime.toLocaleDateString("en-GB", {
        month: "long",
        timeZone: "Europe/London",
    })
    return `${weekday} ${date} ${month}`
}
export const getCookieBreakTime = (cb: CookieBreak) => {
    let time = cb.datetime.toLocaleTimeString("en-GB", {
        timeStyle: "short",
        timeZone: "Europe/London",
    })
    return time
}
export const getFutureBreaks = (cbs: CookieBreak[]) =>
    // cbs.filter((cb) => cb.datetime.getTime() > Date.now())
    cbs
