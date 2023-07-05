from dataclasses import asdict
import json
from typing import List
from arrow import Arrow
import arrow
from fastapi import FastAPI

from src.config import parse_config
from src.database import get_break_objects
from src.structs import Break

app = FastAPI()

config = parse_config()


@app.get("/")
async def root():
    return {"message": "Hello world!"}


example_break = Break(0, arrow.now(), "LG06a, Computer Science", False, "George Kaye")


@app.get("/breaks", response_model=List[Break])
async def request_breaks():
    # breaks = get_break_objects(config)
    return [example_break]
