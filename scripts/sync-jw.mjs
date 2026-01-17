#!/usr/bin/env node
/**
 * JW.org Calendar Sync Script (using curl)
 * 
 * This script fetches meeting workbook data from jw.org and imports it into Supabase.
 * Run from the command line: node scripts/sync-jw.mjs [lang]
 * 
 * Examples:
 *   node scripts/sync-jw.mjs        # Syncs Portuguese (default)
 *   node scripts/sync-jw.mjs fr     # Syncs French
 *   node scripts/sync-jw.mjs pt     # Syncs Portuguese
 */

import { createClient } from '@supabase/supabase-js';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';

const execAsync = promisify(exec);

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env');
      process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Configuration per language
const CALENDAR_CONFIG = {
      pt: {
            baseUrl: 'https://www.jw.org/pt/biblioteca/jw-apostila-do-mes',
            periodRegex: /href="[^"]*\/jw-apostila-do-mes\/([a-z-]+-\d{4}-mwb)\/?"/gi,
            weekLinkRegex: /href="([^"]*Programa[^"]*)"[^>]*>[\s\S]*?(\d+(?:-\d+)?\s+de\s+\w+(?:\s*[–-]\s*\d+\s+de\s+\w+)?)/gi,
      },
      fr: {
            baseUrl: 'https://www.jw.org/fr/biblioth%C3%A8que/reunion-tj-cahier',
            periodRegex: /href="([^"]*mwb-[a-z-]+-\d{4})\/?"/gi,
            weekLinkRegex: /href="([^"]*Programme-pour-la-r[^"]*)"[^>]*>[\s\S]*?(\d+(?:-\d+)?\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)(?:\s*[–-]\s*\d+\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre))?)/gi,
      }
};

/**
 * Fetch a URL using curl
 */
async function curlFetch(url) {
      const { stdout, stderr } = await execAsync(`curl -s "${url}"`);
      if (stderr) {
            console.error('curl stderr:', stderr);
      }
      return stdout;
}

/**
 * Convert slug to friendly period name
 */
function slugToPeriodName(slug) {
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
 * Fetch available periods from jw.org
 */
async function fetchAvailablePeriods(lang) {
      const config = CALENDAR_CONFIG[lang];
      console.log(`Fetching periods from ${config.baseUrl}...`);

      const html = await curlFetch(`${config.baseUrl}/`);
      const matches = [...html.matchAll(config.periodRegex)];

      // Extract slugs
      const periods = [...new Set(matches.map(m => {
            const fullMatch = m[1];
            // For French, extract just "mwb-..." part
            if (lang === 'fr') {
                  const slugMatch = fullMatch.match(/(mwb-[a-z-]+-\d{4})/);
                  return slugMatch ? slugMatch[1] : fullMatch;
            }
            return fullMatch;
      }))];

      console.log(`Found ${periods.length} periods:`, periods);
      return periods;
}

/**
 * Fetch weeks from a specific period
 */
async function fetchWeeksFromJwOrg(periodSlug, lang) {
      const config = CALENDAR_CONFIG[lang];
      const url = `${config.baseUrl}/${periodSlug}/`;
      console.log(`  Fetching weeks from ${url}...`);

      const html = await curlFetch(url);
      const matches = [...html.matchAll(config.weekLinkRegex)];

      const weeks = matches.map(match => ({
            dateRange: match[2].replace(/–/g, '-').trim(),
            theme: `Leitura da semana de ${match[2].replace(/–/g, '-').trim()}`,
            url: match[1]
      }));

      console.log(`    Found ${weeks.length} weeks`);
      return weeks;
}

/**
 * Get existing periods from database
 */
async function getExistingPeriods() {
      const { data, error } = await supabase
            .from('periods')
            .select('name');

      if (error) throw error;
      return data?.map(p => p.name) || [];
}

/**
 * Create a new period in the database
 */
async function createPeriod(name) {
      // Check if exists
      const { data: existing } = await supabase
            .from('periods')
            .select('id')
            .eq('name', name)
            .single();

      if (existing) return existing.id;

      // Create new
      const { data, error } = await supabase
            .from('periods')
            .insert({ name })
            .select('id')
            .single();

      if (error) throw error;
      return data?.id;
}

/**
 * Create weeks for a period
 */
async function createWeeks(periodId, weeks) {
      for (let i = 0; i < weeks.length; i++) {
            const week = weeks[i];

            // Check if exists
            const { data: existing } = await supabase
                  .from('weeks')
                  .select('id')
                  .eq('period_id', periodId)
                  .eq('date_range', week.dateRange)
                  .single();

            if (existing) continue;

            // Create new
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
 * Main sync function
 */
async function syncCalendar(lang = 'pt') {
      console.log(`\n🔄 Starting sync for language: ${lang.toUpperCase()}\n`);

      try {
            // Get existing periods
            const existingPeriods = await getExistingPeriods();
            console.log(`Existing periods in DB: ${existingPeriods.length}`);

            // Fetch available periods from jw.org
            const availableSlugs = await fetchAvailablePeriods(lang);

            let periodsCreated = 0;
            let weeksCreated = 0;

            // Process each period
            for (const slug of availableSlugs) {
                  const periodName = slugToPeriodName(slug);

                  if (!existingPeriods.includes(periodName)) {
                        console.log(`\n📅 Creating period: ${periodName}`);
                        const periodId = await createPeriod(periodName);

                        if (periodId) {
                              periodsCreated++;

                              // Fetch and create weeks
                              const weeks = await fetchWeeksFromJwOrg(slug, lang);
                              await createWeeks(periodId, weeks);
                              weeksCreated += weeks.length;
                        }
                  } else {
                        console.log(`  ✓ Period already exists: ${periodName}`);
                  }
            }

            console.log(`\n✅ Sync complete!`);
            console.log(`   Periods created: ${periodsCreated}`);
            console.log(`   Weeks created: ${weeksCreated}`);

      } catch (error) {
            console.error('\n❌ Sync failed:', error.message);
            process.exit(1);
      }
}

// Get language from command line argument
const lang = process.argv[2] || 'pt';

if (!['pt', 'fr'].includes(lang)) {
      console.error('Invalid language. Use: pt or fr');
      process.exit(1);
}

syncCalendar(lang);
