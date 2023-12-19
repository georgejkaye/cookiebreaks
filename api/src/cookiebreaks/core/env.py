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


def get_secret(name: str) -> str:
    file = get_env_variable(name)
    if os.path.exists(file):
        with open(file) as f:
            secret = f.readline().replace("\n", "")
    else:
        raise RuntimeError(f"Secret file {file} does not exist")
    return secret


def get_env_path() -> Path:
    return Path(get_env_variable("CB_API_ROOT")) / ".env"


def load_envs():
    dotenv_path = get_env_path()
    load_dotenv(dotenv_path=dotenv_path)
