from config import Config
from database import get_next_breaks
from structs import Break


def select_break(config: Config) -> Break:
    next_breaks = get_next_breaks(config, config.breaks.maximum)
    for i, b in enumerate(next_breaks):
        break_date = b.get_break_date()
        break_time = b.get_break_time()
        if b.host is None:
            break_host = "no host"
        else:
            break_host = b.host
        print(f"{i+1}: {break_date} @ {break_time} ({break_host})")
    print(f"{len(next_breaks) + 1}: Cancel")
    choice = None
    while choice is None:
        choice_input = input(f"Select break (1-{len(next_breaks)}): ")
        if choice_input.isnumeric():
            choice_input_no = int(choice_input)
            if choice_input_no >= 1 and choice_input_no <= len(next_breaks) + 1:
                choice = choice_input_no
    if choice == len(next_breaks) + 1:
        return None
    else:
        return next_breaks[choice - 1]
