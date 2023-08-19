import arrow
from config import Config
from database import get_env_variable
from structs import Break
from icalendar import Calendar, Event, vCalAddress, vText  # type: ignore


def get_participants():
    return list(map(lambda x: x.strip(), get_env_variable("MAILING_LISTS").split(",")))


def get_cookiebreak_ics_filename(next_break: Break) -> str:
    date_string = next_break.break_time.strftime("%Y-%m-%d")
    return f"cookiebreak-{date_string}.ics"


def create_calendar_event(next_break: Break) -> str:
    cal = Calendar()
    cal.add(
        "prodid", "cookiebreaks - https://github.com/georgejkaye/cookiebreak-scripts"
    )
    cal.add("version", "2.0")
    cal.add("method", "REQUEST")

    event = Event()
    event.add("summary", f"Cookie break: {next_break.host}")
    event.add("dtstart", next_break.break_time.datetime)
    event.add("dtend", next_break.break_time.shift(hours=1).datetime)
    event.add("dtstamp", arrow.now().datetime)
    event.add("location", next_break.location)

    organizer = vCalAddress(f"mailto:{get_env_variable('ADMIN_EMAIL')}")
    organizer.params["cn"] = get_env_variable("ADMIN_FULLNAME")
    event["organizer"] = organizer

    event["uid"] = f"cookiebreak/{next_break.break_time.datetime}"

    attendees = get_participants()
    for list in attendees:
        attendee = vCalAddress(list)
        attendee.params["cutype"] = vText("GROUP")
        attendee.params["role"] = vText("REQ-PARTICIPANT")
        attendee.params["partstat"] = vText("NEEDS-ACTION")
        event.add("attendee", attendee, encode=0)
    cal.add_component(event)
    cal_text = cal.to_ical().decode()
    cal_text_fixed = cal_text.replace("BST", "Europe/London").replace(
        "GMT", "Europe/London"
    )
    return cal_text_fixed
