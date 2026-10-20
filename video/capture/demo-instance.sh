#!/usr/bin/env bash
# A instância local da demo, só para as capturas do vídeo. Nunca a produção.
#
#   video/capture/demo-instance.sh up     banco novo, backend e frontend (= api e depois web)
#   video/capture/demo-instance.sh api    só o banco novo e o backend
#   video/capture/demo-instance.sh web    só o frontend, com o backend já no ar
#   video/capture/demo-instance.sh down   para e apaga tudo isso
#
# - O banco: o contêiner mm-demo-db (postgres:16-alpine) na porta 5433, com o volume mm-demo-pgdata, apagado no
#   começo de cada rodada. O banco de desenvolvimento (meetingmanager_db, volume pgdata) fica como está.
# - O backend: o jar construído numa cópia de backend/ (nada é escrito no repositório) e rodado num contêiner
#   eclipse-temurin:21-jdk com --network host, na porta 8080, apontado para o banco da demo por
#   SPRING_DATASOURCE_URL.
# - O frontend: o Vite (npm run dev) na porta MM_WEB_PORT (3000 por padrão), que manda /api para a 8080.
#
# As portas precisam estar livres: o script não para nenhum processo. Os arquivos de trabalho ficam em MM_DEMO_DIR
# (/tmp/mm-demo por padrão).
set -euo pipefail

ROOT=$(cd "$(dirname "$0")/../.." && pwd)
DIR=${MM_DEMO_DIR:-/tmp/mm-demo}
WEB_PORT=${MM_WEB_PORT:-3000}
DB=mm-demo-db
API=mm-demo-api
VOLUME=mm-demo-pgdata
JDK=eclipse-temurin:21-jdk
USER_ID="$(id -u):$(id -g)"

busy() { ss -ltn | awk '{print $4}' | grep -Eq "[:.]$1\$"; }
wait_for() { # descrição, tentativas, comando
      local what=$1 tries=$2; shift 2
      for _ in $(seq "$tries"); do "$@" >/dev/null 2>&1 && return 0; sleep 2; done
      echo "demo-instance: $what did not come up" >&2; return 1
}

down() {
      if [ -f "$DIR/vite.pid" ]; then kill -- "-$(cat "$DIR/vite.pid")" 2>/dev/null || true; rm -f "$DIR/vite.pid"; fi
      docker rm -f "$API" "$DB" >/dev/null 2>&1 || true
      docker volume rm "$VOLUME" >/dev/null 2>&1 || true
      rm -f "$DIR/demo-password"
      echo "demo-instance: down ($DB, $VOLUME, $API and Vite removed)"
}

api() {
      down >/dev/null
      for port in 5433 8080; do
            if busy "$port"; then echo "demo-instance: port $port is in use; free it first (this script stops nothing)" >&2; exit 1; fi
      done
      mkdir -p "$DIR" && chmod 700 "$DIR"

      docker run -d --name "$DB" -p 127.0.0.1:5433:5432 -v "$VOLUME:/var/lib/postgresql/data" \
            -e POSTGRES_USER=meeting_user -e POSTGRES_PASSWORD=meeting_password -e POSTGRES_DB=meeting_db \
            postgres:16-alpine >/dev/null
      wait_for "$DB" 60 docker exec "$DB" pg_isready -U meeting_user -d meeting_db

      # o jar, a partir de uma cópia do backend; o Maven guarda as dependências em $DIR/home. Uma rodada nova reusa o
      # jar da anterior se o backend não mudou (MM_REBUILD=1 força a construção).
      local sources; sources=$(cd "$ROOT" && git ls-files -s backend/src/main backend/pom.xml backend/.mvn | sha256sum | cut -c1-16)
      if [ -n "${MM_REBUILD:-}" ] || [ ! -f "$DIR/app.jar" ] || [ "$(cat "$DIR/app.sources" 2>/dev/null)" != "$sources" ]; then
            rm -rf "$DIR/build" && mkdir -p "$DIR/build" "$DIR/home"
            cp -r "$ROOT/backend" "$DIR/build/backend" && rm -rf "$DIR/build/backend/target"
            docker run --rm --user "$USER_ID" -e HOME=/work/home -e MAVEN_OPTS=-Duser.home=/work/home -v "$DIR:/work" \
                  -w /work/build/backend "$JDK" ./mvnw -q -B -DskipTests package
            cp "$DIR"/build/backend/target/*-SNAPSHOT.jar "$DIR/app.jar"
            echo "$sources" > "$DIR/app.sources"
      fi

      docker run -d --name "$API" --network host --user "$USER_ID" -v "$DIR/app.jar:/app.jar:ro" \
            -e SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5433/meeting_db -e SERVER_ADDRESS=127.0.0.1 \
            "$JDK" java -jar /app.jar >/dev/null
      wait_for "the backend" 90 sh -c 'curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/api/v1/auth/me | grep -Eq "^40[13]$"'
      echo "demo-instance: database $DB on 5433 and backend on 8080 are up"
}

web() {
      if busy "$WEB_PORT"; then echo "demo-instance: port $WEB_PORT is in use; free it first (this script stops nothing)" >&2; exit 1; fi
      cd "$ROOT"
      [ -d node_modules ] || npm ci --no-audit --no-fund
      setsid nohup npx vite --port "$WEB_PORT" --strictPort --host 127.0.0.1 > "$DIR/vite.log" 2>&1 < /dev/null &
      echo $! > "$DIR/vite.pid"
      wait_for "Vite" 60 curl -sf "http://localhost:$WEB_PORT/"
      echo "demo-instance: frontend on http://localhost:$WEB_PORT"
}

up() {
      if busy "$WEB_PORT"; then echo "demo-instance: port $WEB_PORT is in use; free it first (this script stops nothing)" >&2; exit 1; fi
      api
      web
}

case "${1:-}" in
      up) up ;;
      api) api ;;
      web) web ;;
      down) down ;;
      *) echo "usage: $0 up|api|web|down" >&2; exit 2 ;;
esac
