from config import parse_config
from database import set_holiday
from interactive import select_break


def main():
    config = parse_config()
    chosen_break = select_break(config, past=False)
    if chosen_break is None:
        print("No choice made, exiting")
        exit(0)
    else:
        if chosen_break.holiday:
            choice = input(
                f"Make {chosen_break.get_break_datetime()} a non-holiday? (y/N) ")
            if choice == "y":
                holiday = False
            else:
                exit(0)
        else:
            choice = input(
                f"Make {chosen_break.get_break_datetime()} a holiday? (y/N) "
            )
            if choice == "y":
                holiday = True
            else:
                exit(0)
        set_holiday(config, chosen_break.id, holiday)


if __name__ == "__main__":
    main()
