from email.utils import make_msgid
from pathlib import Path
import smtplib
import ssl
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


def send_email(config: Config, cookie_break: Break, email_content: str) -> None:
    email_sender = config.admin.email
    email_recipient = config.mailing_list
    if email_recipient is not None:
        # Get smtp variables
        smtp_host = config.smtp.host
        smtp_port = config.smtp.port
        smtp_user = config.smtp.user
        smtp_password = config.smtp.password
        # Make the message and fill in the fields
        message = MIMEMultipart("alternative")
        message["Subject"] = get_email_subject(cookie_break)
        message["From"] = email_sender
        message["To"] = email_recipient
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
                server.sendmail(email_sender, email_recipient,
                                message.as_string())
            except smtplib.SMTPResponseException as e:
                debug(config,
                      f"Error sending email from server {smtp_host}:{smtp_port} as user {smtp_user}: {e.smtp_code} {handle_str_or_bytes(e.smtp_error)}")
                exit(1)
        debug(config, f"Sent email to {email_recipient}")
