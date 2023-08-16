import axios from "axios"
import { Dispatch, SetStateAction } from "react"
import { CookieBreak } from "./structs"

const dateOrUndefined = (datetime: string | undefined) =>
    datetime ? new Date(datetime) : undefined

export const getBreaks = async (
    setBreaks: Dispatch<SetStateAction<CookieBreak[]>>
) => {
    let endpoint = `/api/breaks`
    let response = await axios.get(endpoint)
    let data = response.data
    console.log(data)
    let breaks = data.map((b: any) => ({
        id: b.id,
        host: b.host,
        datetime: new Date(b.break_time),
        location: b.location,
        cost: b.cost,
        announced: dateOrUndefined(b.break_announced),
        reimbursed: dateOrUndefined(b.host_reimbursed),
        claimed: dateOrUndefined(b.admin_claimed),
        success: dateOrUndefined(b.admin_reimbursed),
    }))
    console.log(data)
    setBreaks(breaks)
}
