import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface RawQuestion {
  chapter_name: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string; // 'a', 'b', 'c', or 'd'
  correct_option_text: string;
  detailed_explanation: string;
  difficulty_level: string;
  topic_tags?: string[];
}

async function bulkImport() {
  const filePath = path.join(process.cwd(), 'rrb_combined.json');
  console.log(`📖 Reading questions from ${filePath}...`);

  const rawData = fs.readFileSync(filePath, 'utf-8');
  const rawQuestions: RawQuestion[] = JSON.parse(rawData);

  console.log(`📦 Found ${rawQuestions.length} questions. Processing...`);

  console.log('🧹 Clearing existing questions...');
  await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  const formattedQuestions = rawQuestions.map((q) => {
    const options = [q.option_a, q.option_b, q.option_c, q.option_d];
    
    // Determine correct answer text
    let correct_answer = q.correct_option_text;
    if (!correct_answer) {
        const index = q.correct_answer.toLowerCase().charCodeAt(0) - 97; // a=0, b=1...
        correct_answer = options[index] || '';
    }

    return {
      topic: q.chapter_name || 'General',
      subtopic: q.topic_tags?.[0] || '',
      difficulty: q.difficulty_level || 'medium',
      question: q.question,
      options: options,
      correct_answer: correct_answer,
      explanation: q.detailed_explanation || '',
      random_id: Math.random(),
    };
  });

  // Batch insert to avoid timeouts
  const BATCH_SIZE = 100;
  let successCount = 0;

  console.log(`🚀 Starting upload in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < formattedQuestions.length; i += BATCH_SIZE) {
    const batch = formattedQuestions.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('questions').insert(batch);

    if (error) {
      console.error(`  ❌ Error in batch ${i / BATCH_SIZE + 1}:`, error.message);
    } else {
      successCount += batch.length;
      process.stdout.write(`  ✅ Uploaded ${successCount}/${formattedQuestions.length} questions...\r`);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n\n🎉 Import Complete!');
  console.log(`✅ Successfully processed ${successCount} questions.`);
}

bulkImport().catch(console.error);
