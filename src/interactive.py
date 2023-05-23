from typing import List, Optional
from config import Config
from database import get_breaks
from structs import Break, BreakFilters, format_as_price

def display_breaks(breaks: list[Break]):
    for i, b in enumerate(breaks):
        break_date = b.get_break_date()
        break_time = b.get_break_time()
        if b.holiday:
            break_host = "holiday"
        elif b.host_reimbursed:
            break_host = format_as_price(b.cost)
        elif b.host is None:
            break_host = "no host"
        else:
            break_host = b.host
        print(f"{i+1}: {break_date} @ {break_time} ({break_host})")
    print(f"{len(breaks) + 1}: Cancel")

def validate_choice(choice_input: str, min: int, max: int) -> Optional[int]:
    if choice_input.isnumeric():
        choice_input_no = int(choice_input)
        if choice_input_no >= min and choice_input_no <= max:
            return choice_input_no
        else:
            return None
    else:
        return None


def select_break(config: Config, filters: BreakFilters) -> Break:
    breaks = get_breaks(config, filters)
    display_breaks(breaks)
    choice = None
    while choice is None:
        choice_input = input(f"Select break (1-{len(breaks) + 1}): ")
        choice = validate_choice(choice_input, 1, len(breaks) + 1)
    if choice == len(breaks) + 1:
        return None
    else:
        return breaks[choice - 1]

def select_multiple_breaks(config: Config, filters : BreakFilters) -> List[Break]:
    breaks = get_breaks(config, filters)
    display_breaks(breaks)
    choices = None
    while choices is None:
        choice_input = input(f"Select breaks (1-{len(breaks) + 1}) e.g. 1,2,3: ")
        candidate_choices : List[int] = []
        choice_strings = choice_input.split(",")
        for choice_string in choice_strings:
            current_choice = validate_choice(choice_string, 1, len(breaks) + 1)
            if current_choice is None:
                candidate_choices = []
                break
            else:
                candidate_choices.append(current_choice)
        if len(candidate_choices) > 0:
            choices = candidate_choices
    return list(map(lambda i: breaks[i - 1], choices))