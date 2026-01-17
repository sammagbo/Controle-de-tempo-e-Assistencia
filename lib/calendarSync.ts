/**
 * Serviço de Sincronização Automática do Calendário
 * Busca dados da Apostila da Reunião diretamente do jw.org (PT ou FR)
 * e importa para o banco de dados Supabase.
 */

import { supabase } from './supabaseClient';

// Configurações por idioma
interface LanguageConfig {
      baseUrl: string;
      monthSlugs: Record<string, string>;
      periodRegex: RegExp;
      weekLinkRegex: RegExp;
      monthsMap: Record<string, number>;
}

const CALENDAR_CONFIG: Record<string, LanguageConfig> = {
      pt: {
            baseUrl: 'https://www.jw.org/pt/biblioteca/jw-apostila-do-mes',
            monthSlugs: {
                  'janeiro-fevereiro': 'janeiro-fevereiro',
                  'março-abril': 'marco-abril',
                  'maio-junho': 'maio-junho',
                  'julho-agosto': 'julho-agosto',
                  'setembro-outubro': 'setembro-outubro',
                  'novembro-dezembro': 'novembro-dezembro'
            },
            periodRegex: /href="[^"]*\/jw-apostila-do-mes\/([a-z-]+-\d{4}-mwb)\/?"/gi,
            weekLinkRegex: /href="([^"]*Programa[^"]*)"[^>]*>[\s\S]*?(\d+(?:-\d+)?\s+de\s+\w+(?:\s*[–-]\s*\d+\s+de\s+\w+)?)/gi,
            monthsMap: {
                  'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3,
                  'maio': 4, 'junho': 5, 'julho': 6, 'agosto': 7,
                  'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
            }
      },
      fr: {
            // Note: The URL must be encoded (bibliothèque -> biblioth%C3%A8que)
            baseUrl: 'https://www.jw.org/fr/biblioth%C3%A8que/reunion-tj-cahier',
            monthSlugs: {
                  'janvier-fevrier': 'janvier-fevrier',
                  'mars-avril': 'mars-avril',
                  'mai-juin': 'mai-juin',
                  'juillet-aout': 'juillet-aout',
                  'septembre-octobre': 'septembre-octobre',
                  'novembre-decembre': 'novembre-decembre'
            },
            // Regex for French issues. Matches "mwb-month-month-year" anywhere in the href.
            // This handles relative links matching just "mwb-..." or absolute URLs.
            periodRegex: /href="([^"]*mwb-[a-z-]+-\d{4})\/?"/gi,

            // Regex for French week links:
            // Matches "Programme-pour-la-reunion..." (handling accents encoded or not)
            // Simplified to catch the generic pattern.
            weekLinkRegex: /href="([^"]*Programme-pour-la-r[^"]*)"[^>]*>[\s\S]*?(\d+(?:-\d+)?\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)(?:\s*[–-]\s*\d+\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre))?)/gi,

            monthsMap: {
                  'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3,
                  'mai': 4, 'juin': 5, 'juillet': 6, 'août': 7,
                  'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
            }
      }
};

interface WeekData {
      dateRange: string;
      theme: string;
      url: string;
}

/**
 * Busca os períodos disponíveis no jw.org
 */
async function fetchAvailablePeriods(lang: string = 'pt'): Promise<string[]> {
      const config = CALENDAR_CONFIG[lang] || CALENDAR_CONFIG.pt;
      try {
            // Use a cors-anywhere proxy if needed or rely on direct fetch if allowed. 
            // JW.org might block direct fetch from localhost.
            const response = await fetch(`${config.baseUrl}/`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const html = await response.text();

            // Extrair links de períodos
            const matches = [...html.matchAll(config.periodRegex)];
            // Extract the slug part: remove path prefixes if any
            const periods = [...new Set(matches.map(m => {
                  const fullMatch = m[1];
                  // Extract just the "mwb-..." part
                  const slugMatch = fullMatch.match(/(mwb-[a-z-]+-\d{4})/);
                  return slugMatch ? slugMatch[1] : fullMatch;
            }))];

            console.log(`[${lang}] Found periods:`, periods);

            return periods;
      } catch (error) {
            console.error(`Erro ao buscar períodos (${lang}):`, error);
            // Throw error to be caught by caller and shown in UI
            throw error;
      }
}

/**
 * Converte slug do período para nome amigável
 * Ex: "maio-junho-2026-mwb" -> "Maio - Junho 2026"
 * Ex: "mwb-janvier-fevrier-2026" -> "Janvier - Fevrier 2026"
 */
function slugToPeriodName(slug: string): string {
      // Remove known affixes
      const cleanSlug = slug.replace(/-mwb$/, '').replace(/^mwb-/, '');

      const parts = cleanSlug.split('-');
      const year = parts.pop();
      const months = parts.join('-')
            .split('-')
            .map(m => m.charAt(0).toUpperCase() + m.slice(1))
            .join(' - ');

      return `${months} ${year}`;
}

/**
 * Verifica quais períodos já existem no banco de dados
 */
async function getExistingPeriods(): Promise<string[]> {
      const { data, error } = await supabase
            .from('periods')
            .select('name');

      if (error) {
            console.error('Erro ao buscar períodos existentes:', error);
            return [];
      }

      return data?.map(p => p.name) || [];
}

/**
 * Calcula quantos meses à frente temos cadastrados
 */
function monthsAhead(periods: string[], lang: string = 'pt'): number {
      const config = CALENDAR_CONFIG[lang] || CALENDAR_CONFIG.pt;
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      let maxMonthsAhead = 0;

      for (const period of periods) {
            // Tenta extrair mês e ano. Ex: "Maio - Junho 2026"
            const match = period.match(/(\w+)(?:.*?)\s+(\d{4})/i);
            if (!match) continue;

            // match[1] é o nome do primeiro mês (ex: "Maio")
            const monthName = match[1].toLowerCase();
            // match[2] é o ano
            const year = parseInt(match[2]);

            // Precisamos encontrar o mês final para calcular "à frente"
            // Mas simplificando, pegamos o primeiro mês + 1 (já que são bimestrais)

            // Tentar mapear o nome do mês
            let endMonth = -1;

            // Verifica mapa exato
            if (config.monthsMap[monthName] !== undefined) {
                  endMonth = config.monthsMap[monthName] + 1; // Fim do bimestre
            } else {
                  // Fallback: tenta buscar parcial ou em outros idiomas se misturou
                  // Mas assumimos que o nome do período salvo no banco reflete o slug processado
                  continue;
            }

            if (endMonth !== -1) {
                  const monthsDiff = (year - currentYear) * 12 + (endMonth - currentMonth);
                  maxMonthsAhead = Math.max(maxMonthsAhead, monthsDiff);
            }
      }

      return maxMonthsAhead;
}

/**
 * Criar período no banco de dados
 */
async function createPeriod(name: string): Promise<string | null> {
      // Verificar se já existe
      const { data: existing } = await supabase
            .from('periods')
            .select('id')
            .eq('name', name)
            .single();

      if (existing) {
            return existing.id;
      }

      // Criar novo
      const { data, error } = await supabase
            .from('periods')
            .insert({ name })
            .select('id')
            .single();

      if (error) {
            console.error('Erro ao criar período:', error);
            return null;
      }

      return data?.id || null;
}

/**
 * Criar semanas para um período
 */
async function createWeeks(periodId: string, weeks: WeekData[]): Promise<void> {
      for (let i = 0; i < weeks.length; i++) {
            const week = weeks[i];

            // Verificar se a semana já existe
            const { data: existing } = await supabase
                  .from('weeks')
                  .select('id')
                  .eq('period_id', periodId)
                  .eq('date_range', week.dateRange)
                  .single();

            if (existing) continue;

            // Criar nova semana
            await supabase
                  .from('weeks')
                  .insert({
                        period_id: periodId,
                        label: `Semana ${i + 1}`,
                        date_range: week.dateRange,
                        theme: week.theme
                  });
      }
}

/**
 * Buscar semanas de um período no jw.org
 */
async function fetchWeeksFromJwOrg(periodSlug: string, lang: string = 'pt'): Promise<WeekData[]> {
      const config = CALENDAR_CONFIG[lang] || CALENDAR_CONFIG.pt;
      try {
            const url = `${config.baseUrl}/${periodSlug}/`;
            const response = await fetch(url);
            const html = await response.text();

            const weeks: WeekData[] = [];
            const matches = [...html.matchAll(config.weekLinkRegex)];

            for (const match of matches) {
                  const weekUrl = match[1];
                  const dateRange = match[2].replace(/–/g, '-').trim();

                  weeks.push({
                        dateRange,
                        theme: `Leitura da semana de ${dateRange}`, // Fallback generico
                        url: weekUrl
                  });
            }

            return weeks;
      } catch (error) {
            console.error('Erro ao buscar semanas:', error);
            return [];
      }
}

/**
 * Sincronizar calendário com jw.org
 */
export async function syncCalendarFromJwOrg(lang: string = 'pt'): Promise<{
      success: boolean;
      periodsCreated: number;
      weeksCreated: number;
      monthsAhead: number;
      message: string;
}> {
      try {
            // 1. Buscar períodos existentes no banco
            const existingPeriods = await getExistingPeriods();

            // 2. Buscar períodos disponíveis no jw.org
            const availableSlugs = await fetchAvailablePeriods(lang);

            let periodsCreated = 0;
            let weeksCreated = 0;

            // 3. Para cada período disponível, verificar se precisa importar
            for (const slug of availableSlugs) {
                  const periodName = slugToPeriodName(slug); // Ex: "Maio - Junho 2026"

                  if (!existingPeriods.includes(periodName)) {
                        // Criar período
                        const periodId = await createPeriod(periodName);

                        if (periodId) {
                              periodsCreated++;

                              // Buscar e criar semanas
                              const weeks = await fetchWeeksFromJwOrg(slug, lang);
                              await createWeeks(periodId, weeks);
                              weeksCreated += weeks.length;
                        }
                  }
            }

            // 4. Recalcular meses à frente
            const updatedPeriods = await getExistingPeriods();
            const ahead = monthsAhead(updatedPeriods, lang);

            return {
                  success: true,
                  periodsCreated,
                  weeksCreated,
                  monthsAhead: ahead,
                  message: periodsCreated > 0
                        ? `Sincronizado (${lang.toUpperCase()})! ${periodsCreated} período(s) e ${weeksCreated} semana(s) criados.`
                        : `Calendário já está atualizado. ${ahead} meses à frente.`
            };
      } catch (error) {
            console.error('Erro na sincronização:', error);
            return {
                  success: false,
                  periodsCreated: 0,
                  weeksCreated: 0,
                  monthsAhead: 0,
                  message: `Erro ao sincronizar: ${error}`
            };
      }
}

/**
 * Verificar se precisa sincronizar (menos de 2 meses à frente)
 */
export async function needsSync(lang: string = 'pt'): Promise<boolean> {
      const existingPeriods = await getExistingPeriods();
      const ahead = monthsAhead(existingPeriods, lang);
      return ahead < 2;
}
