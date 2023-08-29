from fastapi import FastAPI

from cookiebreaks.api.routers import users, breaks, claims, debug
from cookiebreaks.core.env import get_env_path, get_env_variable, load_envs

tags_metadata = [
    {"name": "users", "description": "Authenticate users"},
    {"name": "breaks", "description": "Operations for interacting with cookie breaks"},
    {
        "name": "claims",
        "description": "Operations for interacting with expenses claims",
    },
    {"name": "debug", "description": "Debug operations"},
]

app = FastAPI(
    title="Cookie break API",
    summary="API for interacting with the cookie break database",
    version="1.0.0",
    contact={
        "name": "George Kaye",
        "email": "georgejkaye@gmail.com",
        "url": "https://georgejkaye.com",
    },
    license_info={
        "name": "GNU General Public License v3.0",
        "url": "https://www.gnu.org/licenses/gpl-3.0.en.html",
    },
    openapi_tags=tags_metadata,
)

app.include_router(users.router)
app.include_router(breaks.router)
app.include_router(claims.router)
app.include_router(debug.router)

import uvicorn


def start(reload: bool = False):
    load_envs()
    env_file = get_env_path()
    uvicorn.run(
        "cookiebreaks.api.main:app",
        env_file=env_file,
        host="0.0.0.0",
        port=int(get_env_variable("API_PORT")),
        reload=reload,
    )


def dev():
    start(reload=True)


def deploy():
    start()


if __name__ == "__main__":
    deploy()
