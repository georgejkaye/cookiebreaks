import styles from "./loader.module.css"

export const Loader = (props: { size?: number; styles?: string }) => {
    let colour = "#f3f3f3"
    let colourSpin = "#3498db"
    let divStyles = `mx-auto ${props.styles ? props.styles : ""}`
    return (
        <div className={divStyles}>
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
        </div>
    )
}

export default Loader
