from typing import Optional
from structs import Break
from compose import send_announce_email, write_announce_email
from config import parse_config
from database import after_announced_break, get_next_break, get_specific_breaks


def announce_break(cookie_break: Break) -> Break:
    email = write_announce_email(cookie_break)
    send_announce_email(email)
    return after_announced_break(cookie_break)


def announce():
    next_break = get_next_break()
    announce_break(next_break)


def announce_specific(id: int) -> Optional[Break]:
    specific_break = get_specific_breaks([id])
    if len(specific_break) == 0:
        return None
    return announce_break(specific_break[0])


if __name__ == "__main__":
    announce()
