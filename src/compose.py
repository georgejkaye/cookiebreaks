import os
import smtplib
import ssl
import subprocess

from email.utils import make_msgid, formataddr
from pathlib import Path
from time import sleep
from ics import Event, Calendar, Attendee # type: ignore
from typing import Union
from jinja2 import Environment, FileSystemLoader, select_autoescape
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from structs import Break
from config import Config, debug


def write_email(config: Config, cookie_break: Break, template_name: str) -> str:
    current_dir = Path(__file__).resolve().parent
    templates_dir = current_dir / "templates"
    env = Environment(
        loader=FileSystemLoader(templates_dir),
        autoescape=select_autoescape(["html", "xml"])
    )
    template = env.get_template(template_name)
    email = template.render(cookie_break=cookie_break, admin=config.admin)
    return email


def get_email_subject(cookie_break: Break) -> str:
    return f"[cookies] Next cookie break, {cookie_break.get_short_break_date()} @ {cookie_break.get_break_time()}"


def handle_str_or_bytes(obj: Union[str, bytes]) -> str:
    if(isinstance(obj, bytes)):
        return obj.decode('UTF-8')
    return obj

def get_cookiebreak_ics_file(next_break: Break) -> str:
    date_string = next_break.time.strftime("%Y-%m-%d")
    return f"cookiebreak-{date_string}.ics"

def create_calendar_event(config: Config, next_break: Break) -> str:
    c = Calendar()
    c.method = "REQUEST"
    e = Event()
    e.name = f"Cookie break: {next_break.host}"
    e.begin = next_break.time
    e.end = next_break.time.shift(hours=1)
    e.location = next_break.location
    e.organizer = config.admin.email
    for list in config.mailing_lists:
        e.add_attendee(Attendee(list, cutype="GROUP", role="REQ-PARTICIPANT", partstat="NEEDS-ACTION", rsvp="TRUE"))
    c.events.add(e)
    file_name = get_cookiebreak_ics_file(next_break)
    with open(file_name, "w", encoding="ISO-8859-1") as f:
        f.writelines(c.serialize_iter())
    return os.path.abspath(file_name)


def prepare_email_in_thunderbird(config: Config, next_break: Break, body: str, ics: str):
    subject = get_email_subject(next_break)
    subject_item = f"subject='{subject}'"
    emails = ", ".join(config.mailing_lists)
    to_item = f"to='{emails}'"
    from_item = f"from={config.admin.email}"
    body_item = f"body='{body}'"
    attachment_item = f"attachment='{ics}'"
    plain_text_item = "format=2"
    compose_items = ",".join(
        [to_item, from_item, subject_item, body_item, plain_text_item, attachment_item])
    command = ["thunderbird", "-compose", compose_items]
    subprocess.run(command)
    window_title = f"Write: {subject} - Thunderbird"
    sleep(1)
    while True:
        wmctrl_output = str(subprocess.check_output(["wmctrl", "-l"]))
        if window_title not in wmctrl_output:
            return
        sleep(1)

def send_email(config: Config, cookie_break: Break, email_content: str) -> None:
    email_sender = config.admin.email
    email_recipients = config.mailing_lists
    if len(email_recipients) > 0:
        # Get smtp variables
        smtp_host = config.smtp.host
        smtp_port = config.smtp.port
        smtp_user = config.smtp.user
        smtp_password = config.smtp.password
        # Make the message and fill in the fields
        message = MIMEMultipart("alternative")
        message["Subject"] = get_email_subject(cookie_break)
        message["From"] = formataddr(
            (config.admin.full_name, email_sender))
        message["To"] = ", ".join(email_recipients)
        message["Message-ID"] = make_msgid()
        text = MIMEText(email_content, "plain")
        message.attach(text)
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(smtp_host, smtp_port, context=context) as server:
            try:
                server.login(smtp_user, smtp_password)
            except smtplib.SMTPResponseException as e:
                debug(config,
                      f"Error logging into server {smtp_host}:{smtp_port} as user {smtp_user}: {e.smtp_code} {handle_str_or_bytes(e.smtp_error)}")
                exit(1)

            try:
                server.sendmail(email_sender, email_recipients,
                                message.as_string())
            except smtplib.SMTPResponseException as e:
                debug(config,
                      f"Error sending email from server {smtp_host}:{smtp_port} as user {smtp_user}: {e.smtp_code} {handle_str_or_bytes(e.smtp_error)}")
                exit(1)
        debug(config, f"Sent email to {email_recipients}")
