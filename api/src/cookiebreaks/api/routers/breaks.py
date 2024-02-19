from datetime import datetime
from decimal import Decimal
from typing import Annotated, Optional
import arrow
from fastapi import APIRouter, Depends, HTTPException

from cookiebreaks.core.structs import Break, BreakFilters, User
from cookiebreaks.tasks.announce import announce_specific
from cookiebreaks.api.routers.utils import (
    BreakExternal,
    break_internal_to_external,
    get_breaks,
)
from cookiebreaks.core.database import (
    insert_breaks,
    insert_host,
    insert_missing_breaks,
    mask_host,
    reimburse_host,
    remove_break,
    set_holiday,
)
from cookiebreaks.api.routers.users import get_current_user, is_admin


router = APIRouter(prefix="/breaks", tags=["breaks"])


@router.get(
    "", response_model=list[BreakExternal], summary="Get a list of cookie breaks"
)
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
    "/insert",
    response_model=BreakExternal,
    summary="Insert a new cookie break",
)
async def insert_break(
    current_user: Annotated[User, Depends(is_admin)],
    break_datetime: datetime,
    location: str,
    host: Optional[str],
    email: Optional[str],
):
    new_break = insert_breaks([(arrow.get(break_datetime), location, host, email)])[0]
    return break_internal_to_external(new_break, current_user)


@router.post(
    "/host",
    response_model=BreakExternal,
    summary="Set the host of a cookie break",
)
async def set_host(
    current_user: Annotated[User, Depends(is_admin)],
    break_id: int,
    host_name: Optional[str] = None,
    host_email: Optional[str] = None,
):
    hosted_break = insert_host(break_id, host_name, host_email)
    if hosted_break is None:
        raise HTTPException(400, "BreakExternal does not exist")
    return break_internal_to_external(hosted_break, current_user)


@router.post(
    "/announce", response_model=BreakExternal, summary="Announce a cookie break"
)
async def announce_break(
    break_id: int, current_user: Annotated[User, Depends(is_admin)]
):
    announced_break = announce_specific(break_id)
    if announced_break is None:
        raise HTTPException(400, "Break does not exist")
    return break_internal_to_external(announced_break, current_user)


@router.post(
    "/reimburse",
    response_model=BreakExternal,
    summary="Record the reimbursement of someone who hosted a cookie break",
)
async def reimburse_break(
    current_user: Annotated[User, Depends(is_admin)], break_id: int, cost: Decimal
):
    reimbursed_break = reimburse_host(break_id, cost)
    return break_internal_to_external(reimbursed_break, current_user)


@router.post(
    "/mask",
    response_model=BreakExternal,
    summary="Remove the name of someone who hosted a cookie break",
)
async def mask_break(current_user: Annotated[User, Depends(is_admin)], break_id: int):
    reimbursed_break = mask_host(break_id)
    return break_internal_to_external(reimbursed_break, current_user)


@router.post(
    "/holiday",
    response_model=BreakExternal,
    summary="Set a cookie break to be a holiday with a specified reason",
)
async def post_holiday(
    current_user: Annotated[User, Depends(is_admin)],
    break_id: int,
    reason: Optional[str] = None,
):
    changed_break = set_holiday(break_id, reason)
    return break_internal_to_external(changed_break, current_user)


@router.delete("/{break_id}", response_model=None, summary="Delete a cookie break")
async def delete_break(
    current_user: Annotated[User, Depends(is_admin)],
    break_id: int,
):
    remove_break(break_id)


@router.post(
    "/update",
    response_model=list[BreakExternal],
    summary="Update the list of upcoming breaks",
)
async def post_update_breaks(current_user: Annotated[User, Depends(is_admin)]):
    breaks = insert_missing_breaks()
    return list(map(lambda b: break_internal_to_external(b, current_user), breaks))
