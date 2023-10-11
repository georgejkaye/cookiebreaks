import { Cards } from "./cards"
import { Claim, UpdateClaimsFn, User } from "./structs"

export const ClaimCard = (props: { claim: Claim }) => (
    <div>{props.claim.date.toLocaleDateString()}</div>
)

export const ClaimCards = (props: {
    title: string
    user: User | undefined
    claims: Claim[]
    updateClaims: UpdateClaimsFn
    isLoadingClaims: boolean
}) => {
    const getCardColour = (c: Claim, isSelected: boolean) =>
        isSelected ? "bg-gray-100" : "bg-white"
    const getCardContent = (
        c: Claim,
        setLoading: (loading: boolean) => void
    ) => <ClaimCard claim={c} />
    return (
        <Cards
            title={props.title}
            isLoading={props.isLoadingClaims}
            elements={props.claims}
            getCardColour={getCardColour}
            getCardContent={getCardContent}
        />
    )
}
