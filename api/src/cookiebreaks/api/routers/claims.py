from dataclasses import dataclass
from typing import Annotated, Optional
from fastapi import APIRouter, Depends

from cookiebreaks.core.database import (
    claim_for_breaks,
    claim_reimbursed,
    get_claim_objects,
)
from cookiebreaks.core.structs import ClaimFilters, User
from cookiebreaks.api.routers.utils import (
    BreakExternal,
    ClaimExternal,
    break_internal_to_external,
    claim_internal_to_external,
)
from cookiebreaks.api.routers.users import is_admin

router = APIRouter(prefix="/claims", tags=["claims"])


@router.get(
    "",
    response_model=list[ClaimExternal],
    summary="Get a list of submitted expense claims",
)
async def request_claims(
    current_user: Annotated[User, Depends(is_admin)], reimbursed: Optional[bool] = None
):
    claims = get_claim_objects(ClaimFilters(reimbursed))
    return list(map(lambda c: claim_internal_to_external(c), claims))


@dataclass
class BreakAndClaim:
    breaks: list[BreakExternal]
    claim: ClaimExternal


@router.post(
    "/claim", response_model=ClaimExternal, summary="Record a submitted expense claim"
)
async def claim_break(
    current_user: Annotated[User, Depends(is_admin)], break_ids: list[int]
):
    updated_claim = claim_for_breaks(break_ids)
    external_claim = claim_internal_to_external(updated_claim)
    return external_claim


@router.post(
    "/success",
    response_model=list[ClaimExternal],
    summary="Record a successful expense claim",
)
async def reimburse_admin(
    current_user: Annotated[User, Depends(is_admin)], claim_id: int
):
    claim_reimbursed(claim_id)
    return list(map(lambda c: claim_internal_to_external(c), get_claim_objects()))
