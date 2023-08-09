from dataclasses import dataclass
from datetime import datetime
import os
from typing import List, Optional
import arrow
from fastapi import FastAPI

from database import (
    claim_for_breaks,
    claim_reimbursed,
    get_break_objects,
    get_claims,
    insert_breaks,
    insert_host,
    reimburse_and_mask_host,
)
from structs import (
    Arrow,
    Break as BreakInternal,
    BreakFilters,
    Claim as ClaimInternal,
    ClaimFilters,
)


@dataclass
class Break:
    id: int
    break_time: datetime
    location: str
    holiday: bool
    host: Optional[str]
    cost: Optional[float]
    host_reimbursed: Optional[datetime]
    admin_claimed: Optional[datetime]
    admin_reimbursed: Optional[datetime]


def arrow_to_datetime(original: Arrow | None) -> datetime | None:
    if original:
        return original.datetime
    else:
        return None


def break_internal_to_external(internal: BreakInternal) -> Break:
    return Break(
        internal.id,
        internal.break_time.datetime,
        internal.location,
        internal.holiday,
        internal.host,
        internal.cost,
        arrow_to_datetime(internal.host_reimbursed),
        arrow_to_datetime(internal.admin_claimed),
        arrow_to_datetime(internal.admin_reimbursed),
    )


@dataclass
class Claim:
    id: int
    claim_date: datetime
    breaks_claimed: List[Break]
    claim_amount: float
    claim_reimbursed: Optional[datetime]


def claim_internal_to_external(internal: ClaimInternal) -> Claim:
    return Claim(
        internal.id,
        internal.claim_date.datetime,
        list(map(break_internal_to_external, internal.breaks_claimed)),
        internal.claim_amount,
        arrow_to_datetime(internal.claim_reimbursed),
    )


tags_metadata = [
    {"name": "breaks", "description": "Operations for interacting with cookie breaks"},
    {
        "name": "claims",
        "description": "Operations for interacting with expenses claims",
    },
    {"name": "debug", "description": "Debug operations"},
]

app = FastAPI(
    title="Cookie break API",
    summary="API for interacting with the cookie break database",
    version="1.0.0",
    contact={
        "name": "George Kaye",
        "email": "georgejkaye@gmail.com",
        "url": "https://georgejkaye.com",
    },
    license_info={
        "name": "GNU General Public License v3.0",
        "url": "https://www.gnu.org/licenses/gpl-3.0.en.html",
    },
    openapi_tags=tags_metadata,
)


@app.get(
    "/breaks",
    response_model=List[Break],
    summary="Get a list of cookie breaks",
    tags=["breaks"],
)
async def request_breaks(
    number: Optional[int] = None,
    past: Optional[bool] = None,
    hosted: Optional[bool] = None,
    holiday: Optional[bool] = None,
    host_reimbursed: Optional[bool] = None,
    admin_claimed: Optional[bool] = None,
    admin_reimbursed: Optional[bool] = None,
):
    breaks = get_break_objects(
        BreakFilters(
            number,
            past,
            hosted,
            holiday,
            host_reimbursed,
            admin_claimed,
            admin_reimbursed,
        ),
    )
    return list(map(break_internal_to_external, breaks))


@app.post(
    "/host",
    response_model=List[Break],
    summary="Set the host of an upcoming cookie break",
    tags=["breaks"],
)
async def set_host(break_id: int, host_name: str):
    insert_host(host_name, break_id)
    return get_break_objects(BreakFilters(past=False))


@app.post(
    "/reimburse",
    response_model=List[Break],
    summary="Record the reimbursement of a host",
    tags=["breaks"],
)
async def reimburse_host(break_id: int, cost: float):
    reimburse_and_mask_host(break_id, cost)
    return get_break_objects(BreakFilters())


@app.get(
    "/claims",
    response_model=list[Claim],
    summary="Get a list of claims",
    tags=["claims"],
)
async def request_claims(reimbursed: Optional[bool] = None):
    return get_claims(ClaimFilters(reimbursed))


@app.post(
    "/claim",
    response_model=list[Claim],
    summary="Record a submitted expense claim",
    tags=["claims"],
)
async def claim_break(break_ids: list[int]):
    claim_for_breaks(break_ids)
    claims = get_claims()
    return list(map(claim_internal_to_external, claims))


@app.post(
    "/success",
    response_model=list[Claim],
    summary="Record a successful expense claim",
    tags=["claims"],
)
async def reimburse_admin(break_id: int):
    claim_reimbursed(break_id)
    return list(map(claim_internal_to_external, get_claims()))


@app.post("/test", response_model=List[Break], tags=["debug"])
async def add_test_data(num: int):
    now = arrow.now("Europe/London").replace(second=0, microsecond=0)
    break_location = os.getenv("BREAK_LOCATION")
    if break_location is None:
        print("BREAK_LOCATION not set")
        exit(1)
    else:
        break_location_str: str = break_location
        breaks = list(map(lambda i: (now, break_location_str), range(0, num)))
        insert_breaks(breaks)
        return list(
            map(
                break_internal_to_external,
                get_break_objects(BreakFilters(host_reimbursed=False)),
            )
        )
