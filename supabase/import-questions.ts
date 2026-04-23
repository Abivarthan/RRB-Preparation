/**
 * Import Script: Upload JSON questions into Supabase
 * 
 * Usage:
 *   npx tsx supabase/import-questions.ts
 * 
 * Requirements:
 *   - Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   - Uses service role key (not anon key) for admin operations
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

interface RawQuestion {
  id: string;
  topic: string;
  subtopic: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables.');
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function importQuestions() {
  const filePath = path.join(__dirname, 'seed-questions.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const questions: RawQuestion[] = JSON.parse(raw);

  console.log(`📦 Found ${questions.length} questions to import\n`);

  // Validate questions
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const q of questions) {
    if (!q.topic || !q.question || !q.options || !q.correctAnswer) {
      errors.push(`Question ${q.id}: Missing required fields`);
    }
    if (q.options.length !== 4) {
      errors.push(`Question ${q.id}: Must have exactly 4 options`);
    }
    if (!q.options.includes(q.correctAnswer)) {
      errors.push(`Question ${q.id}: correctAnswer not in options`);
    }
    const key = q.question.trim().toLowerCase();
    if (seen.has(key)) {
      errors.push(`Question ${q.id}: Duplicate question detected`);
    }
    seen.add(key);
  }

  if (errors.length > 0) {
    console.error('❌ Validation errors:');
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.log('✅ All questions validated\n');

  // Insert questions
  const toInsert = questions.map((q) => ({
    topic: q.topic,
    subtopic: q.subtopic || '',
    question: q.question,
    options: JSON.stringify(q.options),
    correct_answer: q.correctAnswer,
    explanation: q.explanation || '',
  }));

  const { data, error } = await supabase
    .from('questions')
    .upsert(toInsert, { onConflict: 'id', ignoreDuplicates: true })
    .select();

  if (error) {
    console.error('❌ Insert error:', error.message);
    // Try inserting one by one
    console.log('\n🔄 Trying batch insert...');
    let success = 0;
    for (const item of toInsert) {
      const { error: singleError } = await supabase
        .from('questions')
        .insert(item);
      if (singleError) {
        console.error(`  ❌ Failed: ${item.question.substring(0, 50)}... - ${singleError.message}`);
      } else {
        success++;
      }
    }
    console.log(`\n✅ Inserted ${success}/${toInsert.length} questions`);
  } else {
    console.log(`✅ Successfully imported ${data?.length || toInsert.length} questions`);
  }

  // Create topic-based tests
  console.log('\n📝 Creating topic-based tests...\n');
  
  const { data: allQuestions } = await supabase
    .from('questions')
    .select('id, topic');

  if (!allQuestions) {
    console.error('❌ Could not fetch questions');
    return;
  }

  // Group by topic
  const topicMap = new Map<string, string[]>();
  for (const q of allQuestions) {
    const list = topicMap.get(q.topic) || [];
    list.push(q.id);
    topicMap.set(q.topic, list);
  }

  for (const [topic, questionIds] of topicMap) {
    // Create tests of 10 questions each
    const numTests = Math.max(1, Math.ceil(questionIds.length / 10));
    
    for (let i = 0; i < numTests; i++) {
      const testQuestionIds = questionIds.slice(i * 10, (i + 1) * 10);
      if (testQuestionIds.length === 0) continue;

      const { data: test, error: testError } = await supabase
        .from('tests')
        .insert({
          title: `${topic} - Test ${i + 1}`,
          topic: topic,
          total_questions: testQuestionIds.length,
          time_limit_seconds: testQuestionIds.length * 60, // 1 min per question
          is_mock: false,
        })
        .select()
        .single();

      if (testError || !test) {
        console.error(`  ❌ Failed to create test: ${topic} - Test ${i + 1}`);
        continue;
      }

      // Link questions to test
      const testQuestions = testQuestionIds.map((qId) => ({
        test_id: test.id,
        question_id: qId,
      }));

      const { error: linkError } = await supabase
        .from('test_questions')
        .insert(testQuestions);

      if (linkError) {
        console.error(`  ❌ Failed to link questions: ${linkError.message}`);
      } else {
        console.log(`  ✅ Created: ${topic} - Test ${i + 1} (${testQuestionIds.length} questions)`);
      }
    }
  }

  // Create a mock test
  console.log('\n📝 Creating mock test...\n');
  
  const mockQuestionIds = allQuestions
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(50, allQuestions.length))
    .map((q) => q.id);

  const { data: mockTest, error: mockError } = await supabase
    .from('tests')
    .insert({
      title: 'RRB Full Mock Test',
      topic: null,
      total_questions: mockQuestionIds.length,
      time_limit_seconds: 3600, // 60 minutes
      is_mock: true,
    })
    .select()
    .single();

  if (mockError || !mockTest) {
    console.error('❌ Failed to create mock test');
  } else {
    const mockLinks = mockQuestionIds.map((qId) => ({
      test_id: mockTest.id,
      question_id: qId,
    }));
    await supabase.from('test_questions').insert(mockLinks);
    console.log(`  ✅ Created: RRB Full Mock Test (${mockQuestionIds.length} questions)`);
  }

  console.log('\n🎉 Import complete!');
}

importQuestions().catch(console.error);
