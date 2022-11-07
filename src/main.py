from datetime import datetime
import sys
from compose import send_email, write_email
from config import parse_config
from structs import Break


def main(config_file: str):
    config = parse_config(config_file)
    test_break = Break(
        "George Kaye",
        datetime.now(),
        "LG06a"
    )
    email = write_email(config, test_break, "announce.txt")
    send_email(config, test_break, email)


if __name__ == "__main__":
    if(len(sys.argv) == 2):
        main(sys.argv[1])
