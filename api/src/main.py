#!/bin/python
import argparse
from pathlib import Path
import sys
from typing import Dict, Callable, Tuple

from dotenv import find_dotenv, load_dotenv
from database import get_env_variable

from tasks.announce import announce
from tasks.claim import claim
from tasks.holiday import holiday
from tasks.host import host
from tasks.reimburse import reimburse
from tasks.success import success
from tasks.update import update

dotenv_path = Path(get_env_variable("CB_ROOT")) / "api" / ".env"
load_dotenv(dotenv_path=dotenv_path)


class HelpParser(argparse.ArgumentParser):
    """
    From https://stackoverflow.com/questions/4042452/display-help-message-with-python-argparse-when-script-is-called-without-any-argu
    """

    def error(self, message):
        sys.stderr.write("error: %s\n" % message)
        self.print_help()
        sys.exit(2)


tasks: Dict[str, Tuple[Callable[[], None], str]] = {
    "announce": (announce, "Announce the next cookie break"),
    "host": (host, "Set the host for a future cookie break"),
    "reimburse": (reimburse, "Reimburse a host of a past cookie break"),
    "claim": (claim, "Make a claim for some past cookie breaks"),
    "success": (success, "Note a successful claim"),
    "holiday": (holiday, "Set an upcoming cookie break as a holiday"),
    "update": (update, "Add upcoming cookie breaks to the database"),
}

longest = len(max(tasks.keys(), key=(lambda k: len(k)))) + 4
task_help = "\n".join(
    list(map(lambda k: f"    {k.ljust(longest)} {tasks[k][1]}", tasks.keys()))
)

parser = HelpParser(
    description="Manage cookie breaks.", formatter_class=argparse.RawTextHelpFormatter
)
parser.add_argument(
    "task", choices=tasks.keys(), metavar="TASK", help=f"Task to perform\n{task_help}"
)
args = parser.parse_args(sys.argv[1:])
tasks[args.task][0]()
