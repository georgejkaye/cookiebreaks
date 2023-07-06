from config import parse_config
from database import claim_reimbursed
from interactive import select_claim
from structs import ClaimFilters, claim_list_date_string


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
            claim_reimbursed(config, chosen_claim.id)


if __name__ == "__main__":
    success()
