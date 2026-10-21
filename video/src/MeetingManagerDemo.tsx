import {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, Easing, Img, cancelRender, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import displaySemibold from '@fontsource/funnel-display/files/funnel-display-latin-600-normal.woff2';

// O MeetingManager em uso, para o cartão do projeto em sammagbo.com: 1600 x 1000, 30 fps, sem som, em loop (o último
// quadro é o primeiro). Uma reunião semanal de equipe fictícia e neutra, de terça 20/10/2026: o painel, a preparação,
// o cronômetro, a tela da sala, a contagem dos presentes, o relatório, o histórico, as estatísticas e as exportações.
// Só as 13 capturas reais de video/capture/capture.mjs, em public/mm/ (fora do git: rodar a captura antes de
// renderizar). O motor é o do vídeo do MAGBO (PortfolioDay.tsx, de4ea18): a faixa da legenda e do chip, a câmera e
// as regras de legibilidade.
//
// A regra é a legibilidade no site, onde o vídeo aparece a 45 % do tamanho. Em cada vista de leitura, o texto de que
// a legenda fala sai com 30 px ou mais no quadro (corpo na tela x zoom), os rótulos que o explicam com 24 px ou mais,
// e a vista fica parada 2,5 s ou mais, no máximo com um pan de 60 px CSS por segundo. As bordas ficam limpas (a regra
// do Lote 33): nenhum texto cortado pelo alto ou pela faixa, nem a menos de 8 px deles, e nenhuma palavra cortada
// nas laterais; as formas podem ser cortadas. dayPlan() confere tudo isso vista a vista, com as linhas de texto que a
// captura mediu (text.json), e para o render se alguma vista sair da regra.

const FPS = 30;
const BLACK = '#000000';
const WHITE = '#F2F0EB';
const RED = '#FF3D2E'; // só para o ponto do tempo estourado, o mesmo das recusas do MAGBO
const LINE = '#34322F'; // o contorno do chip da hora, o mesmo dos chips do site

// A tela do app ocupa a largura inteira do quadro: cada pixel de largura é zoom no texto. As vistas têm as proporções
// das capturas (16:10), e a faixa da legenda esconde o pé delas.
const SCREEN = {width: 1600, height: 1000};
const RATIO = SCREEN.height / SCREEN.width;

// A faixa de baixo (BAND) é da legenda, à esquerda, e do chip da hora, à direita: a tela do app termina acima dela, e
// nada do app passa por trás das letras. O que se lê fica a 10 px ou mais das bordas da tela (EDGE): acima de
// READ_HEIGHT, a 10 px da faixa. Nenhum texto da tela fica a menos de GAP px do alto ou da faixa.
const BAND = 140;
const CAPTION = {size: 58, left: 56, dot: 20, gap: 18};
const CHIP = {size: 42, padY: 12, padX: 26, border: 3, right: 56};
const EDGE = 10;
const GAP = 8;
const READ_HEIGHT = SCREEN.height - BAND - EDGE;

// As regras do lote, conferidas por dayPlan().
const RULES = {mainPx: 30, labelPx: 24, minRead: 2.5 * FPS, maxPan: 60, enter: [15, 24], chars: 42, seconds: [40, 60]};
const SWAP = 15; // a troca de uma captura por outra no mesmo enquadramento

// A guarda das legendas: os termos de video/capture/terms.mjs e os do francês. Sem acentos nem maiúsculas; `jw` e
// `deus` só como palavra inteira.
const TERMS = [
  'jeová', 'bíblia', 'bíblico', 'cântico', 'oração', 'congregação', 'tesouros', 'ministério', 'vida cristã', 'discurso',
  'irmão', 'irmã', 'jw', 'joias', 'humaitá', 'abrasa', 'meio de semana', 'conselho', 'necessidades locais', 'discípulo',
  'assembleia', 'espiritual', 'armagedom', 'deus', 'profeta', 'isaías', 'jeremias', 'lamentações', 'ezequiel',
  'assemblée', 'congrégation', 'culte', 'frère', 'sœur', 'prière', 'cantique', 'réunion de semaine',
];
const plain = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').replace(/œ/g, 'oe').toLowerCase();
const forbidden = (text: string) =>
  TERMS.find((term) =>
    term === 'jw' || term === 'deus'
      ? new RegExp(`(^|[^\\p{L}\\p{N}])${term}([^\\p{L}\\p{N}]|$)`, 'u').test(plain(text))
      : plain(text).includes(plain(term)),
  );

type Box = {x: number; y: number; width: number; height: number};
type Size = {width: number; height: number};
type Manifest = {viewport: Size; shots: Record<string, Record<string, Partial<Box> | null>>};
/** Uma linha de texto à vista numa captura, medida por capture.mjs; os ícones contam como forma. */
type Line = Box & {text: string; kind: 'text' | 'field' | 'icon'; px: number};
type Texts = Record<string, Line[]>;
// Um enquadramento da captura, em pixels CSS dela: o centro e a largura (a altura segue a proporção do quadro).
type View = {cx: number; cy: number; w: number};
type Boxes = (shot: string, name: string) => Box;

/** Uma vista de leitura: o enquadramento, o que se lê nele e o corpo, na tela, desse texto. */
type Look = {
  view: View;
  to?: View; // o fim de um pan lento, na mesma largura
  read: Box; // o texto lido, que precisa caber acima da faixa da legenda
  readTo?: Box; // o texto lido no fim do pan
  px: number; // o corpo do texto de que a legenda fala
  labelPx?: number; // o corpo dos rótulos que o explicam
};

type Step = {
  shot: string;
  enter: number; // os quadros da transição que traz esta vista
  move?: boolean; // a câmera viaja da vista anterior, na mesma tela; sem isso, as duas telas se fundem
  hold: number; // os quadros em que a vista fica parada (ou num pan lento)
  chip: string;
  swap?: {shot: string; at: number}; // outra captura no mesmo enquadramento, a `at` quadros do início da vista
  look: (b: Boxes) => Look;
};
type Scene = {caption?: string; dot?: boolean; steps: Step[]};

const ease = Easing.bezier(0.65, 0, 0.35, 1);
const fade = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

const topOf = (view: View) => view.cy - (view.w * RATIO) / 2;
const zoomOf = (view: View) => SCREEN.width / view.w;

/**
 * A vista de largura `w` que põe `read` no meio: na horizontal (mais `dx`, ou com a borda esquerda em `left`) e na parte
 * do quadro acima da faixa, ou com o alto em `top`.
 */
const around = (read: Box, w: number, {dx = 0, left, top}: {dx?: number; left?: number; top?: number} = {}): View => {
  const visible = (READ_HEIGHT * w) / SCREEN.width;
  const y = top ?? read.y + read.height / 2 - visible / 2;
  return {cx: left === undefined ? read.x + read.width / 2 + dx : left + w / 2, cy: y + (w * RATIO) / 2, w};
};

const pan = (view: View, dx: number, dy = 0): View => ({...view, cx: view.cx + dx, cy: view.cy + dy});

// As vistas, a partir das caixas que capture.mjs mediu em cada captura. Os deslocamentos fixos vêm das linhas de texto
// de text.json, a partir dessas caixas; os vãos entre as linhas decidem onde ficam o alto do quadro e a faixa.

// O cartão «Reunião desta semana»: do selo ao tema e ao botão INICIAR. O alto do quadro fica abaixo da barra de
// busca, e a faixa no vão entre o primeiro cartão de «Outras Semanas» e o segundo.
const dashboard = (b: Boxes): Look => {
  const card = b('dashboard', 'card');
  const read = {x: card.x + 44, y: card.y + 13, width: 790, height: 178};
  return {view: around(read, 930, {left: card.x - 9, top: card.y - 23}), read, px: 18, labelPx: 14};
};

// A preparação: o presidente e o começo da seção Abertura; depois, num pan lento para baixo, as quatro primeiras partes,
// com os títulos e os nomes. Os minutos, na outra ponta da linha, ficam de fora: com eles, os títulos sairiam pequenos.
const setup = (b: Boxes): Look => {
  const president = b('setup', 'president');
  const abertura = b('setup', 'abertura');
  const view = around({x: president.x, y: president.y, width: 0, height: 0}, 680, {left: president.x - 8, top: president.y - 21});
  return {
    view,
    to: pan(view, 0, 182),
    read: {x: president.x, y: president.y + 1, width: 295, height: 320},
    readTo: {x: abertura.x + 67, y: abertura.y + 66, width: 228, height: 327},
    px: 14,
    labelPx: 12,
  };
};

// O cronômetro: o título da parte, o nome e os minutos e segundos. Os selos de cima e os botões de baixo ficam fora:
// a fileira de botões fica apertada a 1440 px (o «Anterior» passa da borda do botão).
const liveTimer = (shot: string) => (b: Boxes): Look => {
  const title = b(shot, 'title');
  const read = {x: title.x + 149, y: title.y + 50, width: 469, height: 381};
  return {view: around(read, 760, {top: title.y + 42}), read, px: 48, labelPx: 14};
};
// A lista das partes, com as concluídas e a do momento, encostada na borda direita da tela.
const liveList = (b: Boxes): Look => {
  const list = b('live-1', 'list');
  const read = {x: list.x + 25, y: list.y + 23, width: 423, height: 343};
  return {view: around(read, 680, {left: list.x + list.width - 680, top: list.y + 10}), read, px: 16, labelPx: 12};
};

// A tela da sala: o cronômetro e o tempo previsto, largos o bastante para o «+» do tempo estourado. A seção e o número,
// no alto, ficam de fora, e o título da parte fica inteiro sob a faixa: numa janela de 900 px, uma vista com o
// cronômetro e o título juntos passaria da captura.
const display = (shot: string) => (b: Boxes): Look => {
  const timer = b(shot, 'timer');
  const planned = b(shot, 'planned');
  const read = {x: timer.x, y: timer.y + 59, width: timer.width, height: planned.y + 38 - timer.y - 59};
  return {view: around(read, 1120, {top: timer.y - 36}), read, px: 320, labelPx: 30};
};

// A contagem: o cartão «Presencial» com o número e o «-1», antes (0) e depois (53); depois o Zoom e o total. A janela
// de 900 px não cabe o conteúdo centrado da tela: o alto do cartão sai cortado (forma) e a data some sob o cabeçalho.
const attendanceCard = (shot: string) => (b: Boxes): Look => {
  const card = b(shot, 'card');
  const read = {x: card.x + 22, y: card.y + 34, width: card.width - 44, height: 351};
  return {view: around(read, 700, {top: card.y + 18}), read, px: 18, labelPx: 16};
};
const attendanceZoom = (b: Boxes): Look => {
  const zoom = b('attendance-1', 'zoom');
  const read = {x: zoom.x + 84, y: zoom.y + 26, width: 108, height: 275};
  return {view: around(read, 640, {top: zoom.y - 11}), read, px: 48, labelPx: 12};
};

// O relatório: a tabela da seção Abertura, das partes e dos nomes ao previsto e ao real. O número da parte, à esquerda,
// e o status, à direita, ficam de fora; a faixa passa no vão entre a parte 4 e a 5.
const report = (b: Boxes): Look => {
  const abertura = b('report', 'abertura');
  const read = {x: abertura.x + 61, y: abertura.y + 14, width: 674, height: 363};
  return {view: around(read, 746, {left: abertura.x + 48, top: abertura.y - 8}), read, px: 14, labelPx: 12};
};

// O histórico: a lista das reuniões, num pan lento de uma reunião para baixo. O detalhe, à direita, não cabe no zoom.
const history = (b: Boxes): Look => {
  const list = b('history', 'list');
  const read = {x: list.x + 16, y: list.y + 17, width: 447, height: 268};
  const view = around(read, 520, {left: list.x, top: list.y + 11});
  return {view, to: pan(view, 0, 101), read, readTo: {...read, y: read.y + 101}, px: 14, labelPx: 12};
};

// As estatísticas: as barras da presença das sete últimas reuniões, a desta semana inteira, com as datas e a legenda;
// depois a linha da duração das seis últimas, até a borda do cartão. O eixo da duração fica de fora: ele mostra
// segundos sob o título «(Minutos)», um defeito do app.
const statsAttendance = (b: Boxes): Look => {
  const chart = b('stats', 'attendance');
  const read = {x: chart.x + 417, y: chart.y + 75, width: 624, height: 295};
  return {view: around(read, 740, {left: chart.x + 356, top: chart.y + 15}), read, px: 16, labelPx: 12};
};
const statsDuration = (b: Boxes): Look => {
  const chart = b('stats', 'duration');
  const read = {x: chart.x + 511, y: chart.y + 75, width: 568, height: 287};
  return {view: around(read, 640, {left: chart.x + chart.width - 640, top: chart.y + 23}), read, px: 12};
};

// As configurações: o backup em Excel e o relatório mensal em PDF, dos títulos à nota de baixo. A borda esquerda
// fica logo depois dos ícones dos dois cartões.
const settings = (b: Boxes): Look => {
  const backup = b('settings', 'backup');
  const read = {x: backup.x + 125, y: backup.y + 35, width: 685, height: 408};
  return {view: around(read, 780, {left: backup.x + 105, top: backup.y + 29}), read, px: 16, labelPx: 14};
};

// O roteiro. O chip é a hora do relógio da demo no log da captura (~/mm-captura.log); no histórico e nas estatísticas,
// o período das reuniões que elas mostram.
const SCENES: Scene[] = [
  {caption: 'Le tableau de bord de la semaine.', steps: [{shot: 'dashboard', enter: 0, hold: 96, chip: '19:24', look: dashboard}]},
  {caption: 'La réunion se prépare partie par partie.', steps: [{shot: 'setup', enter: 18, hold: 96, chip: '19:26', look: setup}]},
  {
    caption: 'En direct : chaque partie a son chrono.',
    steps: [
      {shot: 'live-0', enter: 18, hold: 78, chip: '19:30', look: liveTimer('live-0')},
      {shot: 'live-1', enter: 21, move: true, hold: 84, chip: '19:44', look: liveList},
      {shot: 'live-2', enter: 21, move: true, hold: 78, chip: '20:10', look: liveTimer('live-2')},
    ],
  },
  {caption: 'Dans la salle, le chrono en grand écran.', steps: [{shot: 'display-0', enter: 18, hold: 78, chip: '20:15', look: display('display-0')}]},
  {caption: 'Temps dépassé : le chrono passe au rouge.', dot: true, steps: [{shot: 'display-1', enter: 18, hold: 84, chip: '20:22', look: display('display-1')}]},
  {
    caption: 'Les présents, en salle et sur Zoom.',
    steps: [
      {shot: 'attendance-0', enter: 18, hold: 78, chip: '20:23', look: attendanceCard('attendance-0')},
      {shot: 'attendance-1', enter: 18, move: true, hold: 78, chip: '20:25', look: attendanceCard('attendance-1')},
      {shot: 'attendance-1', enter: 21, move: true, hold: 78, chip: '20:25', look: attendanceZoom},
    ],
  },
  {caption: 'Le rapport : temps prévu, temps réel.', steps: [{shot: 'report', enter: 18, hold: 84, chip: '20:33', look: report}]},
  {caption: 'Chaque réunion reste dans l’historique.', steps: [{shot: 'history', enter: 18, hold: 84, chip: 'Août – oct.', look: history}]},
  {
    caption: 'Présence et durée, réunion après réunion.',
    steps: [
      {shot: 'stats', enter: 18, hold: 84, chip: 'Août – oct.', look: statsAttendance},
      {shot: 'stats', enter: 21, move: true, hold: 84, chip: 'Août – oct.', look: statsDuration},
    ],
  },
  {caption: 'Tout s’exporte en Excel et en PDF.', steps: [{shot: 'settings', enter: 18, hold: 84, chip: '20:36', look: settings}]},
  // O fim do loop, sem legenda: a volta ao painel, no enquadramento e com o chip do primeiro quadro.
  {steps: [{shot: 'dashboard', enter: 18, hold: 48, chip: '19:24', look: dashboard}]},
];

type Timed = Step & {scene: number; start: number; hold0: number; end: number};

// A linha do tempo, em quadros: cada vista entra (transição de `enter` quadros) e fica `hold` quadros.
const TIMELINE: Timed[] = [];
SCENES.forEach((scene, index) =>
  scene.steps.forEach((step) => {
    const start = TIMELINE.length ? TIMELINE[TIMELINE.length - 1].end : 0;
    TIMELINE.push({...step, scene: index, start, hold0: start + step.enter, end: start + step.enter + step.hold});
  }),
);

export const MEETINGMANAGER_DEMO = {width: SCREEN.width, height: SCREEN.height, fps: FPS, durationInFrames: TIMELINE[TIMELINE.length - 1].end};

/** Uma linha do plano: a vista, o zoom e o corpo no quadro do texto lido. */
export type PlanRow = {
  step: number;
  scene: number;
  shot: string;
  from: number; // o primeiro quadro da transição que traz a vista
  still: number; // o primeiro quadro com a vista parada
  swap?: number; // o quadro em que começa a troca de captura
  to: number; // o último quadro da vista
  width: number;
  zoom: number;
  mainPx: number;
  labelPx?: number;
  chip: string;
  caption?: string;
};

/** A largura de um texto em Funnel Display 600, no corpo dado; no navegador, para conferir a faixa de baixo. */
type Measure = (text: string, size: number) => number;

/** Os textos da captura que a vista corta numa lateral, ou que ficam cortados ou a menos de GAP px do alto ou da faixa. */
const edgeProblems = (name: string, view: View, lines: Line[]): string[] => {
  const zoom = zoomOf(view);
  const left = view.cx - view.w / 2;
  const right = left + view.w;
  const top = topOf(view);
  const band = top + (SCREEN.height - BAND) / zoom;
  const m = GAP / zoom;
  const problems: string[] = [];
  for (const line of lines) {
    if (line.kind === 'icon') continue;
    const r = line.x + line.width;
    const bottom = line.y + line.height;
    if (r <= left || line.x >= right || bottom <= top || line.y >= band) continue; // fora do quadro ou sob a faixa
    if (line.x < left || r > right) problems.push(`${name}: «${line.text}» is cut at the side`);
    else if (line.y < top + m) problems.push(`${name}: «${line.text}» is cut by or too close to the top`);
    else if (bottom > band - m) problems.push(`${name}: «${line.text}» is cut by or too close to the band`);
  }
  return problems;
};

/**
 * As vistas de todas as cenas, a partir do manifest e das linhas de texto, conferidas contra as regras do lote. Para o
 * render (com a lista dos problemas) se uma vista não cumprir alguma.
 */
export const dayPlan = (manifest: Manifest, texts: Texts, measure?: Measure): {looks: Look[]; rows: PlanRow[]} => {
  const box: Boxes = (shot, name) => {
    const found = manifest.shots[shot]?.[name];
    if (name === 'page') return {x: 0, y: 0, ...sizeOf(manifest, shot)};
    if (!found || [found.x, found.y, found.width, found.height].some((n) => typeof n !== 'number')) {
      throw new Error(`manifest.json has no ${name} in ${shot}: run video/capture/capture.mjs again`);
    }
    return found as Box;
  };
  const looks = TIMELINE.map((step) => step.look(box));
  const problems: string[] = [];
  const seconds = MEETINGMANAGER_DEMO.durationInFrames / FPS;
  if (seconds < RULES.seconds[0] || seconds > RULES.seconds[1]) problems.push(`the video lasts ${seconds.toFixed(1)} s`);

  const rows = TIMELINE.map((step, k): PlanRow => {
    const look = looks[k];
    const name = `${k + 1} ${step.shot}`;
    const views = look.to ? [look.view, look.to] : [look.view];
    for (const view of views) {
      const left = view.cx - view.w / 2;
      const top = topOf(view);
      const bounds = {x: 0, y: 0, ...sizeOf(manifest, step.shot)};
      if (left < bounds.x - 0.5 || top < bounds.y - 0.5 || left + view.w > bounds.x + bounds.width + 0.5 || top + view.w * RATIO > bounds.y + bounds.height + 0.5) {
        problems.push(`${name}: the view leaves the capture`);
      }
      // as bordas limpas, nas capturas que a vista mostra parada
      for (const shot of step.swap ? [step.shot, step.swap.shot] : [step.shot]) {
        if (!texts[shot]) problems.push(`${name}: text.json has no lines for ${shot}: run video/capture/capture.mjs again`);
        else problems.push(...edgeProblems(name, view, texts[shot]));
      }
    }
    if (k > 0 && (step.enter < RULES.enter[0] || step.enter > RULES.enter[1])) problems.push(`${name}: a transition of ${step.enter} frames`);
    const scene = SCENES[step.scene];
    const zoom = zoomOf(look.view);
    if (scene.caption) {
      // uma vista de leitura
      if (scene.caption.length > RULES.chars) problems.push(`${name}: the caption has ${scene.caption.length} characters`);
      const term = forbidden(scene.caption) ?? forbidden(step.chip);
      if (term) problems.push(`${name}: the caption or the chip has «${term}»`);
      if (measure) {
        const caption = measure(scene.caption, CAPTION.size) + (scene.dot ? CAPTION.dot + CAPTION.gap : 0);
        const chip = measure(step.chip, CHIP.size) + 2 * (CHIP.padX + CHIP.border);
        if (CAPTION.left + caption + 48 + chip + CHIP.right > SCREEN.width) problems.push(`${name}: the caption runs into the chip`);
      }
      if (look.px * zoom < RULES.mainPx) problems.push(`${name}: the text is ${(look.px * zoom).toFixed(1)} px`);
      if (look.labelPx && look.labelPx * zoom < RULES.labelPx) problems.push(`${name}: the labels are ${(look.labelPx * zoom).toFixed(1)} px`);
      // o tempo de leitura conta do fim da troca de captura e, no primeiro quadro, da entrada da legenda
      const reading = step.hold - Math.max(step.swap ? step.swap.at + SWAP : 0, k === 0 ? 16 : 0);
      if (reading < RULES.minRead) problems.push(`${name}: the view is read for ${(reading / FPS).toFixed(2)} s`);
      if (look.to) {
        const speed = Math.hypot(look.to.cx - look.view.cx, look.to.cy - look.view.cy) / (step.hold / FPS);
        if (look.to.w !== look.view.w) problems.push(`${name}: the pan zooms`);
        if (speed > RULES.maxPan) problems.push(`${name}: the pan runs at ${speed.toFixed(0)} px/s`);
      }
      const pairs: [View, Box][] = look.to ? [[look.view, look.read], [look.to, look.readTo ?? look.read]] : [[look.view, look.read]];
      for (const [view, read] of pairs) {
        const left = view.cx - view.w / 2;
        const top = topOf(view);
        const m = EDGE / zoom;
        if (read.x < left + m || read.x + read.width > left + view.w - m || read.y < top + m || read.y + read.height > top + READ_HEIGHT / zoom) {
          problems.push(`${name}: the text read does not fit above the band`);
        }
      }
    }
    return {
      step: k + 1,
      scene: step.scene + 1,
      shot: step.swap ? `${step.shot} → ${step.swap.shot}` : step.shot,
      from: step.start,
      still: step.hold0,
      swap: step.swap ? step.hold0 + step.swap.at : undefined,
      to: step.end - 1,
      width: look.view.w,
      zoom,
      mainPx: look.px * zoom,
      labelPx: look.labelPx ? look.labelPx * zoom : undefined,
      chip: step.chip,
      caption: scene.caption,
    };
  });

  // O loop: o último quadro mostra a mesma captura, no mesmo enquadramento e com o mesmo chip do primeiro, sem legenda.
  const first = TIMELINE[0];
  const last = TIMELINE[TIMELINE.length - 1];
  const lastShot = last.swap?.shot ?? last.shot;
  const sameView = JSON.stringify(looks[0].view) === JSON.stringify(looks[looks.length - 1].view) && !looks[looks.length - 1].to;
  if (lastShot !== first.shot || !sameView || last.chip !== first.chip || SCENES[last.scene].caption || last.hold < (last.swap ? last.swap.at + SWAP + 1 : 1)) {
    problems.push('the last frame is not the first one');
  }
  if (problems.length) throw new Error(`MeetingManagerDemo breaks the rules: ${problems.join('; ')}`);
  return {looks, rows};
};

const sizeOf = (manifest: Manifest, shot: string): Size => {
  const page = manifest.shots[shot]?.page;
  return page && typeof page.width === 'number' && typeof page.height === 'number' ? {width: page.width, height: page.height} : manifest.viewport;
};

const useAssets = (): {manifest: Manifest; texts: Texts} | null => {
  const [handle] = useState(() => delayRender('meetingmanager captures and fonts'));
  const [assets, setAssets] = useState<{manifest: Manifest; texts: Texts} | null>(null);
  useEffect(() => {
    Promise.all([
      fetch(staticFile('mm/manifest.json')).then((res) => res.json() as Promise<Manifest>),
      fetch(staticFile('mm/text.json')).then((res) => res.json() as Promise<Texts>),
      new FontFace('Funnel Display', `url(${displaySemibold}) format('woff2')`, {weight: '600'}).load().then((face) => {
        document.fonts.add(face);
      }),
    ])
      .then(([manifest, texts]) => {
        setAssets({manifest, texts});
        continueRender(handle);
      })
      .catch((error) => cancelRender(error));
  }, [handle]);
  return assets;
};

/** A largura de um texto em Funnel Display 600, medida no canvas do navegador (sem o letter-spacing negativo: folga). */
const measureText: Measure = (text, size) => {
  const context = document.createElement('canvas').getContext('2d');
  if (!context) return 0;
  context.font = `600 ${size}px "Funnel Display"`;
  return context.measureText(text).width;
};

/** O enquadramento entre duas vistas: centro em linha reta, zoom em escala logarítmica. */
const mix = (a: View, b: View, t: number): View => ({
  cx: a.cx + (b.cx - a.cx) * t,
  cy: a.cy + (b.cy - a.cy) * t,
  w: Math.exp(Math.log(a.w) + (Math.log(b.w) - Math.log(a.w)) * t),
});

type Layer = {shot: string; view: View; opacity: number};

const Screen: React.FC<Layer & {size: Size}> = ({shot, view, opacity, size}) => {
  const scale = SCREEN.width / view.w;
  const left = view.cx - view.w / 2;
  const top = topOf(view);
  return (
    <AbsoluteFill style={{opacity}}>
      <Img
        src={staticFile(`mm/${shot}.png`)}
        style={{position: 'absolute', left: -left * scale, top: -top * scale, width: size.width * scale, height: size.height * scale}}
      />
    </AbsoluteFill>
  );
};

const lettering = (size: number): React.CSSProperties => ({
  position: 'absolute',
  color: WHITE,
  fontFamily: 'Funnel Display',
  fontWeight: 600,
  fontSize: size,
  lineHeight: 1.1,
  whiteSpace: 'nowrap',
});

// A legenda, na faixa, à esquerda e no meio da altura dela: o texto direto no preto, sem pílula. No tempo estourado, o
// ponto vermelho vem antes do texto.
const Caption: React.FC<{text: string; opacity: number; dot?: boolean}> = ({text, opacity, dot}) => (
  <div
    style={{
      ...lettering(CAPTION.size),
      left: CAPTION.left,
      top: SCREEN.height - BAND,
      height: BAND,
      display: 'flex',
      alignItems: 'center',
      gap: CAPTION.gap,
      letterSpacing: '-0.01em',
      opacity,
      transform: `translateY(${(1 - opacity) * 14}px)`,
    }}
  >
    {dot ? <span style={{width: CAPTION.dot, height: CAPTION.dot, borderRadius: '50%', background: RED, flex: 'none'}} /> : null}
    {text}
  </div>
);

// O chip da hora, na faixa, à direita e no meio da altura dela: só o contorno, como os chips do site.
const Chip: React.FC<{text: string; opacity: number}> = ({text, opacity}) => (
  <div
    style={{
      ...lettering(CHIP.size),
      right: CHIP.right,
      top: SCREEN.height - BAND / 2,
      transform: 'translateY(-50%)',
      boxSizing: 'border-box',
      padding: `${CHIP.padY}px ${CHIP.padX}px`,
      border: `${CHIP.border}px solid ${LINE}`,
      borderRadius: 999,
      fontVariantNumeric: 'tabular-nums',
      opacity,
    }}
  >
    {text}
  </div>
);

export const MeetingManagerDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const assets = useAssets();
  const plan = useMemo(() => (assets ? dayPlan(assets.manifest, assets.texts, measureText) : null), [assets]);
  if (!assets || !plan) return <AbsoluteFill style={{background: BLACK}} />;
  const {manifest} = assets;
  const {looks} = plan;

  const i = Math.max(0, TIMELINE.findIndex((step) => frame < step.end));
  const step = TIMELINE[i];

  // O enquadramento de uma vista enquanto ela está na tela: parado, ou num pan em velocidade constante.
  const camera = (k: number, f: number): View => {
    const look = looks[k];
    if (!look.to) return look.view;
    return mix(look.view, look.to, Math.min(Math.max((f - TIMELINE[k].hold0) / TIMELINE[k].hold, 0), 1));
  };
  // As capturas de uma vista: a dela e, durante e depois da troca, a seguinte por cima (a de baixo sai quando a de
  // cima fica opaca).
  const held = (k: number, f: number, view: View): Layer[] => {
    const s = TIMELINE[k];
    const base: Layer = {shot: s.shot, view, opacity: 1};
    if (!s.swap) return [base];
    const swapped = fade(f, s.hold0 + s.swap.at, s.hold0 + s.swap.at + SWAP);
    if (swapped >= 1) return [{...base, shot: s.swap.shot}];
    return swapped > 0 ? [base, {...base, shot: s.swap.shot, opacity: swapped}] : [base];
  };

  let layers: Layer[];
  let progress = 1; // o avanço da transição que trouxe a vista atual
  if (frame >= step.hold0 || i === 0) {
    layers = held(i, frame, camera(i, frame));
  } else {
    const prev = TIMELINE[i - 1];
    progress = ease((frame - step.start) / step.enter);
    const leaving = held(i - 1, prev.end - 1, camera(i - 1, prev.end - 1));
    const target = looks[i].view;
    if (step.move) {
      // a mesma tela: a câmera viaja, e a captura nova (a tela atualizada) aparece por cima
      const view = mix(camera(i - 1, prev.end - 1), target, progress);
      layers = [...leaving.map((layer) => ({...layer, view})), {shot: step.shot, view, opacity: progress}];
    } else {
      // outra tela: a nova se funde sobre a anterior, abrindo um pouco antes de parar
      layers = [...leaving, {shot: step.shot, view: {...target, w: target.w * (1 + 0.04 * (1 - progress))}, opacity: progress}];
    }
  }

  // A legenda e o chip: trocam no meio da transição de uma cena para outra; a primeira legenda entra depois do primeiro
  // quadro, para o loop não ter emenda.
  const scene = SCENES[step.scene];
  const prevStep = i > 0 && frame < step.hold0 ? TIMELINE[i - 1] : null;
  const prevScene = prevStep ? SCENES[prevStep.scene] : null;
  const out = 1 - interpolate(progress, [0, 0.4], [0, 1], {extrapolateRight: 'clamp'});
  const into = interpolate(progress, [0.5, 1], [0, 1], {extrapolateLeft: 'clamp'});
  const captions: {text: string; dot?: boolean; opacity: number}[] = [];
  if (prevScene && prevScene !== scene) {
    if (prevScene.caption) captions.push({text: prevScene.caption, dot: prevScene.dot, opacity: out});
    if (scene.caption) captions.push({text: scene.caption, dot: scene.dot, opacity: into});
  } else if (scene.caption) {
    captions.push({text: scene.caption, dot: scene.dot, opacity: i === 0 ? fade(frame, 4, 16) : 1});
  }
  const chips =
    prevStep && prevStep.chip !== step.chip
      ? [
          {text: prevStep.chip, opacity: out},
          {text: step.chip, opacity: into},
        ]
      : [{text: step.chip, opacity: 1}];

  return (
    <AbsoluteFill style={{background: BLACK}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: SCREEN.width, height: SCREEN.height - BAND, overflow: 'hidden'}}>
        {layers
          .filter((layer) => layer.opacity > 0)
          .map((layer, k) => (
            <Screen key={`${k}-${layer.shot}`} {...layer} size={sizeOf(manifest, layer.shot)} />
          ))}
      </div>
      {captions
        .filter((caption) => caption.opacity > 0)
        .map((caption) => (
          <Caption key={caption.text} {...caption} />
        ))}
      {chips
        .filter((chip) => chip.opacity > 0)
        .map((chip) => (
          <Chip key={chip.text} {...chip} />
        ))}
    </AbsoluteFill>
  );
};
