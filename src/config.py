import yaml
from dataclasses import dataclass
from datetime import datetime


@dataclass
class AdminConfig:
    full_name: str
    short_name: str
    email: str


@dataclass
class SMTPConfig:
    host: str
    port: int
    user: str
    password: str


@dataclass
class DatabaseConfig:
    host: str
    user: str
    database: str
    password: str


@dataclass
class Config:
    admin: AdminConfig
    smtp: SMTPConfig
    db: DatabaseConfig
    mailing_list: str
    log_file: str


def parse_config(config_file: str) -> Config:
    with open(config_file, "r") as data:
        config = yaml.safe_load(data)
    return Config(
        AdminConfig(
            config["admin"]["fullname"],
            config["admin"]["shortname"],
            config["admin"]["email"]
        ),
        SMTPConfig(
            config["smtp"]["host"],
            int(config["smtp"]["port"]),
            config["smtp"]["user"],
            config["smtp"]["password"]
        ),
        DatabaseConfig(
            config["db"]["host"],
            config["db"]["user"],
            config["db"]["database"],
            config["db"]["password"]
        ),
        config["list"],
        config["log"]
    )


def debug(config: Config, msg: str) -> None:
    with open(config.log_file, "a+") as log:
        now = datetime.now()
        timestamp = now.strftime("%d-%m-%y %H:%M:%S")
        log.write(f"[{timestamp}] {msg}\n")
