// Os termos que nenhuma tela, nenhum dado da demo e nenhuma legenda podem mostrar: o vídeo só tem telas neutras, de
// uma reunião de equipe genérica. A comparação ignora maiúsculas e acentos; `jw` e `deus` contam só como palavra
// inteira. As legendas em francês passam também pelos termos de FRENCH.
export const TERMS = [
      'jeová', 'bíblia', 'bíblico', 'cântico', 'oração', 'congregação', 'tesouros', 'ministério', 'vida cristã',
      'discurso', 'irmão', 'irmã', 'jw', 'joias', 'humaitá', 'abrasa', 'meio de semana', 'conselho',
      'necessidades locais', 'discípulo', 'assembleia', 'espiritual', 'armagedom', 'deus', 'profeta', 'isaías',
      'jeremias', 'lamentações', 'ezequiel',
];
export const FRENCH = ['assemblée', 'congrégation', 'culte', 'frère', 'sœur', 'prière', 'cantique', 'réunion de semaine'];
const WHOLE_WORD = new Set(['jw', 'deus']);

/** O texto sem acentos e em minúsculas (o «œ» vira «oe»). */
export const normalize = (text) =>
      String(text).normalize('NFD').replace(/\p{M}/gu, '').replace(/œ/g, 'oe').replace(/Œ/g, 'OE').toLowerCase();

/** O primeiro termo proibido que aparece no texto, ou null. */
export function findTerm(text, terms = TERMS) {
      const plain = normalize(text);
      for (const term of terms) {
            const t = normalize(term);
            const found = WHOLE_WORD.has(term)
                  ? new RegExp(`(^|[^\\p{L}\\p{N}])${t}([^\\p{L}\\p{N}]|$)`, 'u').test(plain)
                  : plain.includes(t);
            if (found) return term;
      }
      return null;
}
