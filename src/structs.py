import json
from typing import List, Optional
from pydantic import ConfigDict
from pydantic.dataclasses import dataclass
from arrow import Arrow


def format_as_price(cost: float) -> str:
    return f"£{cost:.2f}"


def format_as_iso8601(a: Arrow) -> str:
    return a.format("YYYY-MM-dd[T]HH:mm:ss[Z]ZZ")


def format_as_maybe_iso8601(a: Optional[Arrow]) -> Optional[str]:
    if a is None:
        return None
    return format_as_iso8601(a)


@dataclass(config=ConfigDict(arbitrary_types_allowed=True))
class Break:
    id: int
    host: Optional[str]
    break_time: Arrow
    location: str
    holiday: bool
    cost: Optional[float]
    host_reimbursed: Optional[Arrow]
    admin_claimed: Optional[Arrow]
    admin_reimbursed: Optional[Arrow]

    def get_break_time(self) -> str:
        return self.break_time.format("HH:mm")

    def get_break_date(self) -> str:
        return self.break_time.format("dddd DD MMMM")

    def get_short_break_date(self) -> str:
        return self.break_time.format("ddd DD MMM")

    def get_break_datetime(self) -> str:
        return f"{self.get_break_date()} @ {self.get_break_time()}"

    def to_json(self):
        return {
            "id": id,
            "host": self.host,
            "break_time": format_as_iso8601(self.break_time),
            "location": self.location,
            "holiday": self.holiday,
            "cost": self.cost,
            "host_reimbursed": format_as_maybe_iso8601(self.host_reimbursed),
            "admin_claimed": format_as_maybe_iso8601(self.admin_claimed),
            "admin_reimbursed": format_as_maybe_iso8601(self.admin_reimbursed),
        }


@dataclass
class BreakFilters:
    number: Optional[int] = None
    past: Optional[bool] = None
    hosted: Optional[bool] = None
    holiday: Optional[bool] = None
    host_reimbursed: Optional[bool] = None
    admin_claimed: Optional[bool] = None
    admin_reimbursed: Optional[bool] = None


@dataclass(config=ConfigDict(arbitrary_types_allowed=True))
class Claim:
    id: int
    claim_date: Arrow
    breaks_claimed: List[Break]
    claim_amount: float
    claim_reimbursed: Optional[Arrow] = None


def claim_list_date_string(breaks: List[Break]) -> str:
    return ", ".join(list(map(lambda b: b.get_break_date(), breaks)))


@dataclass
class ClaimFilters:
    reimbursed: Optional[bool] = None
