from datetime import datetime
from typing import Any, Optional, Tuple, List, TypeVar

import psycopg2

from config import Config
from structs import Break, BreakFilters, Claim


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
        UPDATE break
        SET break_host = %(host)s
        WHERE break_id = %(id)s
    """
    cur.execute(statement, {"host": break_host, "id": break_id})
    conn.commit()
    disconnect(conn, cur)


def reimburse_and_mask_host(config: Config, break_id: int, cost: float) -> None:
    (conn, cur) = connect(config)
    statement = """
        UPDATE break
        SET break_host = '', break_cost = %(cost)s, host_reimbursed = NOW()
        WHERE break_id = %(id)s
    """
    cur.execute(statement, {"id": break_id, "cost": cost})
    conn.commit()
    disconnect(conn, cur)


def get_exists_where_clause(where_clauses: list[str], boolean: Optional[bool], field: str):
    if boolean is not None:
        if boolean:
            modifier = " NOT"
        else:
            modifier = ""
        where_clauses.append(f"{field} IS{modifier} NULL")


def get_boolean_where_clause(where_clauses: list[str], boolean: Optional[bool], field: str):
    if boolean is not None:
        if boolean:
            var = "t"
        else:
            var = "f"
        where_clauses.append(f"{field} = '{var}'")


def rows_to_breaks(rows) -> List[Break]:
    next_breaks = []
    for row in rows:
        (id, break_host, date, break_location, is_holiday, cost,
         host_reimbursed, admin_claimed, admin_reimbursed) = row
        next_breaks.append(
            Break(id, break_host, date, break_location, is_holiday, cost, host_reimbursed, admin_claimed, admin_reimbursed))
    return next_breaks


def get_specific_breaks(config: Config, breaks: List[int]) -> List[Break]:
    (conn, cur) = connect(config)
    statement = f""""
        SELECT * FROM break WHERE break_id IN (SELECT * FROM unnest(%(ids)s) AS ids)
    """
    cur.execute(statement, {"ids": breaks})
    rows = cur.fetchall()
    disconnect(conn, cur)
    return rows_to_breaks(rows)


def get_breaks(config: Config, filters: BreakFilters) -> List[Break]:
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
            var = " NOT"
        else:
            op = "="
            var = ""
        where_clauses.append(
            f"(break_host {op} '' OR host_reimbursed IS{var} NULL)")
    get_boolean_where_clause(where_clauses, filters.holiday, "is_holiday")
    get_exists_where_clause(
        where_clauses, filters.host_reimbursed, "host_reimbursed")
    get_exists_where_clause(
        where_clauses, filters.admin_claimed, "admin_claimed")
    get_exists_where_clause(
        where_clauses, filters.admin_reimbursed, "admin_reimbursed")
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
        FROM break
        {where_string}
        ORDER BY break_datetime ASC
        {limit_string}
    """
    cur.execute(statement)
    rows = cur.fetchall()
    disconnect(conn, cur)
    return rows_to_breaks(rows)


def get_next_break(config: Config) -> Break:
    return get_breaks(config, BreakFilters(past=False, number=1))[0]


def to_postgres_day(day: int) -> int:
    if day == 6:
        return 0
    else:
        return day + 1


def insert_missing_breaks(config: Config) -> None:
    (conn, cur) = connect(config)
    statement = f"""
        INSERT INTO break (break_datetime, break_location)
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
            WHERE dates.days NOT IN (SELECT break_datetime FROM break)
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
            UPDATE break
            SET is_holiday = true, break_host = NULL
            WHERE break_id = %(id)s
        """
    else:
        statement = f"""
            UPDATE break
            SET is_holiday = false
            WHERE break_id = %(id)s
        """
    cur.execute(statement, {"id": break_id})
    conn.commit()
    disconnect(conn, cur)


def claim_for_breaks(config: Config, break_ids: List[int], amount: float) -> None:
    (conn, cur) = connect(config)
    break_table_statement = f"""
        UPDATE break
        SET admin_claimed = NOW()
        WHERE break_id IN (SELECT * FROM unnest(%(ids)s) AS ids)
    """
    claim_table_statement = f"""
        INSERT INTO claim(claim_date, breaks_claimed, claim_amount)
        VALUES(NOW(), %(breaks)s, %(amount)s)
    """
    cur.execute(break_table_statement, {"ids": break_ids})
    cur.execute(claim_table_statement, {"breaks": break_ids, "amount": amount})
    conn.commit()
    disconnect(conn, cur)


def get_claims(config: Config, reimbursed: Optional[bool] = None) -> List[Claim]:
    (conn, cur) = connect(config)
    if reimbursed is not None:
        if reimbursed:
            var = "t"
        else:
            var = "f"
        where_statement = f"WHERE claim_reimbursed = '{var}'"
    else:
        where_statement = ""
    statement = f""""
        SELECT * FROM claim
        {where_statement}
    """
    cur.execute(statement)
    rows = cur.fetchall()
    disconnect(conn, cur)
    claims = []
    for row in rows:
        (claim_id, claim_date, breaks_claimed,
         claim_amount, claim_reimbursed) = row
        breaks = get_specific_breaks(config, breaks_claimed)
        claims.append(Claim(claim_id, claim_date, breaks,
                      claim_amount, claim_reimbursed))
    return claims
