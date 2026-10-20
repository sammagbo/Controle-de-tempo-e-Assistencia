// Prepara o banco da demo para as capturas, com os dados fictícios de
// backend/src/test/resources/demo/meetingmanager-demo.json:
// - troca o tema de todas as semanas do banco por temas neutros (os seeds V2 a V4 trazem leituras bíblicas);
// - cria o usuário só da demo, demo@example.com, com uma senha gerada agora, guardada em $MM_DEMO_DIR/demo-password
//   (0600; por padrão /tmp/mm-demo) para o capture.mjs fazer o login;
// - grava as dez reuniões terminadas do histórico, com as partes e a presença. O created_at da presença não aceita
//   valor na API, por isso o histórico entra por SQL.
//
//   node seed.mjs          (numa instância nova: demo-instance.sh up)
//
// Só escreve no mm-demo-db da porta 5433 (db.mjs) e para se algum texto dos dados tiver um termo da guarda.
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { assertDemoDb, lit, sql } from './db.mjs';
import { findTerm } from './terms.mjs';

const DATA = new URL('../../backend/src/test/resources/demo/meetingmanager-demo.json', import.meta.url);
const DEMO_DIR = process.env.MM_DEMO_DIR ?? '/tmp/mm-demo';
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
const data = JSON.parse(readFileSync(DATA, 'utf8'));

// A guarda também vale para os dados: nenhum termo em nenhum texto.
const texts = (value) => (typeof value === 'string' ? [value] : Array.isArray(value) ? value.flatMap(texts) : value && typeof value === 'object' ? Object.entries(value).flatMap(([k, v]) => [k, ...texts(v)]) : []);
for (const text of texts(data)) {
      const term = findTerm(text);
      if (term) throw new Error(`the demo data has "${term}" in "${text}": stop`);
}
// Os nomes: todos com sobrenome Exemplo, Demo, Fictício ou Fictícia.
const people = [data.thisWeek.president, ...data.thisWeek.names, ...data.history.flatMap((m) => [m.president, ...m.names])]
      .flatMap((names) => names.split(' e '));
const odd = people.filter((who) => !/^\p{Lu}\p{Ll}+ (Exemplo|Demo|Fictício|Fictícia)$/u.test(who));
if (odd.length) throw new Error(`names without a fictitious surname: ${[...new Set(odd)].join(', ')}`);

assertDemoDb();
// O backend cria o esquema (Flyway) na partida: espera a última migration.
for (let i = 0; ; i++) {
      const ready = sql(`SELECT to_regclass('public.flyway_schema_history') IS NOT NULL;`) === 't'
            && sql(`SELECT count(*) FROM flyway_schema_history WHERE version = '5' AND success;`) === '1';
      if (ready) break;
      if (i > 90) throw new Error('the backend did not create the schema (Flyway V1 to V5)');
      await sleep(2000);
}
if (sql(`SELECT count(*) FROM users WHERE email = ${lit(data.user.email)};`) !== '0') {
      throw new Error(`${data.user.email} already exists: the seed runs once, on a fresh instance (demo-instance.sh up)`);
}

// As semanas do banco, na ordem dos períodos.
const weeks = sql(`SELECT w.id, p.name, w.label, w.date_range FROM weeks w JOIN periods p ON p.id = w.period_id ORDER BY p.start_date, w.label;`)
      .split('\n').map((line) => line.split('\t')).map(([id, period, label, range]) => ({ id, period, label, range }));

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const month = (word) => MONTHS.indexOf(word.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().slice(0, 3));
/** O primeiro e o último dia de «10-16 de Agosto» ou «31 Ago - 6 Set», em 2026. */
function rangeOf(text) {
      const same = text.match(/^(\d+)-(\d+) de (\p{L}+)$/u);
      const cross = text.match(/^(\d+) (\p{L}+) - (\d+) (\p{L}+)$/u);
      const day = (d, m) => `2026-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (same) return [day(+same[1], month(same[3])), day(+same[2], month(same[3]))];
      if (cross) return [day(+cross[1], month(cross[2])), day(+cross[3], month(cross[4]))];
      throw new Error(`cannot read the week range "${text}"`);
}
/** A semana do banco que contém a data. */
function weekOf(date, range) {
      const found = weeks.filter((week) => week.range === range);
      if (found.length !== 1) throw new Error(`${found.length} weeks "${range}" in the database`);
      const [first, last] = rangeOf(range);
      if (date < first || date > last) throw new Error(`${date} is not in the week ${range}`);
      return found[0].id;
}

const statements = ['BEGIN;'];
// Os temas: os do período das capturas pelo rótulo da semana, os outros em rodízio.
let other = 0;
for (const week of weeks) {
      const theme = data.themes[week.period]?.[week.label] ?? data.otherThemes[other++ % data.otherThemes.length];
      statements.push(`UPDATE weeks SET theme = ${lit(theme)} WHERE id = ${lit(week.id)};`);
}

const password = randomBytes(18).toString('base64url');
statements.push(`INSERT INTO users (email, password_hash) VALUES (${lit(data.user.email)}, crypt(${lit(password)}, gen_salt('bf', 10)));`);

const { day, start, zone, attendanceAfterMinutes } = data.meeting;
for (const meeting of data.history) {
      const id = randomUUID();
      const total = meeting.actualSeconds.reduce((sum, s) => sum + s, 0);
      const startedAt = `(timestamp ${lit(`${meeting.date} ${start}:00`)} AT TIME ZONE ${lit(zone)})`;
      statements.push(`INSERT INTO meetings (id, week_id, user_id, meeting_day, started_at, finished_at, total_duration_seconds, president)
            VALUES (${lit(id)}, ${lit(weekOf(meeting.date, meeting.week))}, (SELECT id FROM users WHERE email = ${lit(data.user.email)}), ${lit(day)},
                    ${startedAt}, ${startedAt} + interval '${total} seconds', ${total}, ${lit(meeting.president)});`);
      data.parts.forEach((part, k) => {
            statements.push(`INSERT INTO agenda_items (meeting_id, title, estimated_minutes, actual_seconds, position, status, section,
                    allows_comments, requires_post_comment, assigned_names, skip_timing)
                  VALUES (${lit(id)}, ${lit(part.title)}, ${part.minutes}, ${meeting.actualSeconds[k]}, ${k + 1}, 'completed', ${lit(part.section)},
                    false, false, ${lit(meeting.names[k])}, false);`);
      });
      const { presencial, zoom } = meeting.attendance;
      statements.push(`INSERT INTO attendance (meeting_id, count, presencial, zoom, created_at)
            VALUES (${lit(id)}, ${presencial + zoom}, ${presencial}, ${zoom}, ${startedAt} + interval '${attendanceAfterMinutes} minutes');`);
}
statements.push('COMMIT;');
sql(statements.join('\n'));

mkdirSync(DEMO_DIR, { recursive: true, mode: 0o700 });
writeFileSync(join(DEMO_DIR, 'demo-password'), password + '\n', { mode: 0o600 });

// Nenhuma semana nem período ficou com um termo da guarda.
for (const text of sql('SELECT theme FROM weeks UNION ALL SELECT name FROM periods;').split('\n')) {
      const term = findTerm(text);
      if (term) throw new Error(`the database still has "${term}" in "${text}": stop`);
}

const count = (query) => sql(query);
console.log(`seed: ${count('SELECT count(*) FROM weeks;')} weeks with neutral themes, user ${data.user.email}, `
      + `${count('SELECT count(*) FROM meetings WHERE finished_at IS NOT NULL;')} finished meetings, `
      + `${count('SELECT count(*) FROM agenda_items;')} parts, ${count('SELECT count(*) FROM attendance;')} attendance rows`);
