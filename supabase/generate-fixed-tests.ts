import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const QUESTIONS_PER_TEST = 10;
const TIME_PER_QUESTION = 60; // seconds

async function generateFixedTests() {
  console.log('🚀 Starting fixed test generation...');

  // 1. Get all questions grouped by topic
  const { data: questions, error: fetchError } = await supabase
    .from('questions')
    .select('id, topic, subtopic')
    .order('topic')
    .order('created_at');

  if (fetchError || !questions) {
    console.error('❌ Error fetching questions:', fetchError);
    return;
  }

  const questionsByTopic: Record<string, any[]> = {};
  questions.forEach((q) => {
    if (!questionsByTopic[q.topic]) {
      questionsByTopic[q.topic] = [];
    }
    questionsByTopic[q.topic].push(q);
  });

  console.log(`📊 Found ${Object.keys(questionsByTopic).length} topics.`);

  // 2. Clear existing non-mock tests
  console.log('🧹 Cleaning up old fixed tests...');
  const { error: clearError } = await supabase
    .from('tests')
    .delete()
    .eq('is_mock', false);

  if (clearError) {
    console.warn('⚠️ Warning during cleanup:', clearError.message);
  }

  // 3. Generate tests per topic
  for (const [topic, topicQuestions] of Object.entries(questionsByTopic)) {
    const totalQuestions = topicQuestions.length;
    const numTests = Math.floor(totalQuestions / QUESTIONS_PER_TEST);
    
    console.log(`📝 Processing topic: ${topic} (${totalQuestions} questions -> ${numTests} tests)`);

    for (let i = 0; i < numTests; i++) {
      const startIdx = i * QUESTIONS_PER_TEST;
      const endIdx = startIdx + QUESTIONS_PER_TEST;
      const chunk = topicQuestions.slice(startIdx, endIdx);

      // Create test record
      const { data: test, error: testError } = await supabase
        .from('tests')
        .insert({
          title: `${topic} - Practice Test ${i + 1}`,
          topic: topic,
          total_questions: QUESTIONS_PER_TEST,
          time_limit_seconds: QUESTIONS_PER_TEST * TIME_PER_QUESTION,
          is_mock: false
        })
        .select()
        .single();

      if (testError || !test) {
        console.error(`  ❌ Error creating test for ${topic}:`, testError);
        continue;
      }

      // Create mappings
      const mappings = chunk.map((q) => ({
        test_id: test.id,
        question_id: q.id
      }));

      const { error: mappingError } = await supabase
        .from('test_questions')
        .insert(mappings);

      if (mappingError) {
        console.error(`  ❌ Error linking questions for ${topic} Test ${i + 1}:`, mappingError);
      }
    }
  }

  console.log('🎉 Fixed test generation complete!');
}

generateFixedTests().catch(console.error);
