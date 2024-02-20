from datetime import time
from decimal import Decimal
from typing import Annotated, Optional
from cookiebreaks.api.routers.users import is_admin
from cookiebreaks.core.database import select_settings
from cookiebreaks.core.structs import Settings, User
from fastapi import APIRouter, Depends


router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=Settings, summary="Get settings")
def get_settings():
    settings = select_settings()
    return settings


@router.post("", response_model=Settings, summary="Update settings")
def post_settings(
    user: Annotated[User, Depends(is_admin)],
    day: int,
    time: time,
    budget: Decimal,
    location: str,
):
    set_settings(day, time, budget, location)
