import arrow
from config import Config
from structs import Break
from icalendar import Calendar, Event, vCalAddress, vText  # type: ignore


def get_cookiebreak_ics_filename(next_break: Break) -> str:
    date_string = next_break.break_time.strftime("%Y-%m-%d")
    return f"cookiebreak-{date_string}.ics"


def create_calendar_event(config: Config, next_break: Break) -> str:
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

    organizer = vCalAddress(f"mailto:{config.admin.email}")
    organizer.params["cn"] = config.admin.fullname
    event["organizer"] = organizer

    event["uid"] = f"cookiebreak/{next_break.break_time.datetime}"

    for list in config.mailing_lists:
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
