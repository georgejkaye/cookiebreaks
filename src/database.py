from datetime import datetime
from typing import Any, Tuple, List

import psycopg2

from config import Config
from structs import Break


def connect(config: Config) -> Tuple[Any, Any]:
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


def insert_host(config: Config, break_host: str, break_id: int) -> None:
    (conn, cur) = connect(config)
    statement = f"""
        UPDATE {config.db.database}
        SET break_host = %(host)s
        WHERE break_id = %(id)s
    """
    cur.execute(statement, {"host": break_host, "id": break_id})
    conn.commit()
    disconnect(conn, cur)


def reimburse_and_mask_host(config: Config, break_id: int) -> None:
    (conn, cur) = connect(config)
    statement = """
        UPDATE {config.db.database}
        SET break_host = '', host_reimbursed = 't'
        WHERE break_id = %(id)s
    """
    cur.execute(statement, {"id": break_id,})
    conn.commit()
    disconnect(conn, cur)


def get_next_breaks(config: Config, number: int, past: int, hosted: bool) -> List[Break]:
    (conn, cur) = connect(config)
    if past:
        op = "<"
    else:
        op = ">"
    if hosted:
        hosted_condition = " AND break_host != ''"
    else:
        hosted_condition = ""
    statement = f"""
        SELECT break_id, break_host, break_datetime, break_location, is_holiday, break_cost
        FROM {config.db.database}
        WHERE break_datetime {op} NOW() {hosted_condition}
        ORDER BY break_datetime ASC
    """
    cur.execute(statement)
    rows = cur.fetchmany(size=number)
    disconnect(conn, cur)
    next_breaks = []
    for row in rows:
        (id, break_host, date, break_location, holiday, cost) = row
        next_breaks.append(
            Break(id, break_host, date, break_location, holiday, cost))
    return next_breaks


def get_next_break(config: Config) -> Break:
    return get_next_breaks(config, number=1, past=False, hosted=False)[0]


def to_postgres_day(day: int) -> int:
    if day == 6:
        return 0
    else:
        return day + 1


def insert_missing_breaks(config: Config) -> None:
    (conn, cur) = connect(config)
    statement = f"""
        INSERT INTO {config.db.database} (break_datetime, break_location)
            SELECT days AS break_datetime, %(location)s
            FROM (
                SELECT days
                FROM generate_series(
                    CURRENT_DATE + TIME %(time)s,
                    CURRENT_DATE + TIME %(time)s + INTERVAL '%(max)s weeks',
                    '1 day'
                ) AS days
                WHERE EXTRACT(DOW from days) = %(day)s
            ) AS dates
            WHERE dates.days NOT IN (SELECT break_datetime FROM {config.db.database})
    """
    cur.execute(
        statement,
        {
            "location": config.breaks.location,
            "time": config.breaks.time,
            "max": config.breaks.maximum,
            "day": to_postgres_day(config.breaks.day)
        })
    conn.commit()
    disconnect(conn, cur)


def set_holiday(config: Config, break_id: int, holiday: bool) -> None:
    (conn, cur) = connect(config)
    if holiday:
        statement = """
            UPDATE {config.db.database}
            SET is_holiday = true, break_host = NULL
            WHERE break_id = %(id)s
        """
    else:
        statement = """
            UPDATE {config.db.database}
            SET is_holiday = false
            WHERE break_id = %(id)s
        """
    cur.execute(statement, { "id": break_id})
    conn.commit()
    disconnect(conn, cur)
