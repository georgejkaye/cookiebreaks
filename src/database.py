from datetime import datetime
from typing import Any, Optional, Tuple, List

import psycopg2

from config import Config
from structs import Break, BreakFilters


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

def get_boolean_where_clause(where_clauses : list[str], boolean : Optional[bool], field : str):
    if boolean is not None:
        if boolean:
            var = "t"
        else:
            var = "f"
        where_clauses.append(f"{field} = '{var}'")

def get_breaks(config: Config, filters : BreakFilters) -> List[Break]:
    (conn, cur) = connect(config)
    where_clauses = []
    if filters.past is not None:
        if filters.past:
            op = "<"
        else:
            op = ">"
        where_clauses.append(f"break_datetime {op} NOW()")
    if filters.hosted is not None:
        if filters.hosted:
            op = "!="
            var = "t"
        else:
            op = "="
            var = "f"
        where_clauses.append(f"(break_host {op} '' OR host_reimbursed = '{var}')")
    get_boolean_where_clause(where_clauses, filters.holiday, "is_holiday")
    get_boolean_where_clause(where_clauses, filters.host_reimbursed, "host_reimbursed")
    get_boolean_where_clause(where_clauses, filters.admin_claimed, "admin_claimed")
    get_boolean_where_clause(where_clauses, filters.admin_reimbursed, "admin_reimbursed")
    if len(where_clauses) == 0:
        where_string = ""
    else:
        where_string = "WHERE " + " AND ".join(where_clauses)
    if filters.number is None:
        limit_string = ""
    else:
        limit_string = "LIMIT {number}"
    statement = f"""
        SELECT *
        FROM {config.db.database}
        {where_string}
        ORDER BY break_datetime ASC
        {limit_string}
    """
    cur.execute(statement)
    rows = cur.fetchall()
    disconnect(conn, cur)
    next_breaks = []
    for row in rows:
        (id, break_host, date, break_location, is_holiday, host_reimbursed, admin_claimed, admin_reimbursed, cost) = row
        next_breaks.append(
            Break(id, break_host, date, break_location, is_holiday, cost, host_reimbursed, admin_claimed, admin_reimbursed))
    return next_breaks


def get_next_break(config: Config) -> Break:
    return get_breaks(config, number=1)[0]


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
        statement = f"""
            UPDATE {config.db.database}
            SET is_holiday = true, break_host = NULL
            WHERE break_id = %(id)s
        """
    else:
        statement = f"""
            UPDATE {config.db.database}
            SET is_holiday = false
            WHERE break_id = %(id)s
        """
    cur.execute(statement, { "id": break_id})
    conn.commit()
    disconnect(conn, cur)

def claim_for_breaks(config: Config, break_ids: List[int]) -> None:
    (conn, cur) = connect(config)
    statement = f"""
        UPDATE {config.db.database}
        SET admin_claimed = true
        WHERE break_id IN (SELECT * FROM unnest(%(ids)s) AS ids)
    """
    cur.execute(statement, {"ids": break_ids})
    conn.commit()
    disconnect(conn, cur)