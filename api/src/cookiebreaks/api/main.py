from fastapi import FastAPI
import uvicorn

from cookiebreaks.api.routers import users, breaks, claims, debug
from cookiebreaks.core.env import get_env_path, load_envs

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


def start(reload: bool = False):
    load_envs()
    env_file = get_env_path()
    uvicorn.run("cookiebreaks.api.main:app", env_file=env_file, reload=reload)


def dev():
    start(reload=True)
