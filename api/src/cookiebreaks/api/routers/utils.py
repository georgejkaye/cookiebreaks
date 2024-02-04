from datetime import datetime
from decimal import Decimal
from typing import Literal, Optional

from arrow import Arrow
from cookiebreaks.core.database import get_break_objects, get_claim_objects
from cookiebreaks.core.structs import (
    BreakFilters,
    User,
    Break as BreakInternal,
    Claim as ClaimInternal,
)
from dataclasses import dataclass


@dataclass
class BreakExternal:
    id: int
    break_time: datetime
    location: str
    holiday: Optional[str]
    host: Optional[str]
    break_announced: Optional[datetime]
    cost: Optional[Decimal]
    host_reimbursed: Optional[datetime]
    admin_claimed: Optional[datetime]
    claim_id: Optional[int]
    admin_reimbursed: Optional[datetime]


def arrow_to_datetime(original: Arrow) -> datetime:
    return original.datetime


def maybe_arrow_to_datetime(original: Arrow | None) -> datetime | None:
    if original:
        return original.datetime
    else:
        return None


def break_internal_to_external(
    internal: BreakInternal, current_user: Optional[User]
) -> BreakExternal:
    if current_user and current_user.admin:
        break_announced = maybe_arrow_to_datetime(internal.break_announced)
        if internal.cost:
            cost = Decimal(internal.cost)
        else:
            cost = None
        host_reimbursed = maybe_arrow_to_datetime(internal.host_reimbursed)
        admin_claimed = maybe_arrow_to_datetime(internal.admin_claimed)
        admin_reimbursed = maybe_arrow_to_datetime(internal.admin_reimbursed)
        claim_id = internal.claim_id
    else:
        break_announced = None
        cost = None
        host_reimbursed = None
        admin_claimed = None
        admin_reimbursed = None
        claim_id = None
    return BreakExternal(
        internal.id,
        internal.break_time.datetime,
        internal.location,
        internal.holiday,
        internal.host,
        break_announced,
        cost,
        host_reimbursed,
        admin_claimed,
        claim_id,
        admin_reimbursed,
    )


@dataclass
class ClaimExternal:
    id: int
    claim_date: datetime
    breaks_claimed: list[int]
    claim_amount: Decimal | Literal[0]
    claim_reimbursed: Optional[datetime]


def claim_internal_to_external(internal: ClaimInternal) -> ClaimExternal:
    return ClaimExternal(
        internal.id,
        arrow_to_datetime(internal.claim_date),
        internal.breaks_claimed,
        internal.claim_amount,
        maybe_arrow_to_datetime(internal.claim_reimbursed),
    )


def get_breaks(
    filters: BreakFilters = BreakFilters(), current_user: Optional[User] = None
) -> list[BreakExternal]:
    breaks = get_break_objects(filters)
    return list(map(lambda b: break_internal_to_external(b, current_user), breaks))


def get_claims(current_user: Optional[User] = None) -> list[ClaimExternal]:
    claims = get_claim_objects()
    return list(map(lambda c: claim_internal_to_external(c), claims))
