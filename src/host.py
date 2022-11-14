from config import parse_config
from database import insert_host
from interactive import select_break


def main():
    config = parse_config()
    chosen_break = select_break(config)
    if chosen_break is None:
        print("No choice made, exiting")
        exit(0)
    else:
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
    main()
