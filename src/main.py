import sys

from compose import send_email, write_email
from config import parse_config
from database import get_next_break


def main(config_file: str):
    config = parse_config(config_file)
    next_break = get_next_break(config)
    email = write_email(config, next_break, "announce.txt")
    send_email(config, next_break, email)


if __name__ == "__main__":
    if(len(sys.argv) == 2):
        main(sys.argv[1])
    else:
        print(f"Usage: python {sys.argv[0]} <config file>")
