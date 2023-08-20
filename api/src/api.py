from dataclasses import dataclass
from datetime import datetime, timedelta
import os
from pathlib import Path
from typing import Annotated, List, Optional
import arrow
from dotenv import load_dotenv
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import (
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm,
)


from database import (
    claim_for_breaks,
    claim_reimbursed,
    get_break_objects,
    get_claims,
    get_env_variable,
    insert_breaks,
    insert_host,
    reimburse_and_mask_host,
)
from structs import (
    Arrow,
    Break as BreakInternal,
    BreakFilters,
    Claim as ClaimInternal,
    ClaimFilters,
)
from tasks.announce import announce, announce_specific


@dataclass
class Break:
    id: int
    break_time: datetime
    location: str
    holiday: bool
    host: Optional[str]
    break_announced: Optional[datetime]
    cost: Optional[float]
    host_reimbursed: Optional[datetime]
    admin_claimed: Optional[datetime]
    admin_reimbursed: Optional[datetime]


def arrow_to_datetime(original: Arrow | None) -> datetime | None:
    if original:
        return original.datetime
    else:
        return None


def break_internal_to_external(internal: BreakInternal) -> Break:
    return Break(
        internal.id,
        internal.break_time.datetime,
        internal.location,
        internal.holiday,
        internal.host,
        arrow_to_datetime(internal.break_announced),
        internal.cost,
        arrow_to_datetime(internal.host_reimbursed),
        arrow_to_datetime(internal.admin_claimed),
        arrow_to_datetime(internal.admin_reimbursed),
    )


@dataclass
class Claim:
    id: int
    claim_date: datetime
    breaks_claimed: List[Break]
    claim_amount: float
    claim_reimbursed: Optional[datetime]


def claim_internal_to_external(internal: ClaimInternal) -> Claim:
    return Claim(
        internal.id,
        internal.claim_date.datetime,
        list(map(break_internal_to_external, internal.breaks_claimed)),
        internal.claim_amount,
        arrow_to_datetime(internal.claim_reimbursed),
    )


tags_metadata = [
    {"name": "auth", "description": "Authenticate users"},
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

SECRET_KEY = get_env_variable("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class User(BaseModel):
    username: str
    admin: bool


class UserInDB(User):
    hashed_password: str


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


test_users_db: dict = {}


def get_user(db, username: str | None):
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)


def authenticate_user(fake_db, username: str, password: str):
    user = get_user(fake_db, username)
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
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str | None = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(test_users_db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def is_admin(current_user: Annotated[User, Depends(get_current_user)]):
    if not current_user.admin:
        raise HTTPException(status_code=400, detail="Not an admin")
    return current_user


@app.post("/token", summary="Get an auth token", tags=["auth"])
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = authenticate_user(test_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "admin": user.admin}


@app.get("/users/me", summary="Get current user", tags=["auth"])
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user


@app.get("/users/admin", summary="Check if user is admin", tags=["auth"])
async def check_if_admin(current_user: Annotated[User, Depends(is_admin)]):
    return current_user


def get_breaks(filters: BreakFilters = BreakFilters()):
    breaks = get_break_objects(filters)
    return list(map(break_internal_to_external, breaks))


@app.get(
    "/breaks",
    response_model=List[Break],
    summary="Get a list of cookie breaks",
    tags=["breaks"],
)
async def request_breaks(
    number: Optional[int] = None,
    past: Optional[bool] = None,
    hosted: Optional[bool] = None,
    holiday: Optional[bool] = None,
    host_reimbursed: Optional[bool] = None,
    admin_claimed: Optional[bool] = None,
    admin_reimbursed: Optional[bool] = None,
):
    break_filters = BreakFilters(
        number,
        past,
        hosted,
        holiday,
        host_reimbursed,
        admin_claimed,
        admin_reimbursed,
    )
    return get_breaks(break_filters)


@app.post(
    "/host",
    response_model=List[Break],
    summary="Set the host of an upcoming cookie break",
    tags=["breaks"],
)
async def set_host(break_id: int, host_name: str):
    insert_host(host_name, break_id)
    return get_break_objects(BreakFilters(past=False))


@app.post(
    "/reimburse",
    response_model=List[Break],
    summary="Record the reimbursement of a host",
    tags=["breaks"],
)
async def reimburse_host(break_id: int, cost: float):
    reimburse_and_mask_host(break_id, cost)
    return get_break_objects(BreakFilters())


@app.get(
    "/claims",
    response_model=list[Claim],
    summary="Get a list of claims",
    tags=["claims"],
)
async def request_claims(
    token: Annotated[str, Depends(is_admin)], reimbursed: Optional[bool] = None
):
    claims = get_claims(ClaimFilters(reimbursed))
    return list(map(claim_internal_to_external, claims))


load_dotenv(Path(get_env_variable("CB_ROOT")) / "api" / ".env")


@app.post(
    "/claim",
    response_model=list[Claim],
    summary="Record a submitted expense claim",
    tags=["claims"],
)
async def claim_break(break_ids: list[int]):
    claim_for_breaks(break_ids)
    claims = get_claims()
    return list(map(claim_internal_to_external, claims))


@app.post(
    "/success",
    response_model=list[Claim],
    summary="Record a successful expense claim",
    tags=["claims"],
)
async def reimburse_admin(break_id: int):
    claim_reimbursed(break_id)
    return list(map(claim_internal_to_external, get_claims()))


@app.post(
    "/announce", response_model=Break, summary="Announce a break", tags=["breaks"]
)
async def announce_break(current_user: Annotated[User, Depends(is_admin)], id: int):
    announced_break = announce_specific(id)
    if announced_break is None:
        raise HTTPException(400, "Break does not exist")
    return break_internal_to_external(announced_break)


@app.post("/test", summary="Add test data", response_model=List[Break], tags=["debug"])
async def add_test_data(num: int):
    now = arrow.now("Europe/London").replace(day=+1, second=0, microsecond=0)
    break_location = os.getenv("BREAK_LOCATION")
    if break_location is None:
        print("BREAK_LOCATION not set")
        exit(1)
    else:
        break_location_str: str = break_location
        breaks = list(map(lambda i: (now, break_location_str), range(0, num)))
        insert_breaks(breaks)
        return list(
            map(
                break_internal_to_external,
                get_break_objects(BreakFilters(host_reimbursed=False)),
            )
        )
