from datetime import timedelta, datetime
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from cookiebreaks.core.database import get_claim_objects, get_env_variable, get_user
from cookiebreaks.api.routers.utils import get_breaks, get_claims
from cookiebreaks.core.env import load_envs
from cookiebreaks.core.structs import BreakFilters, User

router = APIRouter(prefix="/users", tags=["users"])


def get_secret_key() -> str:
    return get_env_variable("SECRET_KEY")


ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/token", auto_error=False)


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


def verify_password(plain_password, hashed_password) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password) -> str:
    hashed_password = pwd_context.hash(password)
    return hashed_password


def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, get_secret_key(), algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: Annotated[Optional[str], Depends(oauth2_scheme)]):
    if token:
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(token, get_secret_key(), algorithms=[ALGORITHM])
            username: str | None = payload.get("sub")
            if username is None:
                raise credentials_exception
            user = get_user(username=username)
            if user is None:
                raise credentials_exception
            return user
        except JWTError:
            raise credentials_exception
    return None


async def is_admin(current_user: Annotated[User, Depends(get_current_user)]):
    if current_user and not current_user.admin:
        raise HTTPException(status_code=400, detail="Not an admin")
    return current_user


@router.post("/token", summary="Get an auth token")
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    number: Optional[int] = None,
    past: Optional[bool] = None,
    hosted: Optional[bool] = None,
    holiday: Optional[bool] = None,
    host_reimbursed: Optional[bool] = None,
    admin_claimed: Optional[bool] = None,
    admin_reimbursed: Optional[bool] = None,
):
    # Check the username and password
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Create an access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    # We return the breaks again in case some details have changed
    # e.g. higher privileges have been unlocked
    break_filters = BreakFilters(
        number,
        past,
        hosted,
        holiday,
        host_reimbursed,
        admin_claimed,
        admin_reimbursed,
    )
    breaks = get_breaks(current_user=user, filters=break_filters)
    if user.admin:
        claims = get_claims(current_user=user)
    else:
        claims = []
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "admin": user.admin,
        "breaks": breaks,
        "claims": claims
    }


@router.get("/me", summary="Get current user")
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user


@router.get("/admin", summary="Check if user is admin")
async def check_if_admin(current_user: Annotated[User, Depends(is_admin)]):
    return current_user
