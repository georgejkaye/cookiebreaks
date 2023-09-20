from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException

from cookiebreaks.api.routers.utils import (
    BreakExternal as Break,
    break_internal_to_external,
)
from cookiebreaks.core.database import (
    get_break_objects,
    insert_host,
    reimburse_host,
    set_holiday,
)
from cookiebreaks.api.routers.users import get_current_user, is_admin
from cookiebreaks.api.routers.utils import get_breaks
from cookiebreaks.core.structs import BreakFilters, User
from cookiebreaks.tasks.announce import announce_specific


router = APIRouter(prefix="/breaks", tags=["breaks"])


@router.get("", response_model=list[Break], summary="Get a list of cookie breaks")
async def request_breaks(
    current_user: Annotated[User, Depends(get_current_user)],
    number: Optional[int] = None,
    past: Optional[bool] = None,
    hosted: Optional[bool] = None,
    holiday: Optional[bool] = None,
    host_reimbursed: Optional[bool] = None,
    admin_claimed: Optional[bool] = None,
    admin_reimbursed: Optional[bool] = None,
):
    break_filters = BreakFilters(
        number,
        past,
        hosted,
        holiday,
        host_reimbursed,
        admin_claimed,
        admin_reimbursed,
    )
    return get_breaks(break_filters, current_user)


@router.post(
    "/host",
    response_model=Break,
    summary="Set the host of a cookie break",
)
async def set_host(
    current_user: Annotated[User, Depends(is_admin)],
    break_id: int,
    host_name: Optional[str] = None,
):
    hosted_break = insert_host(host_name, break_id)
    if hosted_break is None:
        raise HTTPException(400, "Break does not exist")
    return break_internal_to_external(hosted_break, current_user)


@router.post("/announce", response_model=Break, summary="Announce a cookie break")
async def announce_break(
    break_id: int, current_user: Annotated[User, Depends(is_admin)]
):
    announced_break = announce_specific(break_id)
    if announced_break is None:
        raise HTTPException(400, "Break does not exist")
    return break_internal_to_external(announced_break, current_user)


@router.post(
    "/reimburse",
    response_model=Break,
    summary="Record the reimbursement of someone who hosted a cookie break",
)
async def reimburse_host(
    current_user: Annotated[User, Depends(is_admin)], break_id: int, cost: float
):
    reimbursed_break = reimburse_host(break_id, cost)
    return break_internal_to_external(reimbursed_break, current_user)


@router.post(
    "/holiday",
    response_model=Break,
    summary="Set a cookie break to be a holiday with a specified reason",
)
async def post_holiday(
    current_user: Annotated[User, Depends(is_admin)], break_id: int, reason: str
):
    changed_break = set_holiday(break_id, reason)
    return break_internal_to_external(changed_break, current_user)
