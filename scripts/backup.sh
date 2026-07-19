#!/usr/bin/env bash
# Backup do Postgres do MeetingManager (local ou Railway) com pg_dump 18 via Docker.
# Uso:
#   DATABASE_URL="postgresql://user:senha@host:porta/db" ./scripts/backup.sh
#   ou: ./scripts/backup.sh "postgresql://user:senha@host:porta/db"
set -euo pipefail

URL="${1:-${DATABASE_URL:-}}"
if [ -z "$URL" ]; then
  echo "Erro: informe a URL do banco (argumento 1 ou env DATABASE_URL)." >&2
  exit 1
fi

mkdir -p backups
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="backups/meetingmanager-${STAMP}.dump"

docker run --rm --network host postgres:18 pg_dump "$URL" -Fc > "$OUT"

SIZE="$(du -h "$OUT" | cut -f1)"
echo "Backup criado: $OUT (${SIZE})"
