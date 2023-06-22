from dataclasses import dataclass
from typing import List, Optional

from arrow import Arrow


def format_as_price(cost: float) -> str:
    return f"£{cost:.2f}"


@dataclass
class Break:
    id: int
    host: Optional[str]
    time: Arrow
    location: str
    holiday: bool
    cost: Optional[float]
    host_reimbursed: Optional[Arrow]
    admin_claimed: Optional[Arrow]
    admin_reimbursed: Optional[Arrow]

    def get_break_time(self) -> str:
        return self.time.format("HH:mm")

    def get_break_date(self) -> str:
        return self.time.format("dddd DD MMMM")

    def get_short_break_date(self) -> str:
        return self.time.format("ddd DD MMM")

    def get_break_datetime(self) -> str:
        return f"{self.get_break_date()} @ {self.get_break_time()}"


@dataclass
class BreakFilters:
    number: Optional[int] = None
    past: Optional[bool] = None
    hosted: Optional[bool] = None
    holiday: Optional[bool] = None
    host_reimbursed: Optional[bool] = None
    admin_claimed: Optional[bool] = None
    admin_reimbursed: Optional[bool] = None


@dataclass
class Claim:
    id: int
    claim_date: Arrow
    breaks_claimed: List[Break]
    claim_amount: float
    claim_reimbursed: Optional[Arrow] = None


def claim_list_date_string(breaks: List[Break]) -> str:
    return ", ".join(list(
        map(lambda b: b.get_break_date(), breaks)))


@dataclass
class ClaimFilters:
    reimbursed: Optional[bool] = None
