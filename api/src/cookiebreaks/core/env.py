import os
from pathlib import Path

from dotenv import load_dotenv


def get_env_variable(name: str) -> str:
    var = os.getenv(name)
    if var:
        return var
    else:
        print(f"Environment variable {name} not set")
        exit(1)


def get_env_path() -> Path:
    return Path(get_env_variable("CB_ROOT")) / "api" / ".env"


def load_envs():
    dotenv_path = get_env_path()
    load_dotenv(dotenv_path=dotenv_path)
