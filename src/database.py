from datetime import datetime
from typing import Any

import psycopg2

from config import Config
from structs import Break


def connect(config: Config) -> tuple[Any, Any]:
    conn = psycopg2.connect(
        dbname=config.db.database,
        user=config.db.user,
        password=config.db.password,
        host=config.db.host
    )
    cur = conn.cursor()
    return (conn, cur)


def disconnect(conn: Any, cur: Any) -> None:
    conn.close()
    cur.close()


def get_next_break(config: Config):
    today = datetime.now()
    (conn, cur) = connect(config)
    statement = f"""
        SELECT break_date, host, location
        FROM cookiebreak
        WHERE break_date > '{today}'
        ORDER BY break_date ASC
    """
    cur.execute(statement)
    (date, host, location) = cur.fetchone()
    next_break = Break(host, date, location)
    disconnect(conn, cur)
    return next_break
