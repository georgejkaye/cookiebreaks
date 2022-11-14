from datetime import date, datetime, time, timedelta

from config import parse_config
from database import insert_missing_breaks
from structs import Break


def get_next_date(next_day: date, offset: int, time: time) -> datetime:
    date = next_day + timedelta(offset * 7)
    return datetime.combine(date, time)


def main():
    config = parse_config()
    today = datetime.today().date()
    next_break_day_delta = (config.breaks.day - today.weekday()) % 7
    next_break_day = today + timedelta(days=next_break_day_delta)
    next_break_dates = list(map(
        lambda x: get_next_date(next_break_day, x, config.breaks.time),
        range(0, config.breaks.maximum)
    ))
    next_break_objects = list(map(
        lambda x: Break("", x, config.breaks.location),
        next_break_dates
    ))
    insert_missing_breaks(config, next_break_objects)


if __name__ == "__main__":
    main()
