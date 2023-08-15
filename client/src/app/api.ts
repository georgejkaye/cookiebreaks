import axios from "axios"
import { Dispatch, SetStateAction } from "react"
import { CookieBreak } from "./structs"

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
    }))
    console.log(data)
    setBreaks(breaks)
}
