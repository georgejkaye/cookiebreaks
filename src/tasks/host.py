from config import parse_config
from database import insert_host
from interactive import select_break
from structs import BreakFilters


def host():
    config = parse_config()
    chosen_break = select_break(config, BreakFilters(past=False))
    if chosen_break is None:
        print("No choice made, exiting")
        exit(0)
    elif chosen_break.host is not None:
        overwrite = input(
            f"{chosen_break.host} is already hosting on {chosen_break.get_break_datetime()}, overwrite? (y/N) ")
        if not overwrite == "y":
            print("Aborting...")
            exit(0)
    host = input("Host name: ")
    if host == "":
        host_text = "nobody"
        host = None
    else:
        host_text = host
    check = input((
        f"Is {host_text} hosting the cookie break on "
        f"{chosen_break.get_break_datetime()}? (y/N) "
    ))
    if not check == "y":
        print("Aborting...")
        exit(0)
    else:
        insert_host(config, host, chosen_break.id)


if __name__ == "__main__":
    host()
