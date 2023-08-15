export interface CookieBreak {
    id: number
    host: string
    location: string
    datetime: Date
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
    let time = cb.datetime.toLocaleTimeString("en-GB", {
        timeStyle: "short",
        timeZone: "Europe/London",
    })

    return `${weekday} ${date} ${month} @ ${time}`
}
