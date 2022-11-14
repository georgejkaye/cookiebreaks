from dataclasses import dataclass
from datetime import datetime


@dataclass
class Break:
    id: int
    host: str
    time: datetime
    location: str
    holiday: bool

    def get_break_time(self) -> str:
        return self.time.strftime("%H:%M")

    def get_break_date(self) -> str:
        return self.time.strftime("%A %d %B")

    def get_short_break_date(self) -> str:
        return self.time.strftime("%a %d %b")

    def get_break_datetime(self) -> str:
        return f"{self.get_break_date()} @ {self.get_break_time()}"
