import styles from "./loader.module.css"

export const Loader = (props: { size?: number }) => {
    let colour = "#f3f3f3"
    let colourSpin = "#3498db"
    return (
        <div
            style={{
                border: `5px solid ${colour}`,
                borderTop: `5px solid ${colourSpin}`,
                borderRadius: "50%",
                width: props.size ? props.size : 10,
                height: props.size ? props.size : 10,
            }}
            className={`${styles.loader} p-2 m-2 mx-auto`}
        />
    )
}

export default Loader
