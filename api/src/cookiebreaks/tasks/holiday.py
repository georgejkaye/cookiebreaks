from cookiebreaks.core.database import set_holiday
from cookiebreaks.core.structs import BreakFilters
from cookiebreaks.cli.interactive import select_break


def holiday():
    chosen_break = select_break(BreakFilters(past=False))
    if chosen_break is None:
        print("No choice made, exiting")
        exit(0)
    else:
        reason = input(f"Reason for holiday on {chosen_break.get_break_datetime()}? ")
        if reason == "":
            set_holiday(chosen_break.id)
        else:
            set_holiday(chosen_break.id, reason)


if __name__ == "__main__":
    holiday()
