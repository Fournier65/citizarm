#!/usr/bin/env bash
# Apply one reviewed, versioned SQL migration to OVH after a verified backup.
# Never run automatically from the app, a build, or a Git push.
set -euo pipefail
umask 077

repo="$(cd "$(dirname "$0")/../.." && pwd)"
directory="$repo/ops/db/migrations"

if [ "$#" -ne 1 ] || [ ! -f "$1" ]; then
  echo "Usage: bash ops/db/migrate-ovh.sh ops/db/migrations/0002_description.sql" >&2
  exit 1
fi
migration="$(realpath "$1")"
name="$(basename "$migration" .sql)"
if [[ "$migration" != "$directory/"* || ! "$name" =~ ^[0-9]{4}_[a-z0-9_]+$ ]]; then
  echo "Only numbered .sql files inside ops/db/migrations/ are accepted" >&2
  exit 1
fi
if grep -Eiq '^[[:space:]]*(BEGIN|COMMIT|ROLLBACK)([[:space:];]|$)|^[[:space:]]*\\' "$migration"; then
  echo "Migration files must not manage transactions or contain psql commands" >&2
  exit 1
fi
checksum="$(sha256sum "$migration" | cut -d ' ' -f 1)"
cd "$repo"

db() {
  docker compose --env-file .env exec -T db "$@"
}

identity="$(db psql -X -A -t -v ON_ERROR_STOP=1 -U citizarm -d citizarm -c \
  "SELECT current_database() || '/' || current_user")"
if [ "$identity" != "citizarm/citizarm" ]; then
  echo "Refusing to modify unexpected database/user: $identity" >&2
  exit 1
fi

tracking_exists="$(db psql -X -A -t -v ON_ERROR_STOP=1 -U citizarm -d citizarm -c \
  "SELECT to_regclass('public.schema_migrations') IS NOT NULL")"
if [ "$tracking_exists" = "t" ]; then
  previous="$(db psql -X -A -t -v ON_ERROR_STOP=1 -U citizarm -d citizarm -c \
    "SELECT sha256 FROM public.schema_migrations WHERE name = '$name'")"
  if [ -n "$previous" ]; then
    if [ "$previous" != "$checksum" ]; then
      echo "Migration $name was already applied with different contents; refusing" >&2
      exit 1
    fi
    echo "Migration $name already applied; nothing changed."
    exit 0
  fi
elif [ "$tracking_exists" != "f" ]; then
  echo "Cannot verify migration history; refusing" >&2
  exit 1
fi

last_number=1  # 0001 was the initial, one-time import.
if [ "$tracking_exists" = "t" ]; then
  last_number="$(db psql -X -A -t -v ON_ERROR_STOP=1 -U citizarm -d citizarm -c \
    "SELECT COALESCE(MAX(left(name, 4)::integer), 1) FROM public.schema_migrations")"
fi
expected=$((last_number + 1))
if [ "$((10#${name:0:4}))" -ne "$expected" ]; then
  printf 'Expected migration %04d after the last applied migration; refusing %s\n' "$expected" "$name" >&2
  exit 1
fi

backup_dir="$repo/../citizarm-backups"
mkdir -p "$backup_dir"
chmod 700 "$backup_dir"
backup="$(mktemp "$backup_dir/${name}_$(date -u +%Y%m%dT%H%M%SZ)_XXXXXX.dump")"
if ! db pg_dump -U citizarm -d citizarm -Fc > "$backup"; then
  rm -f -- "$backup"
  echo "Backup failed; migration not started" >&2
  exit 1
fi
if [ ! -s "$backup" ] || ! db pg_restore --file=/dev/null < "$backup"; then
  echo "Backup could not be verified ($backup); migration not started" >&2
  exit 1
fi
echo "Verified backup: $backup"

# One connection and one transaction: a SQL failure rolls back both schema
# changes and the migration-history entry. The advisory lock serializes runs.
{
  cat <<'SQL'
BEGIN;
SELECT pg_advisory_xact_lock(19841231, 5000);
CREATE TABLE IF NOT EXISTS public.schema_migrations (
  name text PRIMARY KEY,
  sha256 text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);
SQL
  printf "DO \$\$ BEGIN IF EXISTS (SELECT 1 FROM public.schema_migrations WHERE name = '%s') THEN RAISE EXCEPTION 'Migration already applied'; END IF; END \$\$;\n" "$name"
  cat "$migration"
  printf "\nINSERT INTO public.schema_migrations (name, sha256) VALUES ('%s', '%s');\n" "$name" "$checksum"
  printf 'COMMIT;\n'
} | db psql -X -v ON_ERROR_STOP=1 -U citizarm -d citizarm

echo "Applied $name to OVH. Keep the backup and verify the feature before deploying app code."