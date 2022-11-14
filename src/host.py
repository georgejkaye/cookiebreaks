from datetime import date, datetime, time, timedelta

from config import parse_config
from database import get_next_breaks, insert_host, insert_missing_breaks
from interactive import select_break
from structs import Break


def get_next_date(next_day: date, offset: int, time: time) -> datetime:
    date = next_day + timedelta(offset * 7)
    return datetime.combine(date, time)


def main():
    config = parse_config()
    chosen_break = select_break(config)
    if chosen_break is None:
        print("No choice made, exiting")
        exit(0)
    else:
        host = input("Host name: ")
        check = input((
            f"Is {host} hosting the cookie break on "
            f"{chosen_break.get_break_datetime()}? (y/N) "
        ))
        if not check == "y":
            print("Aborting...")
            exit(0)
        else:
            insert_host(config, host, chosen_break.id)


if __name__ == "__main__":
    main()
