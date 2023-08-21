from dataclasses import dataclass

from typing import List, Optional
from unittest.mock import Base
from arrow import Arrow


@dataclass
class User:
    username: str
    email: str
    admin: bool
    hashed_password: str


def format_as_price(cost: float) -> str:
    return f"£{cost:.2f}"


@dataclass
class Break:
    id: int
    break_time: Arrow
    location: str
    holiday: bool
    host: Optional[str] = None
    break_announced: Optional[Arrow] = None
    cost: Optional[float] = None
    host_reimbursed: Optional[Arrow] = None
    admin_claimed: Optional[Arrow] = None
    admin_reimbursed: Optional[Arrow] = None

    def get_break_time(self) -> str:
        return self.break_time.format("HH:mm")

    def get_break_date(self) -> str:
        return self.break_time.format("dddd DD MMMM")

    def get_short_break_date(self) -> str:
        return self.break_time.format("ddd DD MMM")

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
    return ", ".join(list(map(lambda b: b.get_break_date(), breaks)))


@dataclass
class ClaimFilters:
    reimbursed: Optional[bool] = None
