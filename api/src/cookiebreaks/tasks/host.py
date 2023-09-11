from cookiebreaks.core.database import insert_host
from cookiebreaks.core.structs import BreakFilters

from cookiebreaks.cli.interactive import select_break


def host():
    chosen_break = select_break(BreakFilters(past=False))
    if chosen_break is None:
        print("No choice made, exiting")
        exit(0)
    elif chosen_break.host is not None:
        overwrite = input(
            f"{chosen_break.host} is already hosting on {chosen_break.get_break_datetime()}, overwrite? (y/N) "
        )
        if not overwrite == "y":
            print("Aborting...")
            exit(0)
    host = input("Host name: ")
    if host == "":
        host_text = "nobody"
        host = None
    else:
        host_text = host
    check = input(
        (
            f"Is {host_text} hosting the cookie break on "
            f"{chosen_break.get_break_datetime()}? (y/N) "
        )
    )
    if not check == "y":
        print("Aborting...")
        exit(0)
    else:
        insert_host(host, chosen_break.id)


if __name__ == "__main__":
    host()
