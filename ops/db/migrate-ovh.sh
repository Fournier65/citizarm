#!/usr/bin/env bash
# Installed by GitHub Actions as /home/ubuntu/migrate-ovh.sh.
# Run manually: snapshot the published SQL, backup, verify, apply, then archive.
set -euo pipefail
umask 077

home=/home/ubuntu
project="$home/citizarm"
published_sql="$project/ops/db/migrations/migration.sql"
archive_dir="$home/citizarm-migrations"
backup_dir="$home/citizarm-backups"

if [ "$#" -ne 0 ]; then
  echo "Usage: bash /home/ubuntu/migrate-ovh.sh (no arguments)" >&2
  exit 1
fi
if [ ! -f "$published_sql" ] || [ -L "$published_sql" ] || [ ! -s "$published_sql" ]; then
  echo "Missing or empty published SQL: $published_sql; nothing changed" >&2
  exit 1
fi
if grep -Eiq '^[[:space:]]*(BEGIN|COMMIT|ROLLBACK)([[:space:];]|$)|^[[:space:]]*\\' "$published_sql"; then
  echo "Migration must not manage transactions or contain psql commands" >&2
  exit 1
fi
if [ ! -f "$project/docker-compose.yml" ]; then
  echo "OVH project not found at $project" >&2
  exit 1
fi
cd "$project"

db() {
  docker compose --env-file .env exec -T db "$@"
}

identity="$(db psql -X -A -t -v ON_ERROR_STOP=1 -U citizarm -d citizarm -c \
  "SELECT current_database() || '/' || current_user")"
if [ "$identity" != "citizarm/citizarm" ]; then
  echo "Unexpected database/user: $identity; nothing changed" >&2
  exit 1
fi

checksum="$(sha256sum "$published_sql" | cut -d ' ' -f 1)"
tracking_exists="$(db psql -X -A -t -v ON_ERROR_STOP=1 -U citizarm -d citizarm -c \
  "SELECT to_regclass('public.schema_migrations') IS NOT NULL")"
if [ "$tracking_exists" = "t" ]; then
  previous="$(db psql -X -A -t -v ON_ERROR_STOP=1 -U citizarm -d citizarm -c \
    "SELECT name FROM public.schema_migrations WHERE sha256 = '$checksum' LIMIT 1")"
  if [ -n "$previous" ]; then
    echo "This SQL was already applied as $previous; nothing changed" >&2
    exit 1
  fi
elif [ "$tracking_exists" != "f" ]; then
  echo "Cannot verify migration history; nothing changed" >&2
  exit 1
fi

mkdir -p "$archive_dir" "$backup_dir"
chmod 700 "$archive_dir" "$backup_dir"
name="migration_$(date -u +%Y%m%dT%H%M%S%NZ)_${checksum:0:12}"
archive="$archive_dir/$name.sql"
if [ -e "$archive" ]; then
  echo "Archive name collision; nothing changed" >&2
  exit 1
fi

# Use a private snapshot so the SQL we execute, track and archive is identical,
# even if a deployment updates the tracked source file during the backup.
snapshot="$(mktemp "$archive_dir/.pending_XXXXXXXX.sql")"
cleanup_snapshot() {
  if [ -n "$snapshot" ]; then rm -f -- "$snapshot"; fi
}
trap cleanup_snapshot EXIT
cp -- "$published_sql" "$snapshot"
if [ "$(sha256sum "$snapshot" | cut -d ' ' -f 1)" != "$checksum" ] || ! cmp -s "$published_sql" "$snapshot"; then
  echo "Published SQL changed during preparation; migration not started" >&2
  exit 1
fi

backup="$(mktemp "$backup_dir/${name}_XXXXXX.dump")"
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

# A single connection and transaction keep the schema and its history together.
# Failed SQL exits psql and rolls back; the tracked SQL remains in place.
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
  printf "DO \$\$ BEGIN IF EXISTS (SELECT 1 FROM public.schema_migrations WHERE sha256 = '%s') THEN RAISE EXCEPTION 'Migration already applied'; END IF; END \$\$;\n" "$checksum"
  cat "$snapshot"
  printf "\nINSERT INTO public.schema_migrations (name, sha256) VALUES ('%s', '%s');\n" "$name" "$checksum"
  printf 'COMMIT;\n'
} | db psql -X -v ON_ERROR_STOP=1 -U citizarm -d citizarm

if ! mv -n -- "$snapshot" "$archive" || [ -e "$snapshot" ]; then
  echo "Database migration succeeded, but archiving failed. Do not rerun; check $snapshot and $archive." >&2
  snapshot="" # Preserve the private snapshot for manual recovery.
  exit 1
fi
snapshot=""
echo "Migration applied and archived at $archive"