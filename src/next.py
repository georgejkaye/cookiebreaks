from datetime import date, datetime, time, timedelta

from config import parse_config
from database import insert_missing_breaks
from structs import Break


def get_next_date(next_day: date, offset: int, time: time) -> datetime:
    date = next_day + timedelta(offset * 7)
    return datetime.combine(date, time)


def main():
    config = parse_config()
    insert_missing_breaks(config)


if __name__ == "__main__":
    main()
