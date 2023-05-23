from dataclasses import dataclass
from datetime import datetime
from typing import Optional

def format_as_price(cost : float):
    return "£" + "{:.2f}".format(cost)

@dataclass
class Break:
    id: int
    host: str
    time: datetime
    location: str
    holiday: bool
    cost: float
    host_reimbursed: bool
    admin_claimed: bool
    admin_reimbursed: bool

    def get_break_time(self) -> str:
        return self.time.strftime("%H:%M")

    def get_break_date(self) -> str:
        return self.time.strftime("%A %d %B")

    def get_short_break_date(self) -> str:
        return self.time.strftime("%a %d %b")

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
