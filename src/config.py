import os
from dataclasses import dataclass
from pathlib import Path
from typing import List
from arrow import Arrow
import arrow

import yaml

this_source_file = os.path.dirname(os.path.abspath(__file__))
config_file = Path(this_source_file) / ".." / "config.yml"


@dataclass
class BreakConfig:
    day: int
    time: Arrow
    location: str
    maximum: int


@dataclass
class AdminConfig:
    name: str
    fullname: str
    email: str

@dataclass
class MSMTPConfig:
    account: str

@dataclass
class DatabaseConfig:
    host: str
    user: str
    database: str
    password: str


@dataclass
class Config:
    breaks: BreakConfig
    admin: AdminConfig
    msmtp: MSMTPConfig
    db: DatabaseConfig
    mailing_lists: List[str]
    log_file: str


def parse_config() -> Config:
    with open(config_file, "r") as data:
        config = yaml.safe_load(data)
    return Config(
        BreakConfig(
            config["breaks"]["day"],
            arrow.get(str(config["breaks"]["time"]), "HHmm"),
            config["breaks"]["location"],
            config["breaks"]["maximum"],
        ),
        AdminConfig(
            config["admin"]["name"],
            config["admin"]["fullname"],
            config["admin"]["email"]
        ),
        MSMTPConfig(
            config["msmtp"]["account"]
        ),
        DatabaseConfig(
            config["db"]["host"],
            config["db"]["user"],
            config["db"]["database"],
            config["db"]["password"]
        ),
        config["lists"],
        config["log"]
    )


def debug(config: Config, msg: str) -> None:
    with open(config.log_file, "a+") as log:
        now = arrow.now("Europe/London")
        timestamp = now.format("YYYY-MM-DD HH:mm:ss")
        log.write(f"[{timestamp}] {msg}\n")
