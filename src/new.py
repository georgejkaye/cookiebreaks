from datetime import date, datetime, time, timedelta

from config import parse_config
from database import get_next_breaks


def get_next_date(next_day: date, offset: int, time: time) -> datetime:
    date = next_day + timedelta(offset * 7)
    return datetime.combine(date, time)


def main():
    config = parse_config()
    today = datetime.today().date()
    next_break_day_delta = (config.breaks.day - today.weekday()) % 7
    next_break_day = today + timedelta(days=next_break_day_delta)
    next_breaks = list(map(
        lambda x: get_next_date(next_break_day, x, config.breaks.time),
        range(0, config.breaks.maximum)
    ))
    print(next_breaks)


if __name__ == "__main__":
    main()
