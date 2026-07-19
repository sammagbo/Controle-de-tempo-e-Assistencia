#!/usr/bin/env bash
# Restaura um dump (pg_dump -Fc) num Postgres de destino.
# CUIDADO: --clean apaga os objetos existentes no destino antes de recriar.
# Uso: ./scripts/restore.sh backups/arquivo.dump "postgresql://user:senha@host:porta/db"
set -euo pipefail

DUMP="${1:-}"
URL="${2:-}"
if [ -z "$DUMP" ] || [ -z "$URL" ]; then
  echo "Uso: $0 <arquivo.dump> <url-postgres-destino>" >&2
  exit 1
fi
if [ ! -f "$DUMP" ]; then
  echo "Erro: arquivo '$DUMP' nao encontrado." >&2
  exit 1
fi

docker run --rm --network host -v "$(pwd)":/work -w /work postgres:18 \
  pg_restore --clean --if-exists --no-owner -d "$URL" "$DUMP"

echo "Restore concluido."
