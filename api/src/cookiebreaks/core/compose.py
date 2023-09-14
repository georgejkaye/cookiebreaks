import subprocess

from email.encoders import encode_base64
from email.message import Message
from email.mime.base import MIMEBase
from email.utils import make_msgid, formataddr
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from pathlib import Path
from time import sleep
from typing import List, Tuple, Union
from jinja2 import Environment, FileSystemLoader, select_autoescape

from cookiebreaks.core.database import get_env_variable
from cookiebreaks.core.event import create_calendar_event, get_cookiebreak_ics_filename
from cookiebreaks.core.structs import Break
from cookiebreaks.core.config import Config


def write_email_template(cookie_break: Break, template_name: str) -> str:
    templates_dir = (
        Path(get_env_variable("CB_API_ROOT")) / "src" / "cookiebreaks" / "templates"
    )
    env = Environment(
        loader=FileSystemLoader(templates_dir),
        autoescape=select_autoescape(["html", "xml"]),
    )
    template = env.get_template(template_name)
    email = template.render(
        cookie_break=cookie_break, admin_name=get_env_variable("ADMIN_NAME")
    )
    return email


def get_announce_email_subject(cookie_break: Break) -> str:
    return f"[cookies] Cookie break this week, {cookie_break.get_short_break_date()} @ {cookie_break.get_break_time()}"


def handle_str_or_bytes(obj: Union[str, bytes]) -> str:
    if isinstance(obj, bytes):
        return obj.decode("UTF-8")
    return obj


def prepare_email_in_thunderbird(
    config: Config, next_break: Break, body: str, ics: str
):
    subject = get_announce_email_subject(next_break)
    subject_item = f"subject='{subject}'"
    emails = ", ".join(config.mailing_lists)
    to_item = f"to='{emails}'"
    from_item = f"from={config.admin.email}"
    body_item = f"body='{body}'"
    attachment_item = f"attachment='{ics}'"
    plain_text_item = "format=2"
    compose_items = ",".join(
        [to_item, from_item, subject_item, body_item, plain_text_item, attachment_item]
    )
    command = ["thunderbird", "-compose", compose_items]
    subprocess.run(command)
    window_title = f"Write: {subject} - Thunderbird"
    sleep(1)
    while True:
        wmctrl_output = str(subprocess.check_output(["wmctrl", "-l"]))
        if window_title not in wmctrl_output:
            return
        sleep(1)


def write_calendar_mime_parts(
    ics_content: str, ics_name: str
) -> Tuple[Message, Message]:
    ics_text = MIMEText(ics_content, "calendar;method=REQUEST")
    ics_attachment = MIMEBase("text", f"calendar;name={ics_name}")
    ics_attachment.set_payload(ics_content)
    encode_base64(ics_attachment)
    return (ics_text, ics_attachment)


def write_email(
    sender_name: str,
    sender_email: str,
    recipients: List[str],
    subject: str,
    content: List[Message],
) -> MIMEMultipart:
    message = MIMEMultipart("mixed")
    message["Subject"] = subject
    message["From"] = formataddr((sender_name, sender_email))
    message["To"] = ", ".join(recipients)
    message["Message-ID"] = make_msgid()
    for item in content:
        message.attach(item)
    return message


def write_announce_email(next_break: Break, recipients: list[str]) -> MIMEMultipart:
    announce_subject = get_announce_email_subject(next_break)
    ics_content = create_calendar_event(next_break, recipients)
    ics_name = get_cookiebreak_ics_filename(next_break)
    email_body = MIMEText(write_email_template(next_break, "announce.txt"))
    (ics_text, ics_attachment) = write_calendar_mime_parts(ics_content, ics_name)
    return write_email(
        sender_name=get_env_variable("ADMIN_FULLNAME"),
        sender_email=get_env_variable("ADMIN_EMAIL"),
        recipients=recipients,
        subject=announce_subject,
        content=[email_body, ics_text, ics_attachment],
    )


def send_email(email: MIMEMultipart):
    process = subprocess.Popen(
        [
            "msmtp",
            f"--file={get_env_variable('MSMTP_CONFIG_FILE')}",
            "--read-envelope-from",
            "--read-recipients",
        ],
        stdin=subprocess.PIPE,
    )
    process.communicate(email.as_bytes())


def send_announce_email(email: MIMEMultipart):
    send_email(email)
