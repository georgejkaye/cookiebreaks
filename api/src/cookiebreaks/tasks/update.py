from cookiebreaks.core.database import insert_missing_breaks


def update():
    insert_missing_breaks()


if __name__ == "__main__":
    update()
