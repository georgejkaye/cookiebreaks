#!/bin/python
import sys

OUTPUT_FILE = sys.argv[1]
MSMTP_HOST = sys.argv[2]
MSMTP_PORT = sys.argv[3]
MSMTP_AUTH = sys.argv[4]
MSMTP_FROM = sys.argv[5]
MSMTP_USER = sys.argv[6]
PASSWORD_EVAL = sys.argv[7]

with open(OUTPUT_FILE, "w") as f:
    f.write(
        "\n".join(
            [
                "defaults",
                "auth on",
                "tls on",
                "tls_trust_file /etc/ssl/certs/ca-certificates.crt",
                "",
                "account email",
                f"host {MSMTP_HOST}",
                f"port {MSMTP_PORT}",
                f"auth {MSMTP_AUTH}",
                f"from {MSMTP_FROM}",
                f"user {MSMTP_USER}",
                f"passwordeval python {PASSWORD_EVAL}",
                "",
                "account default: email",
            ]
        )
        + "\n"
    )
