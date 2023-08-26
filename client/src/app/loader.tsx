import styles from "./loader.module.css"

export const Loader = (props: { margin?: number; size?: number }) => {
    let size = `${props.size ? props.size : 25}px`
    return (
        <div
            style={{ width: size, height: size }}
            className={`${styles.loader} mx-auto my-${
                props.margin ? props.margin : "0"
            }`}
        />
    )
}

export default Loader
