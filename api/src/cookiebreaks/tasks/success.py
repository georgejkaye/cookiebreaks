from cookiebreaks.core.config import parse_config
from cookiebreaks.core.database import claim_reimbursed
from cookiebreaks.core.structs import ClaimFilters, claim_list_date_string

from cookiebreaks.cli.interactive import select_claim


def success():
    config = parse_config()
    chosen_claim = select_claim(config, ClaimFilters(reimbursed=False))
    if chosen_claim is None:
        print("No choice made, exiting")
        exit(0)
    else:
        claim_amount = chosen_claim.claim_amount
        breaks_string = claim_list_date_string(chosen_claim.breaks_claimed)
        check = input(
            (
                f"Have you been reimbursed £{claim_amount} for the cookie breaks on {breaks_string}? (y/N) "
            )
        )
        if not check == "y":
            print("Aborting...")
            exit(0)
        else:
            claim_reimbursed(chosen_claim.id)


if __name__ == "__main__":
    success()
