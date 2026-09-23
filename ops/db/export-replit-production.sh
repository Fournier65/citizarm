#!/usr/bin/env bash
# Run in the Replit shell. Reads from production; never use the dev DATABASE_URL.
set -euo pipefail
umask 077

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 /path/outside/repository/replit-prod-data.dump" >&2
  exit 1
fi

output="$(realpath -m "$1")"
repo="$(cd "$(dirname "$0")/../.." && pwd)"
case "$output" in
  "$repo"/*) echo "Refusing to store private production data in the repository" >&2; exit 1 ;;
esac
if [ -e "$output" ]; then
  echo "Refusing to overwrite an existing file" >&2
  exit 1
fi

echo "Use the PRODUCTION connection URL from Replit Database > Settings (not the development URL)." >&2
read -r -s -p "Production connection URL (hidden): " source_url
echo >&2
if [ -z "$source_url" ]; then
  echo "No URL provided" >&2
  exit 1
fi

if ! pg_dump --dbname="$source_url" --format=custom --data-only \
  --no-owner --no-privileges \
  --table=public.newsletter_subscribers \
  --table=public.contact_messages \
  --file="$output"; then
  rm -f -- "$output"
  echo "Export failed; no archive was kept" >&2
  exit 1
fi
unset source_url
echo "Exported private data to $output. Do not put this file in Git or share it in chat."