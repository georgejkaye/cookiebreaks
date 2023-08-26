import os
import arrow
from fastapi import APIRouter
from cookiebreaks.core.database import get_break_objects, insert_breaks
from cookiebreaks.api.routers.utils import (
    BreakExternal as Break,
    break_internal_to_external,
)
from cookiebreaks.core.structs import BreakFilters

router = APIRouter(prefix="/debug", tags=["debug"])


@router.post("/", summary="Add test data", response_model=list[Break], tags=["debug"])
async def add_test_data(num: int):
    now = arrow.now("Europe/London").replace(day=+1, second=0, microsecond=0)
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
                lambda b: break_internal_to_external(b, None),
                get_break_objects(BreakFilters(host_reimbursed=False)),
            )
        )
