#!/bin/python
import argparse
import sys

from tasks.announce import announce
from tasks.claim import claim
from tasks.holiday import holiday
from tasks.host import host
from tasks.reimburse import reimburse
from tasks.success import success

tasks = {
    "announce": [announce, "Announce the next cookie break"],
    "host": [host, "Set the host for a future cookie break"],
    "reimburse": [reimburse, "Reimburse a host of a past cookie break"],
    "claim": [claim, "Make a claim for some past cookie breaks"],
    "success": [success, "Note a successful claim"],
    "holiday": [holiday, "Set an upcoming cookie break as a holiday"],
    "next": [next, "Add upcoming cookie breaks to the database"]
}

longest = len(max(tasks.keys(), key=(lambda k: len(k)))) + 4
task_help = "\n".join(list(map(lambda k: f"    {k.ljust(longest)} {tasks[k][1]}", tasks.keys())))

parser = argparse.ArgumentParser(description="Manage cookie breaks.", formatter_class=argparse.RawTextHelpFormatter)
parser.add_argument("task", choices=tasks.keys(), metavar="TASK", help=f"Task to perform\n{task_help}")
args = parser.parse_args(sys.argv[1:])
tasks[args.task][0]()