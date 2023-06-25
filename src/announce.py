import os
import sys

from compose import create_calendar_event, prepare_email_in_thunderbird, send_announce_email, send_email, write_announce_email, write_email
from config import parse_config
from database import get_next_break


def main():
    config = parse_config()
    next_break = get_next_break(config)
    email = write_announce_email(config, next_break)
    send_announce_email(config, email)

if __name__ == "__main__":
    main()