// Captura as telas reais do MeetingManager para o vídeo do portfólio, numa instância local da demo (demo-instance.sh up
// e seed.mjs antes). A reunião desta semana, terça 20/10/2026 às 19:30 de São Paulo, é feita pelas próprias telas:
// a preparação, o cronômetro parte a parte, a tela da sala, a contagem dos presentes e o fim. Depois vêm o relatório,
// o histórico, as estatísticas e as configurações.
//
//   MM_WEB_URL=http://localhost:3001 node capture.mjs
//
// - O relógio do navegador é o da demo (page.clock), parado e avançado passo a passo: os tempos do cronômetro são
//   exatos e repetíveis. As horas que vêm do servidor e do banco (o started_at da reunião e o created_at da presença)
//   são alinhadas a esse relógio, só no banco da demo, e a tela é recarregada antes da captura.
// - Sem a tela de login e sem o splash: o login é pela API, no mesmo contexto, e o sessionStorage diz que o splash já
//   passou. O vídeo do cabeçalho fica parado no primeiro quadro.
// - Só passam pedidos para localhost e para as fontes do Google; o resto é bloqueado e anotado no log.
// - Antes de cada captura, a guarda lê a tela (o texto, os valores e os placeholders à vista) e para se aparecer um
//   termo de terms.mjs, o logo.png, um ícone que virou palavra ou uma pessoa fora dos dados da demo.
//
// As capturas (2x), o manifest.json, com as caixas em px CSS que o vídeo usa, e o text.json, com as linhas de texto à
// vista em cada captura (para o vídeo conferir as bordas), vão para video/public/mm/; o log, com a hora do relógio da
// demo em cada captura, para ~/mm-captura.log.
import { appendFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { lit, sql } from './db.mjs';
import { findTerm } from './terms.mjs';

const WEB = (process.env.MM_WEB_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const DEMO_DIR = process.env.MM_DEMO_DIR ?? '/tmp/mm-demo';
const LOG = process.env.MM_CAPTURE_LOG ?? join(homedir(), 'mm-captura.log');
const OUT = new URL('../public/mm/', import.meta.url);
const DATA = new URL('../../backend/src/test/resources/demo/meetingmanager-demo.json', import.meta.url);
const VIEWPORT = { width: 1440, height: 900 }; // 16:10, como o vídeo
const SCALE = 2;
const ALLOWED = new Set([new URL(WEB).hostname, 'fonts.googleapis.com', 'fonts.gstatic.com']);
if (new URL(WEB).hostname !== 'localhost') throw new Error(`${WEB}: the capture only runs against localhost`);

const data = JSON.parse(readFileSync(DATA, 'utf8'));
const ZONE = data.meeting.zone;
const week = data.thisWeek;
const parts = data.parts.map((part, k) => ({ ...part, name: week.names[k], actual: week.actualSeconds[k] }));
const people = new Set([week.president, ...week.names, ...data.history.flatMap((m) => [m.president, ...m.names])].flatMap((n) => n.split(' e ')));

// ── O relógio da demo ────────────────────────────────────────────────────────────────────────────────────────────────
/** O instante em que o relógio de ZONE marca `date time`. */
function wall(date, time) {
      const guess = new Date(`${date}T${time}Z`);
      const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
            timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
      }).formatToParts(guess).map((x) => [x.type, x.value]));
      const shown = new Date(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}Z`);
      return new Date(guess.getTime() - (shown.getTime() - guess.getTime()));
}
const START = wall(week.date, `${data.meeting.start}:00`);
const plus = (date, seconds) => new Date(date.getTime() + seconds * 1000);
const partStart = parts.map((_, k) => plus(START, parts.slice(0, k).reduce((sum, p) => sum + p.actual, 0)));
const END = plus(START, parts.reduce((sum, p) => sum + p.actual, 0));
const clockText = (date) => new Intl.DateTimeFormat('pt-BR', { timeZone: ZONE, dateStyle: 'short', timeStyle: 'medium' }).format(date);

// Os momentos das capturas. As cenas do cronômetro pedem: live-2 depois do previsto da parte 4, display-0 dentro do
// previsto da parte 5 e display-1 depois dele.
const AT = {
      dashboard: plus(START, -6 * 60),
      setup: plus(START, -4 * 60),
      'live-0': plus(partStart[0], 12),
      'live-1': plus(partStart[2], 390),
      'live-2': plus(partStart[3], 1250),
      'display-0': plus(partStart[4], 250),
      'display-1': plus(partStart[4], 684),
      'attendance-0': plus(partStart[5], 33),
      'attendance-1': plus(partStart[5], 123),
      report: plus(END, 40),
      history: plus(END, 100),
      stats: plus(END, 160),
      settings: plus(END, 220),
};
const within = (k, at) => (at - partStart[k]) / 1000;
if (!(within(3, AT['live-2']) > parts[3].minutes * 60 && within(3, AT['live-2']) < parts[3].actual)) throw new Error('live-2 must be past the planned time of part 4');
if (!(within(4, AT['display-0']) < parts[4].minutes * 60)) throw new Error('display-0 must be inside the planned time of part 5');
if (!(within(4, AT['display-1']) > parts[4].minutes * 60 && within(4, AT['display-1']) < parts[4].actual)) throw new Error('display-1 must be past the planned time of part 5');

// ── O log ────────────────────────────────────────────────────────────────────────────────────────────────────────────
let demoNow = AT.dashboard;
writeFileSync(LOG, '');
const log = (line) => {
      const text = `${clockText(demoNow)}  ${line}`;
      console.log(text);
      appendFileSync(LOG, text + '\n');
};
log(`capture of the MeetingManager demo: ${WEB}, ${VIEWPORT.width}x${VIEWPORT.height} at ${SCALE}x, ${ZONE}, pt-BR`);

// ── O navegador ──────────────────────────────────────────────────────────────────────────────────────────────────────
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const manifestFile = new URL('manifest.json', OUT);
const manifest = { viewport: VIEWPORT, scale: SCALE, shots: {} };

const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true });
const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: SCALE, timezoneId: ZONE, locale: 'pt-BR', serviceWorkers: 'block' });
const blocked = [];
const hosts = {};
await context.route('**/*', (route) => {
      const url = new URL(route.request().url());
      if (ALLOWED.has(url.hostname)) {
            hosts[url.hostname] = (hosts[url.hostname] ?? 0) + 1;
            return route.continue();
      }
      blocked.push(url.href);
      log(`blocked ${route.request().method()} ${url.href}`);
      return route.abort('blockedbyclient');
});
// o splash só toca uma vez por sessão: ele já «passou»
await context.addInitScript(() => sessionStorage.setItem('meetingmanager_loaded', 'true'));
await context.clock.install({ time: plus(AT.dashboard, -60) });
await context.clock.pauseAt(AT.dashboard);

const problems = [];
const watch = (page) => {
      page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
      page.on('console', (message) => { if (message.type() === 'error') log(`console error: ${message.text()}`); });
      page.on('dialog', async (dialog) => { problems.push(`dialog: ${dialog.message()}`); await dialog.dismiss(); });
      return page;
};

/** Avança o relógio da demo até `to`, disparando os timers que vencem no caminho (uma vez cada). */
async function clockTo(to) {
      if (to < demoNow) throw new Error(`the demo clock cannot go back to ${clockText(to)}`);
      if (to > demoNow) await context.clock.fastForward(to.getTime() - demoNow.getTime());
      demoNow = to;
}
/** Deixa as animações e os timers curtos andarem: o relógio corre `ms`, de 16 em 16 ms. */
async function settleClock(ms = 1500) {
      await context.clock.runFor(ms);
      demoNow = plus(demoNow, ms / 1000);
}

// O login, pela API, no mesmo contexto: o cookie SESSION fica nele.
const password = readFileSync(join(DEMO_DIR, 'demo-password'), 'utf8').trim();
const login = await context.request.post(`${WEB}/api/v1/auth/login`, { data: { email: data.user.email, password } });
if (!login.ok()) throw new Error(`login as ${data.user.email}: ${login.status()}`);
log(`logged in as ${data.user.email} through the API`);
const api = async (method, path, body) => {
      const res = await context.request.fetch(`${WEB}${path}`, { method, data: body });
      if (!res.ok()) throw new Error(`${method} ${path}: ${res.status()} ${await res.text()}`);
      return res.status() === 200 ? res.json().catch(() => null) : null;
};

// ── Antes de cada captura ────────────────────────────────────────────────────────────────────────────────────────────
/** As fontes carregadas, o vídeo do cabeçalho parado no primeiro quadro e a página no topo. */
async function ready(page) {
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(async () => {
            for (const video of document.querySelectorAll('video')) {
                  video.pause();
                  if (video.readyState < 2) await new Promise((done) => video.addEventListener('loadeddata', done, { once: true }));
                  video.pause();
                  video.currentTime = 0;
                  if (video.seeking) await new Promise((done) => video.addEventListener('seeked', done, { once: true }));
            }
            window.scrollTo(0, 0);
      });
      // as transições de CSS terminadas (a tela da sala abre com uma de 500 ms no fundo); as animações sem fim, como o
      // pulso do «Ao Vivo», seguem como estão. Elas andam no tempo real, não no relógio da demo.
      const finished = page.evaluate(() => Promise.all(document.getAnimations()
            .filter((a) => a.effect?.getComputedTiming().endTime !== Infinity)
            .map((a) => a.finished.catch(() => null))));
      await Promise.race([finished, new Promise((done) => setTimeout(done, 5000))]);
}

/** A guarda: para a rodada se a tela mostrar o que o vídeo não pode mostrar. */
async function guard(page, name) {
      const seen = await page.evaluate(() => {
            const visible = (el) => {
                  const r = el.getBoundingClientRect();
                  const s = getComputedStyle(el);
                  return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && Number(s.opacity) > 0;
            };
            const texts = [document.body.innerText];
            for (const el of document.querySelectorAll('input, textarea, select')) {
                  if (el.tagName === 'SELECT') texts.push([...el.options].map((o) => o.text).join('\n'));
                  else texts.push(el.value);
                  // o placeholder só aparece na tela num campo visível e vazio
                  if (el.tagName !== 'SELECT' && visible(el) && !el.value && el.placeholder) texts.push(el.placeholder);
            }
            // os campos de dados (nomes, títulos); a busca do painel fica vazia de propósito
            const empty = [...document.querySelectorAll('input[type=text], textarea')]
                  .filter((el) => visible(el) && !el.value && !/^Buscar/.test(el.placeholder)).map((el) => el.placeholder || el.name || 'input');
            const logo = [...document.images].some((img) => /logo\.png/i.test(img.currentSrc || img.src) && visible(img));
            const icons = [...document.querySelectorAll('.material-symbols-outlined')].filter(visible);
            const words = icons.filter((el) => el.getBoundingClientRect().width > 1.6 * parseFloat(getComputedStyle(el).fontSize)).map((el) => el.textContent.trim());
            return { text: texts.join('\n'), empty, logo, words, iconFont: document.fonts.check('24px "Material Symbols Outlined"') };
      });
      const term = findTerm(seen.text);
      if (term) throw new Error(`${name}: the screen shows "${term}": stop`);
      if (seen.logo) throw new Error(`${name}: logo.png is on screen: stop`);
      if (!seen.iconFont || seen.words.length) throw new Error(`${name}: icons show as words (${seen.words.join(', ') || 'icon font not loaded'}): stop`);
      if (seen.empty.length) throw new Error(`${name}: empty fields on screen (${seen.empty.join(', ')}): stop`);
      const strangers = [...seen.text.matchAll(/\b(\p{Lu}\p{Ll}+) (Exemplo|Demo|Fictício|Fictícia)\b/gu)].map((m) => m[0]).filter((who) => !people.has(who));
      if (strangers.length) throw new Error(`${name}: unexpected people on screen: ${[...new Set(strangers)].join(', ')}`);
}

/** A caixa, em px CSS da página (rolada no topo), de um seletor ou de um elemento achado por função. */
async function box(page, find, arg) {
      return page.evaluate(([source, arg]) => {
            // eslint-disable-next-line no-new-func
            const el = new Function('arg', `return (${source})(arg)`)(arg);
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { x: Math.round(r.left + scrollX), y: Math.round(r.top + scrollY), width: Math.round(r.width), height: Math.round(r.height) };
      }, [find.toString(), arg]);
}
/** O primeiro ancestral do elemento folha com o texto dado cuja classe tem `cls`. */
const near = (page, text, cls) => box(page, ({ text, cls }) => {
      const leaf = [...document.querySelectorAll('body *')].find((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim() === text));
      let el = leaf;
      while (el && !(el.classList && cls.split(' ').every((c) => el.classList.contains(c)))) el = el.parentElement;
      return el;
}, { text, cls });

/** As linhas de texto à vista, em px CSS da página rolada no topo: o texto de cada nó (cortado pelos `overflow` em
 *  volta), o valor dos campos (largura medida na fonte deles) e os ícones à parte, que contam como forma. O vídeo
 *  confere com elas que nenhuma vista corta um texto nas bordas. */
async function textLines(page) {
      return page.evaluate(() => {
            const round = (n) => Math.round(n * 10) / 10;
            const hidden = (el) => {
                  for (let a = el; a; a = a.parentElement) {
                        const s = getComputedStyle(a);
                        if (s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) === 0) return true;
                  }
                  return false;
            };
            const clipOf = (el) => {
                  const clip = { left: -Infinity, top: -Infinity, right: Infinity, bottom: Infinity };
                  for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
                        const s = getComputedStyle(a);
                        if (s.overflowX === 'visible' && s.overflowY === 'visible') continue;
                        const r = a.getBoundingClientRect();
                        clip.left = Math.max(clip.left, r.left); clip.top = Math.max(clip.top, r.top);
                        clip.right = Math.min(clip.right, r.right); clip.bottom = Math.min(clip.bottom, r.bottom);
                  }
                  return clip;
            };
            const lines = [];
            const push = (el, r, text, kind) => {
                  const clip = clipOf(el);
                  const left = Math.max(r.left, clip.left), top = Math.max(r.top, clip.top);
                  const right = Math.min(r.right, clip.right), bottom = Math.min(r.bottom, clip.bottom);
                  if (right - left < 1 || bottom - top < 1) return;
                  lines.push({ text: text.slice(0, 32), kind, px: parseFloat(getComputedStyle(el).fontSize),
                        x: round(left + scrollX), y: round(top + scrollY), width: round(right - left), height: round(bottom - top) });
            };
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            for (let node = walker.nextNode(); node; node = walker.nextNode()) {
                  const text = node.textContent.trim();
                  const el = node.parentElement;
                  if (!text || !el || el.closest('select, option, script, style') || hidden(el)) continue;
                  const range = document.createRange();
                  range.selectNodeContents(node);
                  for (const r of range.getClientRects()) push(el, r, text, el.closest('.material-symbols-outlined') ? 'icon' : 'text');
            }
            const canvas = document.createElement('canvas').getContext('2d');
            for (const el of document.querySelectorAll('input, select, textarea')) {
                  if (hidden(el)) continue;
                  const text = el.tagName === 'SELECT' ? el.options[el.selectedIndex]?.text ?? '' : el.value || el.placeholder || '';
                  if (!text.trim()) continue;
                  const s = getComputedStyle(el);
                  const r = el.getBoundingClientRect();
                  const inLeft = r.left + parseFloat(s.borderLeftWidth) + parseFloat(s.paddingLeft);
                  const inRight = r.right - parseFloat(s.borderRightWidth) - parseFloat(s.paddingRight);
                  canvas.font = s.font;
                  const width = Math.min(canvas.measureText(text).width, inRight - inLeft);
                  const x = s.textAlign === 'center' ? (inLeft + inRight - width) / 2 : s.textAlign === 'right' || s.textAlign === 'end' ? inRight - width : inLeft;
                  const size = parseFloat(s.fontSize) * 1.2;
                  push(el, DOMRect.fromRect({ x, y: r.top + (r.height - size) / 2, width, height: size }), text, 'field');
            }
            return lines;
      });
}
const textFile = new URL('text.json', OUT);
const texts = {};

/** Confere a tela, grava a captura e as caixas. `fullPage` para as telas que passam da janela. */
async function shot(page, file, boxes, { fullPage = false } = {}) {
      await ready(page);
      await guard(page, file);
      const measured = await boxes(page);
      for (const [key, value] of Object.entries(measured)) if (!value) throw new Error(`${file}: no ${key} box on screen`);
      await page.screenshot({ path: new URL(`${file}.png`, OUT).pathname, fullPage });
      const entry = { ...measured };
      if (fullPage) entry.page = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight }));
      manifest.shots[file] = entry;
      writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n');
      texts[file] = await textLines(page);
      writeFileSync(textFile, JSON.stringify(texts) + '\n');
      log(`${file}.png  guard ok  ${JSON.stringify(entry)}`);
}

// ── A reunião desta semana ───────────────────────────────────────────────────────────────────────────────────────────
const page = watch(await context.newPage());
await page.goto(`${WEB}/#/`);
await page.getByText('REUNIÃO DESTA SEMANA').waitFor();
await page.getByText('Outras Semanas').waitFor();
await settleClock(); // o rolar até a semana atual (setTimeout de 300 ms)
const hero = await page.getByText('REUNIÃO DESTA SEMANA').locator('xpath=..').innerText();
if (!hero.includes(week.week) || !hero.includes(data.themes['Setembro - Outubro 2026']['Semana 07'])) throw new Error(`dashboard: the card of this week is not ${week.week}`);
await shot(page, 'dashboard', async (p) => ({
      card: await box(p, () => {
            const badge = [...document.querySelectorAll('div')].find((el) => el.textContent.trim().endsWith('REUNIÃO DESTA SEMANA') && el.children.length <= 1);
            const card = badge.parentElement;
            const a = card.getBoundingClientRect(), b = badge.getBoundingClientRect();
            return { getBoundingClientRect: () => DOMRect.fromRect({ x: a.left, y: b.top, width: a.width, height: a.bottom - b.top }) };
      }),
      title: await near(p, 'Painel de Reuniões', 'mb-8'),
      buttons: await box(p, () => document.querySelector('header button[title="Estatísticas"]').parentElement),
      list: await box(p, () => {
            const heading = [...document.querySelectorAll('h3')].find((el) => el.textContent.trim() === 'Outras Semanas');
            const items = [...heading.parentElement.children].slice([...heading.parentElement.children].indexOf(heading));
            const top = items[0].getBoundingClientRect().top, bottom = items[items.length - 1].getBoundingClientRect().bottom;
            const r = heading.parentElement.getBoundingClientRect();
            return { getBoundingClientRect: () => DOMRect.fromRect({ x: r.left, y: top, width: r.width, height: bottom - top }) };
      }),
}), { fullPage: true });

// A preparação: as partes neutras no localStorage antes de abrir o /setup (sem elas, a tela usa o programa oficial).
const setupItems = parts.map((part, k) => ({
      id: `mm-${k + 1}`, title: part.title, estimatedMinutes: part.minutes, section: part.section,
      allowsComments: false, requiresPostComment: false, skipTiming: false, assignedNames: part.name,
}));
await page.evaluate(({ items, president }) => {
      localStorage.setItem('setup_items', JSON.stringify(items));
      localStorage.setItem('setup_selected_week', '2026-10-19');
      localStorage.setItem('setup_president_name', president);
}, { items: setupItems, president: week.president });
await page.getByRole('button', { name: /INICIAR/ }).click();
await page.getByText('Preparar Reunião').waitFor();
const meetingId = await page.evaluate(() => localStorage.getItem('active_meeting_id'));
if (!meetingId) throw new Error('setup: no active meeting after INICIAR');
log(`meeting ${meetingId} created from the dashboard`);
await clockTo(AT.setup);
await page.locator('header span.rounded-full', { hasText: 'ESTA SEMANA' }).waitFor();
await shot(page, 'setup', async (p) => ({
      header: await box(p, () => document.querySelector('header select').parentElement.parentElement),
      title: await near(p, 'Preparar Reunião', 'mb-8'),
      president: await box(p, () => document.querySelector('input[placeholder^="Nome do Presidente"]').closest('.mb-8')),
      abertura: await near(p, 'Abertura', 'rounded-xl'),
      encerramento: await near(p, 'Encerramento', 'rounded-xl'),
}), { fullPage: true });

// O início: a agenda é gravada às 19:30 e o cronômetro começa.
await clockTo(START);
await page.getByRole('button', { name: /Iniciar Reunião/ }).click();
await page.getByText('Reunião ao Vivo').waitFor();
await api('PUT', `/api/v1/meetings/${meetingId}`, { started_at: START.toISOString() });
log(`started_at aligned to ${clockText(START)}`);
await page.reload();
await page.getByText('Partes da reunião').waitFor();
const startButton = page.getByRole('button', { name: /^play_arrow\s*Iniciar$/ });
const pauseButton = page.getByRole('button', { name: /^pause\s*Pausar$/ });
await startButton.click();
await pauseButton.and(page.locator(':enabled')).waitFor();

const liveBoxes = async (p) => ({
      timer: await box(p, () => {
            const label = [...document.querySelectorAll('p')].find((el) => el.textContent.trim() === 'Minutos');
            return label.parentElement.parentElement;
      }),
      title: await box(p, () => document.querySelector('main h1').parentElement),
      list: await box(p, () => document.querySelector('aside')),
      progress: await near(p, 'Progresso', 'p-4'),
});
const timerText = (p) => p.evaluate(() => [...document.querySelectorAll('p.font-mono')].map((el) => el.textContent.trim()).join(':'));
const activeTitle = (p) => p.evaluate(() => document.querySelector('main h1').textContent.trim());
async function liveShot(file, k) {
      await clockTo(AT[file]);
      const expected = new Date((AT[file] - partStart[k])).toISOString().slice(14, 19);
      await page.waitForFunction((t) => [...document.querySelectorAll('p.font-mono')].map((el) => el.textContent.trim()).join(':') === t, expected);
      if ((await activeTitle(page)) !== parts[k].title) throw new Error(`${file}: the active part is not ${parts[k].title}`);
      await shot(page, file, liveBoxes);
      log(`${file}: ${parts[k].title}, chrono ${await timerText(page)}`);
}
/** Passa da parte k para a seguinte, no fim exato do tempo real dela. */
let current = 0;
async function nextPart() {
      await clockTo(partStart[current + 1]);
      const expected = new Date(parts[current].actual * 1000).toISOString().slice(14, 19);
      await page.waitForFunction((t) => [...document.querySelectorAll('p.font-mono')].map((el) => el.textContent.trim()).join(':') === t, expected);
      await page.getByRole('button', { name: /Próximo/ }).click();
      current += 1;
      await page.waitForFunction((title) => document.querySelector('main h1')?.textContent.trim() === title, parts[current].title);
      log(`${parts[current - 1].title} done in ${expected}; now ${parts[current].title}`);
}

await liveShot('live-0', 0);
await nextPart();
await nextPart();
await liveShot('live-1', 2);
// A fileira de botões do /live fica apertada a 1440 px: a mesma tela a 390 x 844, só para comparar (fora do vídeo).
await page.setViewportSize({ width: 390, height: 844 });
await ready(page);
await guard(page, 'live-1-390');
mkdirSync(join(DEMO_DIR, 'compare'), { recursive: true });
await page.screenshot({ path: join(DEMO_DIR, 'compare', 'live-1-390.png'), fullPage: true });
log('live-1-390.png  guard ok  (the same screen at 390 x 844, to compare; not in the video)');
await page.setViewportSize(VIEWPORT);
await nextPart();
await liveShot('live-2', 3);
await nextPart();

/** A tela da sala, numa segunda aba: o /live pausa no tempo da cena (a pausa grava o actual_seconds) e continua. */
async function displayShot(file) {
      await clockTo(AT[file]);
      await page.waitForFunction((t) => [...document.querySelectorAll('p.font-mono')].map((el) => el.textContent.trim()).join(':') === t,
            new Date((AT[file] - partStart[current])).toISOString().slice(14, 19));
      await pauseButton.click();
      await startButton.and(page.locator(':enabled')).waitFor();
      const display = watch(await context.newPage());
      await display.goto(`${WEB}/#/display`);
      await display.getByText(/Tempo previsto/).waitFor();
      const boxes = async (p) => ({
            timer: await box(p, () => document.querySelector('.font-mono')),
            title: await box(p, () => document.querySelector('h1')),
            section: await box(p, () => document.querySelector('.top-8.left-8')),
            planned: await box(p, () => [...document.querySelectorAll('span')].find((el) => el.textContent.startsWith('Tempo previsto')).parentElement),
      });
      await shot(display, file, boxes);
      // a tela fica parada? uma segunda captura 1,5 s depois (tempo real, relógio parado) tem de ser igual
      mkdirSync(join(DEMO_DIR, 'still'), { recursive: true });
      const a = await display.screenshot({ path: join(DEMO_DIR, 'still', `${file}-a.png`) });
      await display.waitForTimeout(1500);
      const b = await display.screenshot({ path: join(DEMO_DIR, 'still', `${file}-b.png`) });
      log(`${file}: «${await display.locator('.font-mono').innerText()}», ${a.equals(b) ? 'the display stayed still for 1.5 s' : 'THE DISPLAY CHANGED within 1.5 s'}`);
      await display.close();
      await startButton.click();
      await pauseButton.and(page.locator(':enabled')).waitFor();
}
await displayShot('display-0');
await displayShot('display-1');
await nextPart();

// A contagem dos presentes, numa terceira aba: antes (o Zoom aberto, tudo em 0) e depois de salvar.
const counter = watch(await context.newPage());
await clockTo(AT['attendance-0']);
await counter.goto(`${WEB}/#/attendance`);
await counter.getByText('Toque para +1').waitFor();
await counter.getByRole('button', { name: /Adicionar Zoom/ }).click();
const attendanceBoxes = (saved) => async (p) => ({
      card: await box(p, () => [...document.querySelectorAll('p')].find((el) => el.textContent.includes('Presencial')).parentElement),
      zoom: await box(p, () => document.querySelector('input[type=number]').closest('.border-purple-500')),
      total: await near(p, 'Total', 'rounded-2xl'),
      date: await box(p, () => document.querySelector('main > div')),
      ...(saved ? { saved: await box(p, () => document.querySelector('aside')) } : {}),
});
await shot(counter, 'attendance-0', attendanceBoxes(false));
const card = counter.getByText('Toque para +1').locator('xpath=..');
for (let i = 0; i < week.attendance.presencial; i++) await card.click();
await counter.locator('input[type=number]').fill(String(week.attendance.zoom));
await clockTo(AT['attendance-1']);
await counter.getByRole('button', { name: /Salvar/ }).click();
await counter.locator('aside').getByText(String(week.attendance.presencial + week.attendance.zoom), { exact: true }).waitFor();
sql(`UPDATE attendance SET created_at = ${lit(AT['attendance-1'].toISOString())}::timestamptz WHERE meeting_id = ${lit(meetingId)};`);
log(`attendance created_at aligned to ${clockText(AT['attendance-1'])}`);
await counter.reload();
await counter.getByText('Última contagem').waitFor();
await shot(counter, 'attendance-1', attendanceBoxes(true));
// A 900 px de altura, o conteúdo centrado passa da janela: a data some no alto. A mesma tela a 390 x 844, para comparar.
await counter.setViewportSize({ width: 390, height: 844 });
await ready(counter);
await guard(counter, 'attendance-1-390');
await counter.screenshot({ path: join(DEMO_DIR, 'compare', 'attendance-1-390.png'), fullPage: true });
log('attendance-1-390.png  guard ok  (the same screen at 390 x 844, to compare; not in the video)');
await counter.close();

// O fim da reunião.
await nextPart();
await nextPart();
await clockTo(END);
await page.waitForFunction((t) => [...document.querySelectorAll('p.font-mono')].map((el) => el.textContent.trim()).join(':') === t,
      new Date(parts[current].actual * 1000).toISOString().slice(14, 19));
await page.getByRole('button', { name: /FINALIZAR/ }).click();
await page.getByText('Relatório da Reunião').waitFor();
log(`meeting finished at ${clockText(END)}`);

// ── O relatório, o histórico, as estatísticas e as configurações ────────────────────────────────────────────────────
await clockTo(AT.report);
await page.reload();
await page.getByText('Partes da Reunião').waitFor();
await shot(page, 'report', async (p) => ({
      heading: await box(p, () => document.querySelector('h1').closest('.rounded-xl')),
      cards: await box(p, () => document.querySelector('.grid')),
      abertura: await near(p, 'Abertura', 'rounded-xl'),
      encerramento: await near(p, 'Encerramento', 'rounded-xl'),
}), { fullPage: true });

await clockTo(AT.history);
await page.goto(`${WEB}/#/history`);
await page.getByText('Selecione uma reunião para ver os detalhes').waitFor();
const rows = page.locator('button', { hasText: /\d\d\/\d\d\/\d{4}/ });
if ((await rows.count()) !== data.history.length + 1) throw new Error(`history: ${await rows.count()} meetings listed`);
await rows.first().click();
await page.getByText('Duração', { exact: true }).waitFor();
await shot(page, 'history', async (p) => ({
      list: await box(p, () => document.querySelector('.divide-y').parentElement),
      detail: await box(p, () => document.querySelector('.lg\\:w-2\\/3')),
      first: await box(p, () => document.querySelector('.divide-y > button')),
      header: await box(p, () => document.querySelector('.lg\\:w-2\\/3 .shadow-sm')),
}));

await clockTo(AT.stats);
await page.goto(`${WEB}/#/stats`);
await page.getByText('Tendência de Assistência').waitFor();
await page.locator('.recharts-bar-rectangle').first().waitFor({ state: 'attached' });
await settleClock(3000); // as animações dos gráficos andam no relógio da demo
await page.locator('.recharts-bar-rectangle path').first().waitFor();
await shot(page, 'stats', async (p) => ({
      attendance: await near(p, 'Tendência de Assistência', 'rounded-xl'),
      duration: await near(p, 'Duração da Reunião (Minutos)', 'rounded-xl'),
}), { fullPage: true });

await clockTo(AT.settings);
await page.goto(`${WEB}/#/settings`);
await page.getByText('Relatório Mensal').waitFor();
await page.locator('select option', { hasText: /\d{4}/ }).first().waitFor({ state: 'attached' });
await shot(page, 'settings', async (p) => ({
      backup: await near(p, 'Backup Completo (Excel)', 'rounded-xl'),
      monthly: await near(p, 'Relatório Mensal', 'rounded-xl'),
}), { fullPage: true });

await browser.close();
log(`requests: ${Object.entries(hosts).map(([host, n]) => `${host} ${n}`).join(', ')}; blocked ${blocked.length}`);
if (problems.length) throw new Error(`the pages reported problems:\n${problems.join('\n')}`);
log(`captures written to ${OUT.pathname}`);
