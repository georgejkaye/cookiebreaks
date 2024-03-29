# Cookie break emails

Scripts to interact with the cookie break database.

## Installation

You should install [Poetry](https://python-poetry.org/) for managing packages.

```sh
curl -sSL https://install.python-poetry.org | python3 -
```

To install the packages and generate a `.venv` file in the project directory,
run the following:

```sh
poetry config virtualenvs.in-project true
poetry install
```

Now all the dependencies will have been installed in the virtual shell.
To enter the virtual shell, run the following:

```sh
poetry shell
```

## Configuration

Before using the scripts, you'll need to set up a `config.yml`...

```sh
cp config.blank.yml config.yml
```

...and populate it with the required fields.
You will also need to set up an account with `msmtp` to send the emails.
How to do this with an Office 365 account is [detailed below](https://github.com/georgejkaye/cookiebreak-scripts#setting-up-smtp-with-office-365).

## Usage

You will need to run the scripts from within a Poetry virtualenv.
The easiest way to do this is to run the following in the `api` directory:

```bash
poetry run python src/main.py TASK
```

Where `TASK` can be chosen from the following list:

```txt
announce      Announce the next cookie break
host          Set the host for a future cookie break
reimburse     Reimburse a host of a past cookie break
claim         Make a claim for some past cookie breaks
success       Note a successful claim
holiday       Set an upcoming cookie break as a holiday
next          Add upcoming cookie breaks to the database
```

A helper executable has been provided which does the necessary `poetry` commands for you.
To use it, set the environment variable `CB_ROOT` to the path this repo is cloned to.

```
CB_ROOT=/home/george/cookiebreak-scripts cb
```

## Setting up SMTP with Office 365

It is recommended to send the automated emails from your university account, so
that Microsoft doesn't flag them as suspicious.
However, it's a little bit harder these days to connect to a Microsoft 365
account because of increased security measures using OAuth, so just putting your
user and password in a file no longer suffices.

### Getting an OAuth token

Obtaining the token is performed using `mailctl`.
The OAuth token will be stored in a file encrypted using `gpg`, so you will
need a gpg key set up, and a key id.
To find the ids of keys, run the following:

```bash
gpg --list-secret-keys --keyid-format LONG
```

This will list your keys in the format `rsa4096/XXXXXXXXXXXXXX`: the key id is
the characters after the slash.

The main `mailctl` config is found at `~/.config/mailctl/config.yaml`:

```yaml
# ~/.config/mailctl/config.yaml
services_file: /<home directory>/.config/mailctl/services.yaml
oauth2_dir: /<home directory>/.local/var/mailctl
encrypt_cmd:
  exec: gpg
  args:
    - --encrypt
    - --recipient
    - <key id>
    - -o
decrypt_cmd:
  exec: gpg
  args:
    - --decrypt
```

Crucially, make sure that `oauth2_dir` exists, as it will not be made for you!
The actual configuration for the microsoft account lives in
`~/.config/mailctl/services.yaml`:

```yaml
# ~/.config/mailctl/services.yaml
microsoft:
  auth_endpoint: https://login.microsoftonline.com/common/oauth2/v2.0/authorize
  auth_http_method: GET
  auth_params_mode: query-string
  token_endpoint: https://login.microsoftonline.com/common/oauth2/v2.0/token
  token_http_method: POST
  token_params_mode: request-body-form
  redirect_uri: http://localhost:8080
  auth_scope: https://outlook.office365.com/IMAP.AccessAsUser.All https://outlook.office365.com/SMTP.Send offline_access
  client_id: 08162f7c-0fd2-4200-a84a-f25a4db0b584
  client_secret: TxRBilcHdC6WGBee]fs?QR:SJ8nI[g82
```

The `client_id` and the `client_secret` are the publicly available details
that Thunderbird provides Microsoft.
These can be found in the [Thunderbird source](https://hg.mozilla.org/comm-central/file/tip/mailnews/base/src/OAuth2Providers.jsm).

To setup the account, run the following, where `<alias>` is a name you
will use to identify the account later.

```bash
mailctl authorize microsoft <alias>
```

Navigate to `localhost:8080/start`, select `Sign in options', select 'Sign in
with organisation', then log in as normal.
You will need to accept the incoming key in the terminal window.
After this, the page should acknowledge your success, and tell you where the
tokens are stored.

This procedure gets you an *access token* and a *refresh token*.
The former is what is used to authenticate you with OAuth.
This token eventually expires, after which the refresh token is used to get a
new one.
To get the access token details manually, run:

```bash
mailctl access <alias>
```

This prints a json with a variety of useful information to `stdout`.
To print just the access token to `stdout` we can write a little python script
(other scripting languages are available).

```py
# ~/.get_token.py
import json
from subprocess import check_output
access_token = check_output(["mailctl", "access", "<alias>"]).decode("utf-8")[:-1]
print(access_token)
```

### Sending mail

Now that we have a way of getting an OAuth token, we can send the mail using
`msmtp`.
This will also need to be configured so that the OAuth tokens can be

```bash
# ~/.msmtprc
defaults
auth           on
tls            on
tls_trust_file /etc/ssl/certs/ca-certificates.crt
logfile        ~/.msmtp.log

account        outlook
host           smtp.office365.com
port           587
auth           xoauth2
from           <microsoft email>
user           <microsoft email>
passwordeval   python ~/.get_token.py

account default: outlook
```

The value of the `passwordeval` field calls the script we just wrote so it
always grabs an up to date access token.
To check it works, send a test email:

```bash
echo "hello" | msmtp -a default <email>
```

If you receive this email, everything is set up properly!
