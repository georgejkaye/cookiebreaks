from dataclasses import asdict
import json
from typing import List
from arrow import Arrow
from fastapi import FastAPI
from pydantic import BaseConfig

from src.config import parse_config
from src.database import get_break_objects
from src.structs import Break
from pydantic.json import ENCODERS_BY_TYPE

ENCODERS_BY_TYPE |= {Arrow: str}
BaseConfig.arbitrary_types_allowed = True

app = FastAPI()

config = parse_config()


@app.get("/")
async def root():
    return {"message": "Hello world!"}


@app.get("/breaks", response_model=List[Break])
async def request_breaks():
    breaks = get_break_objects(config)
    return breaks
