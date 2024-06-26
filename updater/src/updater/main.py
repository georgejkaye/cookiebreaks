from math import e
import os
from typing import Optional
import requests


def get_secret(file: str) -> str:
    if not os.path.isfile(file):
        raise FileNotFoundError(f"Secret file {file} not found")
    with open(file, "r") as f:
        secret = f.readline().replace("\n", "")
    return secret


def get_env_variable(name: str) -> str:
    var = os.getenv(name)
    if var:
        return var
    else:
        raise FileNotFoundError(f"Environment variable {name} not set")


def get_token(endpoint: str, user: str, password: str) -> Optional[str]:
    url = f"{endpoint}/users/token"
    headers = {
        "accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
    }
    data = {"username": user, "password": password}
    response = requests.post(url, headers=headers, data=data)
    if not response.status_code == 200:
        print("Could not get token")
        return None
    else:
        token = response.json()["access_token"]
        return token


def request_update(endpoint: str, token: str):
    url = f"{endpoint}/breaks/update"
    headers = {"accept": "application/json", "Authorization": f"Bearer {token}"}
    requests.post(url, headers=headers)


def main():
    endpoint = get_env_variable("API_ENDPOINT")
    token = get_token(
        endpoint,
        get_env_variable("API_USER"),
        get_secret(get_env_variable("API_PASSWORD")),
    )
    if token:
        request_update(endpoint, token)


if __name__ == "__main__":
    main()
