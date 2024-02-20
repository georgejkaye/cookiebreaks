from dataclasses import dataclass
from typing import Annotated
from cookiebreaks.api.routers.users import get_current_user
from cookiebreaks.api.routers.utils import (
    BreakExternal,
    ClaimExternal,
    get_breaks,
    get_claims,
)
from cookiebreaks.core.database import select_settings
from cookiebreaks.core.structs import Settings, User
from fastapi import APIRouter, Depends


router = APIRouter(prefix="/data", tags=["data"])


@dataclass
class Data:
    settings: Settings
    breaks: list[BreakExternal]
    claims: list[ClaimExternal]


@router.get("", response_model=Data, summary="Get all data")
def get_settings(
    current_user: Annotated[User, Depends(get_current_user)],
):
    settings = select_settings()
    breaks = get_breaks(current_user=current_user)
    claims = get_claims(current_user=current_user)
    return Data(settings, breaks, claims)
