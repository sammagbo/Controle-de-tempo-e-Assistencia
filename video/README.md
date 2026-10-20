# Vídeo do portfólio: as telas reais, com dados neutros

O vídeo de demonstração do MeetingManager para o cartão dele em sammagbo.com, com legendas em francês. Ele mostra
as telas reais do app, numa instância local com uma reunião semanal de equipe fictícia e neutra: nenhuma seção ou
parte real da reunião, nenhum logo da comunidade, nenhuma palavra religiosa. Nenhum dado real, nenhuma produção.

## O que é preciso

- Docker, Node 22 ou mais, e o Chrome (`CHROME=/caminho` se não estiver em `/usr/bin/google-chrome`).
- As portas 5433 e 8080 livres, e a do frontend (`MM_WEB_PORT`, 3000 por padrão). Os scripts não param nenhum
  processo.

## As capturas

```bash
cd video/capture && npm ci
./demo-instance.sh up             # banco novo (mm-demo-db, porta 5433), backend (8080) e Vite
node seed.mjs                     # temas neutros, o usuário da demo e as dez reuniões do histórico
node capture.mjs                  # a reunião desta semana pelas telas, e as capturas em video/public/mm/
node contact-sheet.mjs ../public/mm
./demo-instance.sh down           # para e apaga o banco da demo, o backend e o Vite
```

Com o frontend em outra porta: `MM_WEB_PORT=3001 ./demo-instance.sh up` e
`MM_WEB_URL=http://localhost:3001 node capture.mjs`.

- **A instância** (`demo-instance.sh`): o banco é o contêiner `mm-demo-db` (`postgres:16-alpine`) na porta 5433,
  com o volume `mm-demo-pgdata`, apagado no começo de cada rodada. O backend é construído numa cópia de `backend/`
  em `/tmp/mm-demo` e roda num contêiner `eclipse-temurin:21-jdk` com `--network host`, apontado para o banco da
  demo por `SPRING_DATASOURCE_URL`. O banco de desenvolvimento (`meetingmanager_db`, volume `pgdata`) não é tocado.
- **Os dados** ficam só em `backend/src/test/resources/demo/meetingmanager-demo.json`: as partes de uma « Reunião
  semanal da equipe » de 60 min, os nomes (todos com sobrenome Exemplo, Demo, Fictício ou Fictícia), os temas
  neutros das semanas e as dez reuniões terminadas, nas terças de 11/08 a 13/10/2026. `seed.mjs` os grava por SQL,
  só no `mm-demo-db` da porta 5433 (`db.mjs` confere o contêiner, a porta, a imagem e o volume, e se recusa a rodar
  em qualquer outro banco). O usuário `demo@example.com` ganha uma senha gerada na hora, guardada em
  `/tmp/mm-demo/demo-password` (0600).
- **A captura** (`capture.mjs`) faz a reunião de terça 20/10/2026, às 19:30 de São Paulo, pelas telas: o painel, a
  preparação, o cronômetro parte a parte, a tela da sala numa segunda aba, a contagem numa terceira e o fim. O
  relógio do navegador é o da demo (`page.clock`), parado e avançado passo a passo; o `started_at` da reunião e o
  `created_at` da presença, que vêm do servidor, são alinhados a ele no banco da demo. O login é pela API, sem a
  tela de login, e o splash não toca. O vídeo do cabeçalho fica parado no primeiro quadro.
- **As guardas**: só passam pedidos para `localhost` e para as fontes do Google; o resto é bloqueado e vai para o
  log. Antes de cada captura, a tela é lida (o texto, os valores e os placeholders à vista) e a rodada para se
  aparecer um termo de `terms.mjs`, o `logo.png`, um ícone que virou palavra, um campo de nome vazio ou uma pessoa
  fora dos dados. O seed confere os mesmos termos nos dados e no banco.
- **O log** vai para `~/mm-captura.log`, com a hora do relógio da demo em cada linha.
- As capturas e os vídeos não entram no git (`video/public/mm/`, `video/out/`).
