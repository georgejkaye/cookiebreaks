# Build image
FROM python:3.11-buster as builder

ENV POETRY_VERSION=1.5.1 \
    POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

RUN pip install poetry==${POETRY_VERSION}

WORKDIR /app

COPY pyproject.toml poetry.lock ./
# Poetry complains without a readme
RUN touch README.md

RUN poetry install --without dev --no-root && rm -rf ${POETRY_CACHE_DIR}

# Runtime image
FROM python:3.11-slim-buster as runtime

RUN apt update
RUN apt install libpq-dev -y

ENV VIRTUAL_ENV=/app/.venv \
    PATH="/app/.venv/bin:$PATH" \
    API_PORT=8000

COPY --from=builder ${VIRTUAL_ENV} ${VIRTUAL_ENV}
COPY --from=builder /app/pyproject.toml ./app/pyproject.toml

RUN touch ./app/README.md

COPY src ./app/src
COPY .env ./app/.env

ENV CB_API_ROOT="/app" \
    PYTHONPATH="/app/src:$PYTHONPATH"

WORKDIR /app/src

EXPOSE ${API_PORT}

ENTRYPOINT ["python", "cookiebreaks/api/main.py"]