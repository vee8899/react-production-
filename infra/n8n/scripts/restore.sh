#!/usr/bin/env sh
set -eu

if [ "$#" -ne 1 ]; then
  echo "Usage: ./scripts/restore.sh path/to/n8n-backup.sql.gz" >&2
  exit 1
fi

printf 'This replaces the n8n database. Type RESTORE to continue: '
read -r confirmation
[ "$confirmation" = "RESTORE" ] || exit 1

gzip -dc "$1" | docker compose --env-file .env exec -T postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
