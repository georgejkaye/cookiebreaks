from typing import Optional

from cookiebreaks.core.structs import Break
from cookiebreaks.core.compose import send_announce_email, write_announce_email
from cookiebreaks.core.database import (
    after_announced_break,
    get_env_variable,
    get_next_break,
    get_specific_breaks,
)


def get_participants():
    return list(filter(len, get_env_variable("MAILING_LISTS").split(" ")))


def announce_break(cookie_break: Break) -> Break:
    participants = get_participants()
    email = write_announce_email(cookie_break, participants)
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
