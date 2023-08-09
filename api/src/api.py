from typing import List, Optional
import arrow
from fastapi import FastAPI
from dotenv import find_dotenv, load_dotenv

from database import (
    claim_for_breaks,
    claim_reimbursed,
    get_break_objects,
    get_claims,
    insert_breaks,
    insert_host,
    reimburse_and_mask_host,
)
from structs import Break, BreakFilters, Claim, ClaimFilters

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

config = parse_config()

example_break = Break(0, arrow.now(), "LG06a, Computer Science", False, "George Kaye")


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
    return get_break_objects(
        config,
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


@app.post(
    "/host",
    response_model=List[Break],
    summary="Set the host of an upcoming cookie break",
    tags=["breaks"],
)
async def set_host(break_id: int, host_name: str):
    insert_host(config, host_name, break_id)
    return get_break_objects(config, BreakFilters(past=False))


@app.post(
    "/reimburse",
    response_model=List[Break],
    summary="Record the reimbursement of a host",
    tags=["breaks"],
)
async def reimburse_host(break_id: int, cost: float):
    reimburse_and_mask_host(config, break_id, cost)
    return get_break_objects(config, BreakFilters())


@app.get(
    "/claims",
    response_model=list[Claim],
    summary="Get a list of claims",
    tags=["claims"],
)
async def request_claims(reimbursed: Optional[bool] = None):
    return get_claims(config, ClaimFilters(reimbursed))


@app.post(
    "/claim",
    response_model=list[Claim],
    summary="Record a submitted expense claim",
    tags=["claims"],
)
async def claim_break(break_ids: list[int]):
    claim_for_breaks(config, break_ids)
    return get_claims(config)


@app.post(
    "/success",
    response_model=list[Claim],
    summary="Record a successful expense claim",
    tags=["claims"],
)
async def reimburse_admin(break_id: int):
    claim_reimbursed(config, break_id)


@app.post("/test", response_model=List[Break], tags=["debug"])
async def add_test_data(num: int):
    now = arrow.now("Europe/London").replace(second=0, microsecond=0)
    breaks = list(map(lambda i: (now, config.breaks.location), range(0, num)))
    insert_breaks(config, breaks)
    return get_break_objects(config, BreakFilters(host_reimbursed=False))
