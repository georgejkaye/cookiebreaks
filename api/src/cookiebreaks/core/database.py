from decimal import Decimal
from unittest.util import strclass
import arrow
import psycopg2

from typing import Any, Optional

from cookiebreaks.core.env import get_env_variable, get_secret
from cookiebreaks.core.structs import (
    Break,
    BreakFilters,
    Claim,
    ClaimFilters,
    Arrow,
    User,
)


def connect() -> tuple[Any, Any]:
    conn = psycopg2.connect(
        dbname=get_env_variable("DB_NAME"),
        user=get_env_variable("DB_USER"),
        password=get_secret("DB_PASSWORD"),
        host=get_env_variable("DB_HOST"),
    )
    cur = conn.cursor()
    return (conn, cur)


def disconnect(conn: Any, cur: Any) -> None:
    conn.close()
    cur.close()


def get_user(username: str) -> Optional[User]:
    (conn, cur) = connect()
    statement = """
        SELECT user_name, email, admin, hashed_password
        FROM Host
        WHERE user_name = %(username)s
    """
    cur.execute(statement, {"username": username})
    rows = cur.fetchall()
    disconnect(conn, cur)
    if len(rows) != 1:
        return None
    row = rows[0]
    return User(row[0], row[1], row[2], row[3])


def get_breaks_statement(filters: BreakFilters = BreakFilters()) -> str:
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
    get_exists_where_clause(where_clauses, filters.holiday, "holiday_text")
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
        SELECT Break.break_id, break_host, break_datetime, break_location,
            holiday_text, break_announced, break_cost, host_reimbursed,
            Claim.claim_id, claim_date, claim_reimbursed
        FROM Break
        LEFT JOIN ClaimItem ON Break.break_id = ClaimItem.break_id
        LEFT JOIN Claim ON ClaimItem.claim_id = Claim.claim_id
        {where_string}
        ORDER BY break_datetime ASC
        {limit_string}
    """
    return statement


def get_returning_statement() -> str:
    return f"""
        break.break_id, break.break_host, break.break_datetime,
        break.break_location, break.holiday_text, break.break_announced,
        break.break_cost, break.host_reimbursed, data.claim_id,
        data.claim_date, data.claim_reimbursed
    """


def insert_breaks(breaks: list[tuple[Arrow, str, Optional[str]]]) -> list[Break]:
    (conn, cur) = connect()
    statement = """
        INSERT INTO break (break_datetime, break_location, break_host) (
            SELECT unnest(%(datetimes)s), unnest(%(locations)s), unnest(%(hosts)s)
        )
        RETURNING break_id, break_datetime, break_location
    """
    cur.execute(
        statement,
        {
            "datetimes": [b[0].datetime for b in breaks],
            "locations": [b[1] for b in breaks],
            "hosts": [b[2] for b in breaks],
        },
    )
    rows = cur.fetchall()
    new_breaks = [
        Break(b[0], arrow.get(b[1]), b[2], None, None, None, None, None, None, None)
        for b in rows
    ]
    conn.commit()
    disconnect(conn, cur)
    return new_breaks


def insert_host(break_host: str | None, break_id: int) -> Break:
    (conn, cur) = connect()
    statement = f"""
        UPDATE break
        SET break_host = %(host)s
        WHERE break_id = %(id)s
        RETURNING
            break_id, break_host, break_datetime, break_location,
            holiday_text, break_announced, break_cost, host_reimbursed
    """
    cur.execute(statement, {"host": break_host, "id": break_id})
    row = cur.fetchall()[0]
    conn.commit()
    disconnect(conn, cur)
    return row_to_break(row)


def reimburse_host(break_id: int, cost: float) -> Break:
    (conn, cur) = connect()
    statement = f"""
        UPDATE break
        SET break_cost = %(cost)s, host_reimbursed = DATE_TRUNC('minute', NOW())
        FROM ({get_breaks_statement()}) data
        WHERE break.break_id = %(id)s
        RETURNING {get_returning_statement()}
    """
    cur.execute(statement, {"id": break_id, "cost": cost})
    row = cur.fetchall()[0]
    conn.commit()
    disconnect(conn, cur)
    return row_to_break(row)


def mask_host(break_id: int) -> Break:
    (conn, cur) = connect()
    statement = f"""
        UPDATE break
        SET break_host = null
        FROM ({get_breaks_statement()}) data
        WHERE break.break_id = %(is)s
        RETURNING {get_returning_statement()}
    """
    cur.execute(statement, {"id": break_id})
    row = cur.fetchall()[0]
    conn.commit()
    disconnect(conn, cur)
    return row_to_break(row)


def get_exists_where_clause(
    where_clauses: list[str], boolean: Optional[bool], field: str
):
    if boolean is not None:
        if boolean:
            modifier = " NOT"
        else:
            modifier = ""
        where_clauses.append(f"{field} IS{modifier} NULL")


def get_boolean_where_clause(
    where_clauses: list[str], boolean: Optional[bool], field: str
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
        break_id,
        break_host,
        break_datetime,
        break_location,
        holiday_text,
        break_announced,
        break_cost,
        host_reimbursed,
        claim_id,
        claim_date,
        claim_reimbursed,
    ) = row
    timezone = "Europe/London"
    return Break(
        break_id,
        arrow.get(break_datetime, timezone),
        break_location,
        holiday_text,
        break_host,
        arrow_or_none(break_announced, timezone),
        break_cost,
        arrow_or_none(host_reimbursed, timezone),
        arrow_or_none(claim_date, timezone),
        claim_id,
        claim_reimbursed,
    )


def rows_to_breaks(rows) -> list[Break]:
    next_breaks = []
    for row in rows:
        next_breaks.append(row_to_break(row))
    return next_breaks


def get_specific_breaks(breaks: list[int]) -> list[Break]:
    (conn, cur) = connect()
    statement = f"""
        SELECT break.break_id, break_host, break_datetime, break_location,
            holiday_text, break_announced, break_cost, host_reimbursed,
            claim.claim_id, claim_date, claim_reimbursed
        FROM break
        LEFT JOIN claimitem ON break.break_id = claimitem.break_id
        LEFT JOIN claim ON claimitem.claim_id = claim.claim_id
        WHERE break.break_id IN (SELECT * FROM unnest(%(ids)s) AS ids)
    """
    cur.execute(statement, {"ids": breaks})
    rows = cur.fetchall()
    disconnect(conn, cur)
    break_objs = []
    for row in rows:
        (
            break_id,
            break_host,
            break_datetime,
            break_location,
            holiday_text,
            break_announced,
            break_cost,
            host_reimbursed,
            claim_id,
            claim_date,
            claim_reimbursed,
        ) = row
        break_obj = Break(
            break_id,
            arrow.get(break_datetime),
            break_location,
            holiday_text,
            break_host,
            arrow_or_none(break_announced, "Europe/London"),
            break_cost,
            arrow_or_none(host_reimbursed, "Europe/London"),
            claim_date,
            claim_id,
            arrow_or_none(claim_reimbursed, "Europe/London"),
        )
        break_objs.append(break_obj)
    return break_objs


def rows_to_claims(rows) -> list[Claim]:
    claims = []
    for row in rows:
        (id, date, breaks, amount, reimbursed) = row
        break_objects = get_specific_breaks(breaks)
        claims.append(
            Claim(
                id,
                arrow.get(date),
                list(map(lambda b: b.id, break_objects)),
                amount,
                arrow_or_none(reimbursed, "Europe/London"),
            )
        )
    return claims


def get_break_dicts(filters: BreakFilters = BreakFilters()) -> list[dict]:
    (conn, cur) = connect()
    statement = get_breaks_statement(filters)
    cur.execute(statement)
    rows = cur.fetchall()
    disconnect(conn, cur)
    return rows


def get_break_objects(filters: BreakFilters = BreakFilters()) -> list[Break]:
    break_dicts = get_break_dicts(filters)
    return rows_to_breaks(break_dicts)


def get_next_break() -> Break:
    return get_break_objects(BreakFilters(past=False, number=1))[0]


def to_postgres_day(day: int) -> int:
    if day == 6:
        return 0
    else:
        return day + 1


def insert_missing_breaks() -> list[Break]:
    (conn, cur) = connect()
    statement = f"""
        INSERT INTO break (break_datetime, break_location) (
            SELECT days AS break_datetime, %(location)s
            FROM (
                SELECT days
                FROM generate_series(
                    CURRENT_DATE + TIME %(time)s,
                    CURRENT_DATE + TIME %(time)s + INTERVAL %(max)s,
                    '1 day'
                ) AS days
                WHERE EXTRACT(DOW from days) = %(day)s
            ) AS dates
            WHERE dates.days NOT IN (SELECT break_datetime FROM break)
        )
        RETURNING
            break_id, break_datetime, break_location
    """
    cur.execute(
        statement,
        {
            "location": get_env_variable("BREAK_LOCATION"),
            "time": get_env_variable("BREAK_TIME"),
            "max": f"{get_env_variable('BREAK_MAX')} weeks",
            "day": int(get_env_variable("BREAK_DAY")) + 1,
        },
    )
    rows = cur.fetchall()
    conn.commit()
    disconnect(conn, cur)
    breaks = []
    for row in rows:
        (break_id, break_datetime, break_location) = row
        break_obj = Break(break_id, arrow.get(break_datetime), break_location)
        breaks.append(break_obj)
    return breaks


def set_holiday(break_id: int, reason: Optional[str] = None) -> Break:
    (conn, cur) = connect()
    if reason:
        set_statement = "holiday_text = %(text)s, break_host = NULL"
        reason_text = reason
    else:
        set_statement = "holiday_text = NULL"
        reason_text = ""
    statement = f"""
            UPDATE break
            SET {set_statement}
            FROM ({get_breaks_statement(BreakFilters())}) data
            WHERE break.break_id = %(id)s
            RETURNING {get_returning_statement()}
        """
    cur.execute(statement, {"id": break_id, "text": reason_text})
    row = cur.fetchall()[0]
    conn.commit()
    disconnect(conn, cur)
    return row_to_break(row)


def get_maybe_cost(b: Break) -> Decimal:
    if b.cost is None:
        return Decimal(0)
    return b.cost


def claim_for_breaks(break_ids: list[int]) -> tuple[list[Break], Claim]:
    (conn, cur) = connect()
    break_table_statement = f"""
        UPDATE Break
        SET break_host = NULL
        FROM ({get_breaks_statement(BreakFilters())}) data
        WHERE break_id IN (SELECT * FROM unnest(%(ids)s) AS ids)
        RETURNING {get_returning_statement()}
    """
    cur.execute(break_table_statement, {"ids": break_ids})
    rows = cur.fetchall()
    updated_breaks = rows_to_breaks(rows)
    costs = list(map(lambda b: get_maybe_cost(b), updated_breaks))
    amount = sum(costs)
    claim_table_statement = f"""
        INSERT INTO Claim(claim_date)
        VALUES(DATE_TRUNC('minute', NOW()))
        RETURNING claim_id, claim_date, claim_reimbursed
    """
    cur.execute(claim_table_statement, {"breaks": break_ids, "amount": amount})
    row = cur.fetchall()[0]
    updated_claim = Claim(row[0], arrow.get(row[1]), break_ids, amount, None)
    claim_item_statement = f"""
        INSERT INTO ClaimItem(claim_id, break_id) (
            SELECT %(claim_id)s, unnest(%(break_ids)s)
        )
    """
    cur.execute(
        claim_item_statement, {"claim_id": updated_claim.id, "break_ids": break_ids}
    )
    conn.commit()
    disconnect(conn, cur)
    return (updated_breaks, updated_claim)


def get_claim_objects(filters: ClaimFilters = ClaimFilters()) -> list[Claim]:
    (conn, cur) = connect()
    if filters.reimbursed is not None:
        if filters.reimbursed:
            modifier = " NOT"
        else:
            modifier = ""
        where_statement = f"WHERE claim_reimbursed IS{modifier} NULL"
    else:
        where_statement = ""
    claims_statement = f"""
        SELECT
            claim.claim_id, claim.claim_date, claim.claim_reimbursed,
            ARRAY_AGG(claimitem.break_id), SUM(break.break_cost)
            FROM claim
            INNER JOIN claimitem ON claim.claim_id = claimitem.claim_id
            INNER JOIN break ON claimitem.break_id = break.break_id
            {where_statement}
            GROUP BY claim.claim_id
        ORDER BY claim.claim_date ASC
    """
    cur.execute(claims_statement)
    rows = cur.fetchall()
    claims: list[Claim] = []
    for row in rows:
        (claim_id, claim_date, claim_reimbursed, breaks_claimed, claim_amount) = row
        if claim_reimbursed is not None:
            claim_reimbursed = arrow.get(claim_reimbursed)
        claim_arrow = arrow.get(claim_date)
        claims.append(
            Claim(claim_id, claim_arrow, breaks_claimed, claim_amount, claim_reimbursed)
        )
    disconnect(conn, cur)
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
    conn.commit()
    disconnect(conn, cur)


def after_announced_break(
    cookie_break: Break, filters: BreakFilters = BreakFilters()
) -> Break:
    (conn, cur) = connect()
    statement = f"""
        UPDATE break
        SET break_announced = NOW()
        FROM ({get_breaks_statement(BreakFilters())}) data
        WHERE break.break_id = %(id)s
        RETURNING {get_returning_statement()}
    """
    cur.execute(statement, {"id": cookie_break.id})
    updated_break = cur.fetchall()[0]
    conn.commit()
    disconnect(conn, cur)
    return row_to_break(updated_break)


def remove_break(break_id: int) -> None:
    (conn, cur) = connect()
    statement = """
        DELETE FROM break WHERE break_id = %(id)s
    """
    cur.execute(statement, {"id": break_id})
    conn.commit()
    disconnect(conn, cur)
