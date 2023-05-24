import sys

from compose import prepare_email_in_thunderbird, send_email, write_email
from config import parse_config
from database import get_next_break


def main():
    config = parse_config()
    next_break = get_next_break(config)
    email = write_email(config, next_break, "announce.txt")
    print(email)
    prepare_email_in_thunderbird(config, next_break, email)
    # send_email(config, next_break, email)


if __name__ == "__main__":
    main()
