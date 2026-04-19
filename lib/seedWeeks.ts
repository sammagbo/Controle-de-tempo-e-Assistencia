import { supabase } from './supabaseClient';
import { OFFICIAL_SCHEDULE } from './data/officialSchedule2026';

const PERIOD_DEFINITIONS = [
  { name: 'Janeiro - Fevereiro 2026', months: [0, 1] },
  { name: 'Março - Abril 2026',       months: [2, 3] },
  { name: 'Maio - Junho 2026',         months: [4, 5] },
  { name: 'Julho - Agosto 2026',       months: [6, 7] },
  { name: 'Setembro - Outubro 2026',   months: [8, 9] },
  { name: 'Novembro - Dezembro 2026',  months: [10, 11] },
];

export async function seedWeeks() {
  console.log('🔄 Starting weeks sync...');

  for (const periodDef of PERIOD_DEFINITIONS) {
    // Filter weeks that belong to this period
    const weeksForPeriod = OFFICIAL_SCHEDULE.filter(week => {
      const month = new Date(week.startDate + 'T00:00:00').getMonth();
      return periodDef.months.includes(month);
    });

    if (weeksForPeriod.length === 0) continue;

    // Get or create period
    let periodId: string;

    const { data: existingPeriods } = await supabase
      .from('periods')
      .select('id')
      .ilike('name', periodDef.name)
      .limit(1);

    if (existingPeriods && existingPeriods.length > 0) {
      periodId = existingPeriods[0].id;
      console.log(`📅 Found existing period: ${periodDef.name}`);
    } else {
      const { data: newPeriod, error: periodError } = await supabase
        .from('periods')
        .insert({ name: periodDef.name })
        .select('id')
        .single();

      if (periodError || !newPeriod) {
        console.error(`❌ Failed to create period ${periodDef.name}:`, periodError);
        return { success: false, error: periodError };
      }
      periodId = newPeriod.id;
      console.log(`✅ Created period: ${periodDef.name}`);
    }

    // Replace existing weeks for this period
    await supabase.from('weeks').delete().eq('period_id', periodId);

    const weeksToInsert = weeksForPeriod.map((week, index) => ({
      period_id: periodId,
      label: `Semana ${String(index + 1).padStart(2, '0')}`,
      date_range: week.dateRange,
      theme: week.bibleReading,
    }));

    const { error: insertError } = await supabase.from('weeks').insert(weeksToInsert);

    if (insertError) {
      console.error(`❌ Failed to insert weeks for ${periodDef.name}:`, insertError);
      return { success: false, error: insertError };
    }

    console.log(`✅ ${weeksToInsert.length} weeks inserted for ${periodDef.name}`);
  }

  return { success: true };
}

export default seedWeeks;
