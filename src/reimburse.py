from config import parse_config
from database import reimburse_and_mask_host
from interactive import select_break
from structs import BreakFilters, format_as_price


def main():
    config = parse_config()
    chosen_break = select_break(config, BreakFilters(
        past=True, hosted=True, host_reimbursed=False))
    if chosen_break is None:
        print("No choice made, exiting")
        exit(0)
    else:
        cost = None
        while cost is None:
            candidate_cost = input("Break cost: ")
            if candidate_cost.isnumeric():
                cost = float(candidate_cost)
        host = chosen_break.host
        cost = format_as_price(chosen_break.cost)
        date = chosen_break.get_break_datetime()
        check = input((
            f"Have you reimbursed {host} £{cost} for hosting cookie break on {date}? (y/N) "
        ))
        if not check == "y":
            print("Aborting...")
            exit(0)
        else:
            reimburse_and_mask_host(config, chosen_break.id)


if __name__ == "__main__":
    main()
