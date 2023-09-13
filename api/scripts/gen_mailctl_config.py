import sys
import yaml

key_id = sys.argv[1]
config_file = sys.argv[2]
services_file = sys.argv[3]
oauth2_dir = sys.argv[4]

config = {
    "services_file": services_file,
    "oauth2_dir": oauth2_dir,
    "encrypt_cmd": {"exec": "gpg", "args": ["--encrypt", "--recipient", key_id, "-o"]},
    "decrypt_cmd": {"exec": "gpg", "args": ["--decrypt"]},
}

with open(config_file, "w") as f:
    yaml.dump(config, f)
