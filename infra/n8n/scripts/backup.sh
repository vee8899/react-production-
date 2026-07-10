#!/usr/bin/env sh
set -eu

backup_dir=${BACKUP_DIR:-./backups}
timestamp=$(date -u +%Y%m%dT%H%M%SZ)

mkdir -p "$backup_dir"
docker compose --env-file .env exec -T postgres \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$backup_dir/n8n-$timestamp.sql.gz"

find "$backup_dir" -type f -name 'n8n-*.sql.gz' -mtime +30 -delete
