from config import parse_config
from database import claim_for_breaks, reimburse_and_mask_host
from interactive import select_break, select_multiple_breaks
from structs import BreakFilters, format_as_price


def main():
    config = parse_config()
    chosen_breaks = select_multiple_breaks(config, BreakFilters(past=True, hosted=True, admin_claimed=False))
    if len(chosen_breaks) == 0:
        print("No choice made, exiting")
        exit(0)
    else:
        list_of_breaks = "\n".join(list(map(lambda b: f"* {b.get_break_date()} ({format_as_price(b.cost)})", chosen_breaks)))
        costs_of_breaks = list(map(lambda b: b.cost, chosen_breaks))
        total_cost = sum(costs_of_breaks)
        check = input((
            f"Have you claimed for the following breaks\n{list_of_breaks}\ntotalling {format_as_price(total_cost)}? (y/N): "
        ))
        if not check == "y":
            print("Aborting...")
            exit(0)
        else:
            claim_for_breaks(config, list(map(lambda b: b.id, chosen_breaks)))


if __name__ == "__main__":
    main()
