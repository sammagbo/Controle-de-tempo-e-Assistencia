/**
 * Serviço de Sincronização Automática do Calendário
 * Busca dados da Apostila da Reunião diretamente do jw.org
 * e importa para o banco de dados Supabase.
 */

import { supabase } from './supabaseClient';

// URLs base do jw.org
const JW_BASE_URL = 'https://www.jw.org/pt/biblioteca/jw-apostila-do-mes';

// Mapear meses para slugs do jw.org
const MONTH_SLUGS: Record<string, string> = {
      'janeiro-fevereiro': 'janeiro-fevereiro',
      'março-abril': 'marco-abril',
      'maio-junho': 'maio-junho',
      'julho-agosto': 'julho-agosto',
      'setembro-outubro': 'setembro-outubro',
      'novembro-dezembro': 'novembro-dezembro'
};

const PERIOD_ORDER = [
      'janeiro-fevereiro',
      'março-abril',
      'maio-junho',
      'julho-agosto',
      'setembro-outubro',
      'novembro-dezembro'
];

interface WeekData {
      dateRange: string;
      theme: string;
      url: string;
}

interface PeriodData {
      name: string;
      slug: string;
      year: number;
      weeks: WeekData[];
}

/**
 * Busca os períodos disponíveis no jw.org
 */
async function fetchAvailablePeriods(): Promise<string[]> {
      try {
            const response = await fetch(`${JW_BASE_URL}/`);
            const html = await response.text();

            // Extrair links de períodos (ex: maio-junho-2026-mwb)
            const periodRegex = /href="[^"]*\/jw-apostila-do-mes\/([a-z-]+-\d{4}-mwb)\/?"/gi;
            const matches = [...html.matchAll(periodRegex)];
            const periods = [...new Set(matches.map(m => m[1]))];

            return periods;
      } catch (error) {
            console.error('Erro ao buscar períodos:', error);
            return [];
      }
}

/**
 * Converte slug do período para nome amigável
 * Ex: "maio-junho-2026-mwb" -> "Maio - Junho 2026"
 */
function slugToPeriodName(slug: string): string {
      const parts = slug.replace('-mwb', '').split('-');
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
function monthsAhead(periods: string[]): number {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      let maxMonthsAhead = 0;

      for (const period of periods) {
            // Ex: "Maio - Junho 2026"
            const match = period.match(/(\w+)\s*-\s*(\w+)\s+(\d{4})/i);
            if (!match) continue;

            const monthMap: Record<string, number> = {
                  'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3,
                  'maio': 4, 'junho': 5, 'julho': 6, 'agosto': 7,
                  'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
            };

            const endMonth = monthMap[match[2].toLowerCase()];
            const year = parseInt(match[3]);

            if (endMonth !== undefined) {
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
async function fetchWeeksFromJwOrg(periodSlug: string): Promise<WeekData[]> {
      try {
            const url = `${JW_BASE_URL}/${periodSlug}/`;
            const response = await fetch(url);
            const html = await response.text();

            const weeks: WeekData[] = [];

            // Regex para encontrar links de semanas
            // Ex: "2-8 de março" ou "27 de abril–3 de maio"
            const weekLinkRegex = /href="([^"]*Programa[^"]*)"[^>]*>[\s\S]*?(\d+(?:-\d+)?\s+de\s+\w+(?:\s*[–-]\s*\d+\s+de\s+\w+)?)/gi;
            const matches = [...html.matchAll(weekLinkRegex)];

            for (const match of matches) {
                  const weekUrl = match[1];
                  const dateRange = match[2].replace(/–/g, '-').trim();

                  // Tema pode ser extraído da página da semana (simplificado aqui)
                  weeks.push({
                        dateRange,
                        theme: `Leitura da semana de ${dateRange}`,
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
 * Retorna quantos períodos novos foram criados
 */
export async function syncCalendarFromJwOrg(): Promise<{
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
            const availableSlugs = await fetchAvailablePeriods();

            let periodsCreated = 0;
            let weeksCreated = 0;

            // 3. Para cada período disponível, verificar se precisa importar
            for (const slug of availableSlugs) {
                  const periodName = slugToPeriodName(slug);

                  if (!existingPeriods.includes(periodName)) {
                        // Criar período
                        const periodId = await createPeriod(periodName);

                        if (periodId) {
                              periodsCreated++;

                              // Buscar e criar semanas
                              const weeks = await fetchWeeksFromJwOrg(slug);
                              await createWeeks(periodId, weeks);
                              weeksCreated += weeks.length;
                        }
                  }
            }

            // 4. Recalcular meses à frente
            const updatedPeriods = await getExistingPeriods();
            const ahead = monthsAhead(updatedPeriods);

            return {
                  success: true,
                  periodsCreated,
                  weeksCreated,
                  monthsAhead: ahead,
                  message: periodsCreated > 0
                        ? `Sincronizado! ${periodsCreated} período(s) e ${weeksCreated} semana(s) criados.`
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
export async function needsSync(): Promise<boolean> {
      const existingPeriods = await getExistingPeriods();
      const ahead = monthsAhead(existingPeriods);
      return ahead < 2;
}
