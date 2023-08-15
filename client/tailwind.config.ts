import type { Config } from "tailwindcss"

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            width: {
                content: "96rem",
            },
            colors: {
                bg: "#f7f7f7",
                fg: "#4c4c4c",
                bg2: "#605270",
                fg2: "#ffffff",
            },
        },
    },
    plugins: [],
}
export default config
