from config import parse_config
from database import insert_missing_breaks

def main():
    config = parse_config()
    insert_missing_breaks(config)


if __name__ == "__main__":
    main()
