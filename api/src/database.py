import os
from typing import Any, Optional, Tuple, List
import arrow

import psycopg2

from config import Config
from structs import Break, BreakFilters, Claim, ClaimFilters, Arrow


def get_env_variable(name: str) -> str:
    var = os.getenv(name)
    if var:
        return var
    else:
        print(f"Environment variable {name} not set")
        exit(1)


def connect() -> Tuple[Any, Any]:
    conn = psycopg2.connect(
        dbname=get_env_variable("DB_NAME"),
        user=get_env_variable("DB_USER"),
        password=get_env_variable("DB_PASSWORD"),
        host=get_env_variable("DB_HOST"),
    )
    cur = conn.cursor()
    return (conn, cur)


def disconnect(conn: Any, cur: Any) -> None:
    conn.close()
    cur.close()


def insert_breaks(breaks: list[tuple[Arrow, str]]) -> None:
    (conn, cur) = connect()
    statement = """
        INSERT INTO break (break_datetime, break_location) (
            SELECT unnest(%(datetimes)s), unnest(%(locations)s)
        )
    """
    cur.execute(
        statement,
        {
            "datetimes": list(map(lambda b: b[0].datetime, breaks)),
            "locations": list(map(lambda b: b[1], breaks)),
        },
    )
    conn.commit()
    disconnect(conn, cur)


def insert_host(break_host: str, break_id: int) -> None:
    (conn, cur) = connect()
    statement = f"""
        UPDATE break
        SET break_host = %(host)s
        WHERE break_id = %(id)s
    """
    cur.execute(statement, {"host": break_host, "id": break_id})
    conn.commit()
    disconnect(conn, cur)


def reimburse_and_mask_host(break_id: int, cost: float) -> None:
    (conn, cur) = connect()
    statement = """
        UPDATE break
        SET
            break_host = null, break_cost = %(cost)s,
            host_reimbursed = DATE_TRUNC('minute', NOW())
        WHERE break_id = %(id)s
    """
    cur.execute(statement, {"id": break_id, "cost": cost})
    conn.commit()
    disconnect(conn, cur)


def get_exists_where_clause(
    where_clauses: List[str], boolean: Optional[bool], field: str
):
    if boolean is not None:
        if boolean:
            modifier = " NOT"
        else:
            modifier = ""
        where_clauses.append(f"{field} IS{modifier} NULL")


def get_boolean_where_clause(
    where_clauses: List[str], boolean: Optional[bool], field: str
):
    if boolean is not None:
        if boolean:
            var = "t"
        else:
            var = "f"
        where_clauses.append(f"{field} = '{var}'")


def arrow_or_none(candidate, timezone: str) -> Optional[Arrow]:
    if candidate is None:
        return None
    else:
        return arrow.get(candidate, timezone)


def row_to_break(row) -> Break:
    (
        id,
        break_host,
        datetime,
        break_location,
        is_holiday,
        cost,
        host_reimbursed,
        admin_claimed,
        admin_reimbursed,
        break_announced,
    ) = row
    timezone = "Europe/London"
    return Break(
        id,
        arrow.get(datetime, timezone),
        break_location,
        is_holiday,
        break_host,
        arrow_or_none(break_announced, timezone),
        cost,
        arrow_or_none(host_reimbursed, timezone),
        arrow_or_none(admin_claimed, timezone),
        arrow_or_none(admin_reimbursed, timezone),
    )


def rows_to_breaks(rows) -> List[Break]:
    next_breaks = []
    for row in rows:
        next_breaks.append(row_to_break(row))
    return next_breaks


def get_specific_breaks(breaks: List[int]) -> List[Break]:
    (conn, cur) = connect()
    statement = f"""
        SELECT * FROM break WHERE break_id IN (SELECT * FROM unnest(%(ids)s) AS ids)
    """
    cur.execute(statement, {"ids": breaks})
    rows = cur.fetchall()
    disconnect(conn, cur)
    return rows_to_breaks(rows)


def rows_to_claims(rows) -> List[Claim]:
    claims = []
    for row in rows:
        (id, date, breaks, amount, reimbursed) = row
        break_objects = get_specific_breaks(breaks)
        claims.append(Claim(id, date, break_objects, amount, reimbursed))
    return claims


def get_breaks_statement(filters) -> str:
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
        where_clauses.append(f"(break_host {op} '' OR host_reimbursed IS{var} NULL)")
    get_boolean_where_clause(where_clauses, filters.holiday, "is_holiday")
    get_exists_where_clause(where_clauses, filters.host_reimbursed, "host_reimbursed")
    get_exists_where_clause(where_clauses, filters.admin_claimed, "admin_claimed")
    get_exists_where_clause(where_clauses, filters.admin_reimbursed, "admin_reimbursed")
    if len(where_clauses) == 0:
        where_string = ""
    else:
        where_string = "WHERE " + " AND ".join(where_clauses)
    if filters.number is None:
        limit_string = ""
    else:
        limit_string = f"LIMIT {filters.number}"
    statement = f"""
        SELECT *
        FROM break
        {where_string}
        ORDER BY break_datetime ASC
        {limit_string}
    """
    return statement


def get_break_dicts(filters: BreakFilters = BreakFilters()) -> List[dict]:
    (conn, cur) = connect()
    statement = get_breaks_statement(filters)
    cur.execute(statement)
    rows = cur.fetchall()
    disconnect(conn, cur)
    return rows


def get_break_objects(filters: BreakFilters = BreakFilters()) -> List[Break]:
    break_dicts = get_break_dicts(filters)
    return rows_to_breaks(break_dicts)


def get_next_break() -> Break:
    return get_break_objects(BreakFilters(past=False, number=1))[0]


def to_postgres_day(day: int) -> int:
    if day == 6:
        return 0
    else:
        return day + 1


def insert_missing_breaks(config: Config) -> None:
    (conn, cur) = connect()
    statement = f"""
        INSERT INTO break (break_datetime, break_location) (
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
        )
    """
    cur.execute(
        statement,
        {
            "location": config.breaks.location,
            "time": config.breaks.time.time(),
            "max": config.breaks.maximum,
            "day": to_postgres_day(config.breaks.day),
        },
    )
    conn.commit()
    disconnect(conn, cur)


def set_holiday(config: Config, break_id: int, holiday: bool) -> None:
    (conn, cur) = connect()
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


def claim_for_breaks(break_ids: List[int]) -> None:
    (conn, cur) = connect()
    break_table_statement = f"""
        WITH updated AS (
            UPDATE break
            SET admin_claimed = DATE_TRUNC('minute', NOW())
            WHERE break_id IN (SELECT * FROM unnest(%(ids)s) AS ids)
            RETURNING *
        ) SELECT SUM(break_cost) FROM updated
    """
    claim_table_statement = f"""
        INSERT INTO claim(claim_date, breaks_claimed, claim_amount)
        VALUES(DATE_TRUNC('minute', NOW()), %(breaks)s, %(amount)s)
    """
    cur.execute(break_table_statement, {"ids": break_ids})
    rows = cur.fetchall()
    amount = rows[0][0]
    cur.execute(claim_table_statement, {"breaks": break_ids, "amount": amount})
    conn.commit()
    disconnect(conn, cur)


1


def get_claims(filters: ClaimFilters = ClaimFilters()) -> List[Claim]:
    (conn, cur) = connect()
    if filters.reimbursed is not None:
        if filters.reimbursed:
            modifier = " NOT"
        else:
            modifier = ""
        where_statement = f"WHERE claim_reimbursed IS{modifier} NULL"
    else:
        where_statement = ""
    statement = f"""
        SELECT * FROM claim
        {where_statement}
        ORDER BY claim_date ASC
    """
    cur.execute(statement)
    rows = cur.fetchall()
    disconnect(conn, cur)
    claims = []
    for row in rows:
        (claim_id, claim_date, breaks_claimed, claim_amount, claim_reimbursed) = row
        if claim_reimbursed is not None:
            claim_reimbursed = arrow.get(claim_reimbursed)
        claim_date = arrow.get(claim_date)
        breaks = get_specific_breaks(breaks_claimed)
        claims.append(
            Claim(
                claim_id, arrow.get(claim_date), breaks, claim_amount, claim_reimbursed
            )
        )
    return claims


def claim_reimbursed(claim_id: int) -> None:
    (conn, cur) = connect()
    claim_statement = """
        UPDATE claim
        SET claim_reimbursed = DATE_TRUNC('minute', NOW())
        WHERE claim_id = %(id)s
    """
    cur.execute(claim_statement, {"id": claim_id})
    break_statement = """
        UPDATE break
        SET admin_reimbursed = DATE_TRUNC('minute', NOW())
        WHERE break_id IN (
            SELECT UNNEST(breaks_claimed) FROM claim WHERE claim.claim_id = %(id)s
        )
    """
    cur.execute(break_statement, {"id": claim_id})
    disconnect(conn, cur)


def after_announced_break(
    cookie_break: Break, filters: BreakFilters = BreakFilters()
) -> Break:
    (conn, cur) = connect()
    statement = """
        UPDATE break
        SET break_announced = NOW()
        WHERE break_id = %(id)s
        RETURNING *
    """
    cur.execute(statement, {"id": cookie_break.id})
    updated_break = cur.fetchall()[0]
    conn.close()
    return row_to_break(updated_break)
