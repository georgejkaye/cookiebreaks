# Cookie break emails

Scripts to interact with the cookie break database.

## Configuration

Before using the scripts, you'll need to set up a `config.yml`...

```sh
cp config.blank.yml config.yml
```

...and populate it with the required fields.

## Scripts

### `announce.py`

Send an email to the mailing list advertising the next cookie break.

### `host.py`

Set the host for one of the upcoming cookie breaks.

### `next.py`

Update the cookie break database with any cookie breaks in the next few weeks.

### `holiday.py`

Set an upcoming break as a holiday or not.
