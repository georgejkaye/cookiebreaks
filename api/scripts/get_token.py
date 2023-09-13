#!/bin/python
# ~/.get_token.py
import os
from subprocess import check_output
import subprocess

subprocess.run(["cp", "mail/token.auth", "mail/oauth/token.auth"])
access_token = check_output(
    ["mailctl", "-c", "mail/config.yaml", "access", "token"]
).decode("utf-8")[:-1]
print(access_token)
