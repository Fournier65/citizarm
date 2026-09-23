#!/usr/bin/env bash
# Run manually on OVH from the project root after transferring a data-only archive.
set -euo pipefail
umask 077

if [ "$#" -ne 1 ] || [ ! -f "$1" ]; then
  echo "Usage: $0 /path/to/replit-prod-data.dump" >&2
  exit 1
fi
archive="$(realpath "$1")"
cd "$(dirname "$0")/../.."

db() {
  docker compose --env-file .env exec -T db "$@"
}

identity="$(db psql -X -A -t -U citizarm -d citizarm -c \
  "SELECT current_database() || '/' || current_user")"
if [ "$identity" != "citizarm/citizarm" ]; then
  echo "Wrong target database/user: $identity; nothing changed" >&2
  exit 1
fi

tables="$(db psql -X -A -t -U citizarm -d citizarm -c \
  "SELECT (to_regclass('public.newsletter_subscribers') IS NOT NULL)::int || '/' || (to_regclass('public.contact_messages') IS NOT NULL)::int")"
if [ "$tables" != "0/0" ]; then
  echo "Application tables already exist ($tables). Refusing to overwrite or duplicate data." >&2
  exit 1
fi

# Check the archive can be read before touching the destination.
db pg_restore --list < "$archive" > /dev/null

backup="../citizarm-before-import-$(date +%Y%m%d-%H%M%S).dump"
if [ -e "$backup" ]; then
  echo "Backup path already exists; retry later" >&2
  exit 1
fi
db pg_dump -U citizarm -d citizarm -Fc > "$backup"
echo "OVH backup saved at $backup"

db psql -X -v ON_ERROR_STOP=1 -1 -U citizarm -d citizarm < ops/db/001_initial.sql

# Restore only the two expected tables. A failed restore rolls back all copied data;
# the schema remains in place for manual inspection, and reruns are refused.
db pg_restore --data-only --no-owner --no-privileges \
  --table=newsletter_subscribers --table=contact_messages \
  --single-transaction --exit-on-error -U citizarm -d citizarm < "$archive"

db psql -X -v ON_ERROR_STOP=1 -U citizarm -d citizarm <<'SQL'
BEGIN;
SELECT setval(
  pg_get_serial_sequence('public.newsletter_subscribers', 'id'),
  COALESCE((SELECT max(id) FROM public.newsletter_subscribers), 1),
  EXISTS (SELECT 1 FROM public.newsletter_subscribers)
);
SELECT setval(
  pg_get_serial_sequence('public.contact_messages', 'id'),
  COALESCE((SELECT max(id) FROM public.contact_messages), 1),
  EXISTS (SELECT 1 FROM public.contact_messages)
);
COMMIT;
SELECT (SELECT count(*) FROM public.newsletter_subscribers) AS subscribers,
       (SELECT count(*) FROM public.contact_messages) AS messages;
SQL
echo "Check counts against the Replit production source before resuming submissions."