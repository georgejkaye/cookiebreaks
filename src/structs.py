import dataclasses
from dataclasses import field

from typing import List, Optional
from arrow import Arrow

from pydantic import BaseConfig, ConfigDict
from pydantic.dataclasses import dataclass
from pydantic.json import ENCODERS_BY_TYPE

BaseConfig.arbitrary_types_allowed = True

# Arrows get handled a bit weirdly by default pydantic behaviour
# so we declare that they are strings
ENCODERS_BY_TYPE |= {Arrow: str}

# We need to update the schema as well
Arrow.__modify_schema__ = lambda schema: schema.update(type="string")  # type: ignore


def format_as_price(cost: float) -> str:
    return f"£{cost:.2f}"


def format_as_iso8601(a: Arrow) -> str:
    return a.format("YYYY-MM-dd[T]HH:mm:ss[Z]ZZ")


def format_as_maybe_iso8601(a: Optional[Arrow]) -> Optional[str]:
    if a is None:
        return None
    return format_as_iso8601(a)


class BreakConfig:
    json_encoders = {Arrow: lambda x: x.isoformat()}


@dataclass(config=BreakConfig)
class Break:
    id: int = field(metadata=dict(example=21))
    break_time: Arrow = field(metadata=dict(example="2023-07-05T15:00:00+01:00"))
    location: str = field(metadata=dict(example="LG06a, Computer Science"))
    holiday: bool = field(metadata=dict(example=False))
    host: Optional[str] = field(default=None, metadata=dict(example="George Kaye"))
    cost: Optional[float] = field(default=None, metadata=dict(example=9.8))
    host_reimbursed: Optional[Arrow] = field(
        default=None, metadata=dict(example="2023-07-05T16:00+01:00")
    )
    admin_claimed: Optional[Arrow] = field(
        default=None, metadata=dict(example="2023-07-26T16:45:00+01:00")
    )
    admin_reimbursed: Optional[Arrow] = field(
        default=None, metadata=dict(example="2023-08-04T09:00:00+01:00")
    )

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


@dataclass
class Claim:
    id: int
    claim_date: Arrow
    breaks_claimed: List[Break]
    claim_amount: float
    claim_reimbursed: Optional[Arrow] = field(
        default=None, metadata=dict(example="2023-05-04T15:00")
    )


def claim_list_date_string(breaks: List[Break]) -> str:
    return ", ".join(list(map(lambda b: b.get_break_date(), breaks)))


@dataclass
class ClaimFilters:
    reimbursed: Optional[bool] = None
