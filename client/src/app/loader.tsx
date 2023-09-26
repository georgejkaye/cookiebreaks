import styles from "./loader.module.css"

export const Loader = (props: { margin?: number; size?: number }) => {
    let size = `${props.size ? props.size : 25}px`
    let margin = props.margin ? `m-${props.margin}` : ""
    let colour = "#f3f3f3"
    let colourSpin = "#3498db"
    return (
        <div
            style={{
                border: `${size} solid ${colour}`,
                borderTop: `${size} solid ${colourSpin}`,
                borderRadius: "50%",
            }}
            className={`${styles.loader} p-2 m-2 mx-auto h-${size}`}
        />
    )
}

export default Loader
