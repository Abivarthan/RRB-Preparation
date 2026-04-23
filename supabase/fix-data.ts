import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixOptionsData() {
  console.log('🔍 Checking for malformed options data...');

  const { data: questions, error } = await supabase
    .from('questions')
    .select('id, options');

  if (error || !questions) {
    console.error('❌ Error fetching questions:', error);
    return;
  }

  let fixCount = 0;
  for (const q of questions) {
    if (typeof q.options === 'string') {
      try {
        const parsed = JSON.parse(q.options);
        if (Array.isArray(parsed)) {
          const { error: updateError } = await supabase
            .from('questions')
            .update({ options: parsed })
            .eq('id', q.id);

          if (!updateError) {
            fixCount++;
            if (fixCount % 100 === 0) {
              process.stdout.write(`  ✅ Fixed ${fixCount} questions...\r`);
            }
          }
        }
      } catch (e) {
        // Not a valid JSON string or already an object
      }
    }
  }

  console.log(`\n🎉 Data fix complete! Fixed ${fixCount} questions.`);
}

fixOptionsData().catch(console.error);
