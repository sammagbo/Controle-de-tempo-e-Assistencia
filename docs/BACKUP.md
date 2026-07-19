# Backup e restauracao

## Fazer backup (producao Railway)
1. Railway -> servico Postgres -> Variables -> copiar DATABASE_PUBLIC_URL.
2. Na raiz do projeto: `./scripts/backup.sh "<DATABASE_PUBLIC_URL>"`.
3. O arquivo sai em `backups/meetingmanager-<data>.dump`. Guarde copias fora desta maquina.
Recomendacao: rodar apos cada reuniao. A URL contem a senha do banco — nao compartilhe
nem versione dumps (a pasta backups/ ja e ignorada pelo git).

## Restaurar (drill ou desastre)
ATENCAO: o restore com --clean sobrescreve o banco de destino.
1. Postgres descartavel para testar:
   docker run -d --name mm_scratch -e POSTGRES_PASSWORD=scratch -e POSTGRES_DB=scratch -p 5544:5432 postgres:18
2. `./scripts/restore.sh backups/<arquivo>.dump "postgresql://postgres:scratch@localhost:5544/scratch"`
3. Conferir: `docker exec mm_scratch psql -U postgres -d scratch -c "SELECT count(*) FROM weeks;"`
4. Limpar: `docker rm -f mm_scratch`
Para restaurar a producao de verdade, use a DATABASE_PUBLIC_URL como destino no passo 2.
