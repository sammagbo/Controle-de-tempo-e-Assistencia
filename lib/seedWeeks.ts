/**
 * Database Seed Script - Sync weeks table with officialSchedule2026
 * Run this from the browser console or create a dedicated route
 */

import { supabase } from './supabaseClient';
import { OFFICIAL_SCHEDULE } from './data/officialSchedule2026';

export async function seedWeeks() {
      console.log('🔄 Starting weeks sync...');

      // Step 1: Get or create the period for "Janeiro - Fevereiro 2026"
      let periodId: string;

      const { data: existingPeriods } = await supabase
            .from('periods')
            .select('id')
            .ilike('name', '%Janeiro%2026%')
            .limit(1);

      if (existingPeriods && existingPeriods.length > 0) {
            periodId = existingPeriods[0].id;
            console.log('📅 Found existing period:', periodId);
      } else {
            const { data: newPeriod, error: periodError } = await supabase
                  .from('periods')
                  .insert({ name: 'Janeiro - Fevereiro 2026' })
                  .select('id')
                  .single();

            if (periodError || !newPeriod) {
                  console.error('❌ Failed to create period:', periodError);
                  return { success: false, error: periodError };
            }
            periodId = newPeriod.id;
            console.log('✅ Created new period:', periodId);
      }

      // Step 2: Delete existing weeks for this period
      const { error: deleteError } = await supabase
            .from('weeks')
            .delete()
            .eq('period_id', periodId);

      if (deleteError) {
            console.error('❌ Failed to delete old weeks:', deleteError);
            return { success: false, error: deleteError };
      }
      console.log('🗑️ Deleted old weeks');

      // Step 3: Insert new weeks from hardcoded schedule
      const weeksToInsert = OFFICIAL_SCHEDULE.map((week, index) => ({
            period_id: periodId,
            label: `Semana ${String(index + 1).padStart(2, '0')}`,
            date_range: week.dateRange,
            theme: week.bibleReading,
      }));

      const { data: insertedWeeks, error: insertError } = await supabase
            .from('weeks')
            .insert(weeksToInsert)
            .select();

      if (insertError) {
            console.error('❌ Failed to insert weeks:', insertError);
            return { success: false, error: insertError };
      }

      console.log(`✅ Inserted ${insertedWeeks?.length || 0} weeks:`, insertedWeeks);
      return { success: true, weeks: insertedWeeks };
}

// Export for use in components
export default seedWeeks;
