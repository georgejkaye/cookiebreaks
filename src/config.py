from dataclasses import dataclass
from datetime import datetime, time
from typing import List

import yaml

config_file = "config.yml"


@dataclass
class BreakConfig:
    day: int
    time: time
    location: str
    maximum: int


@dataclass
class AdminConfig:
    name: str

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
    db: DatabaseConfig
    mailing_lists: List[str]
    log_file: str


def parse_config() -> Config:
    with open(config_file, "r") as data:
        config = yaml.safe_load(data)
    return Config(
        BreakConfig(
            config["breaks"]["day"],
            datetime.strptime(str(config["breaks"]["time"]), "%H%M").time(),
            config["breaks"]["location"],
            config["breaks"]["maximum"],
        ),
        AdminConfig(
            config["admin"]["name"],
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
        now = datetime.now()
        timestamp = now.strftime("%d-%m-%y %H:%M:%S")
        log.write(f"[{timestamp}] {msg}\n")
