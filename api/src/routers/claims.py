from typing import Annotated, Optional
from fastapi import APIRouter, Depends

from routers.utils import ClaimExternal as Claim
from database import claim_for_breaks, claim_reimbursed, get_claims
from routers.users import is_admin
from routers.utils import claim_internal_to_external
from structs import ClaimFilters, User

router = APIRouter(prefix="/claims", tags=["claims"])


@router.get(
    "", response_model=list[Claim], summary="Get a list of submitted expense claims"
)
async def request_claims(
    current_user: Annotated[User, Depends(is_admin)], reimbursed: Optional[bool] = None
):
    claims = get_claims(ClaimFilters(reimbursed))
    return list(map(lambda c: claim_internal_to_external(c, current_user), claims))


@router.post(
    "/claim", response_model=list[Claim], summary="Record a submitted expense claim"
)
async def claim_break(
    current_user: Annotated[User, Depends(is_admin)], break_ids: list[int]
):
    claim_for_breaks(break_ids)
    claims = get_claims()
    return list(map(lambda c: claim_internal_to_external(c, current_user), claims))


@router.post(
    "/success", response_model=list[Claim], summary="Record a successful expense claim"
)
async def reimburse_admin(
    current_user: Annotated[User, Depends(is_admin)], break_id: int
):
    claim_reimbursed(break_id)
    return list(
        map(lambda c: claim_internal_to_external(c, current_user), get_claims())
    )
