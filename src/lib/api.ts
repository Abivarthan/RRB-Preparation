import { createClient } from '@/lib/supabase/client';
import type { Profile, Question, Test, Attempt, AttemptAnswer, LeaderboardEntry, TopicInfo } from '@/lib/types';

const supabase = createClient();

// ============================================
// Profile API
// ============================================
export async function getProfile(userId: string, supabaseClient?: any): Promise<Profile | null> {
  const client = supabaseClient || supabase;
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) return null;
  return data;
}

// ============================================
// Topics API
// ============================================
export async function getTopics(supabaseClient?: any): Promise<TopicInfo[]> {
  const client = supabaseClient || supabase;
  // Try optimized RPC first
  const { data, error } = await client.rpc('get_topic_stats');

  if (!error && data) {
    return data.map((item: any) => ({
      topic: item.topic,
      question_count: Number(item.question_count),
      subtopics: item.subtopics || [],
    }));
  }

  // Fallback to standard query if RPC fails (e.g. not yet installed)
  if (error) {
    console.warn('get_topic_stats RPC failed or not found:', {
      message: error.message,
      code: error.code,
      hint: error.hint
    });
  }
  
  const { data: questions, error: queryError } = await client
    .from('questions')
    .select('topic, subtopic');

  if (queryError || !questions) {
    console.error('Error fetching questions in fallback:', {
      message: queryError?.message,
      details: queryError?.details,
      hint: queryError?.hint,
      code: queryError?.code,
    });
    return [];
  }

  const topicMap = new Map<string, { count: number; subtopics: Set<string> }>();
  for (const q of questions) {
    const existing = topicMap.get(q.topic) || { count: 0, subtopics: new Set<string>() };
    existing.count++;
    if (q.subtopic) existing.subtopics.add(q.subtopic);
    topicMap.set(q.topic, existing);
  }

  return Array.from(topicMap.entries()).map(([topic, info]) => ({
    topic,
    question_count: info.count,
    subtopics: Array.from(info.subtopics),
  }));
}

// ============================================
// Tests API
// ============================================
export async function getTestsByTopic(topic: string): Promise<Test[]> {
  const { data, error } = await supabase
    .from('tests')
    .select('*')
    .eq('topic', topic)
    .eq('is_mock', false)
    .order('created_at', { ascending: true });

  if (error) return [];
  return data || [];
}

export async function getMockTests(): Promise<Test[]> {
  const { data, error } = await supabase
    .from('tests')
    .select('*')
    .eq('is_mock', true)
    .order('created_at', { ascending: true });

  if (error) return [];
  return data || [];
}

export async function getTestWithQuestions(testId: string, supabaseClient?: any): Promise<{ test: Test; questions: Question[] } | null> {
  const client = supabaseClient || supabase;
  const { data: test, error: testError } = await client
    .from('tests')
    .select('*')
    .eq('id', testId)
    .single();

  if (testError || !test) return null;

  const { data: testQuestions, error: tqError } = await client
    .from('test_questions')
    .select('question_id, questions(*)')
    .eq('test_id', testId);

  if (tqError || !testQuestions) return null;

  const questions = testQuestions
    .map((tq: Record<string, unknown>) => tq.questions as Question)
    .filter(Boolean);

  return { test, questions };
}

// ============================================
// Attempts API
// ============================================
export async function startAttempt(userId: string, testId: string): Promise<Attempt | null> {
  // Check for existing in-progress attempt
  const { data: existing } = await supabase
    .from('attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('test_id', testId)
    .eq('is_submitted', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (existing) return existing;

  const { data, error } = await supabase
    .from('attempts')
    .insert({
      user_id: userId,
      test_id: testId,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return null;
  return data;
}

export async function saveAnswer(
  attemptId: string,
  questionId: string,
  selectedAnswer: string,
  isCorrect: boolean
): Promise<void> {
  await supabase
    .from('attempt_answers')
    .upsert(
      {
        attempt_id: attemptId,
        question_id: questionId,
        selected_answer: selectedAnswer,
        is_correct: isCorrect,
      },
      { onConflict: 'attempt_id,question_id' }
    );
}

export async function submitAttempt(
  attemptId: string,
  userId: string,
  score: number,
  accuracy: number,
  timeTaken: number,
  answers: any[] = []
): Promise<any> {
  // Call atomic RPC to update everything in one transaction
  const { data, error } = await supabase.rpc('submit_test_attempt', {
    p_attempt_id: attemptId,
    p_score: Math.round(score),
    p_accuracy: accuracy,
    p_time_taken: timeTaken,
    p_answers: answers
  });

  if (error) {
    console.error('Supabase RPC Error (Submission):', error);
    throw new Error(`Database Error: ${error.message}`);
  }

  // Check for logical error returned in JSON
  if (data && typeof data === 'object' && 'error' in data) {
    console.error('Logic Error in RPC:', data.error);
    throw new Error(data.error as string);
  }

  return data;
}

export async function getAttempt(attemptId: string): Promise<Attempt | null> {
  const { data, error } = await supabase
    .from('attempts')
    .select('*, test:tests(*)')
    .eq('id', attemptId)
    .single();

  if (error) return null;
  return data;
}

export async function getAttemptAnswers(attemptId: string): Promise<(AttemptAnswer & { question: Question })[]> {
  const { data, error } = await supabase
    .from('attempt_answers')
    .select('*, question:questions(*)')
    .eq('attempt_id', attemptId);

  if (error) return [];
  return data || [];
}

export async function getRecentAttempts(userId: string, limit = 5, supabaseClient?: any): Promise<Attempt[]> {
  const client = supabaseClient || supabase;
  const { data, error } = await client
    .from('attempts')
    .select('*, test:tests(*)')
    .eq('user_id', userId)
    .eq('is_submitted', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data || [];
}

// ============================================
// Leaderboard API
// ============================================
export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase.rpc('get_leaderboard', {
    limit_count: limit,
  });

  if (error) {
    // Fallback: manual query
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, name, total_score, tests_attempted')
      .gt('tests_attempted', 0)
      .order('total_score', { ascending: false })
      .limit(limit);

    if (!profiles) return [];

    return profiles.map((p, i) => ({
      user_id: p.user_id,
      name: p.name,
      total_score: p.total_score,
      tests_attempted: p.tests_attempted,
      avg_accuracy: 0,
      rank: i + 1,
    }));
  }

  return data || [];
}

// ============================================
// Dynamic Test Generation
// ============================================
export async function generateTopicTest(topic: string, questionCount = 10, supabaseClient?: any): Promise<{ test: Test; questions: Question[] } | null> {
  const client = supabaseClient || supabase;
  // Try optimized RPC
  const { data: questions, error } = await client.rpc('get_random_questions_v2', {
    p_topic: topic,
    p_limit: questionCount,
  }).select('id, topic, subtopic, difficulty, question, options, correct_answer, explanation, created_at') as { data: Question[] | null, error: any };

  if (!error && questions && questions.length > 0) {
    // Persist the dynamic test so we have a real ID for the backend timer
    const { data: newTest, error: insertError } = await client
      .from('tests')
      .insert({
        title: `${topic} Practice`,
        topic,
        total_questions: questions.length,
        time_limit_seconds: questions.length * 60,
        is_mock: false,
      })
      .select()
      .single();

    if (insertError || !newTest) {
      console.error('Error persisting dynamic test:', insertError);
      // Fallback: return as transient test (timer won't persist on refresh)
      const test: Test = {
        id: `dynamic-${Date.now()}`,
        title: `${topic} Practice`,
        topic,
        total_questions: questions.length,
        time_limit_seconds: questions.length * 60,
        is_mock: false,
        created_at: new Date().toISOString(),
      };
      return { test, questions };
    }

    // Link questions to the new test
    const links = questions.map((q) => ({
      test_id: newTest.id,
      question_id: q.id,
    }));
    await client.from('test_questions').insert(links);

    return { test: newTest, questions };
  }

  // Fallback to standard random query
  console.warn('get_random_questions_v2 failed, using fallback:', error);
  const { data: fallbackQuestions, error: fallbackError } = await supabase
    .from('questions')
    .select('id, topic, subtopic, difficulty, question, options, correct_answer, explanation, created_at')
    .eq('topic', topic)
    .limit(questionCount);

  if (fallbackError || !fallbackQuestions || fallbackQuestions.length === 0) {
    console.error('Error fetching questions in fallback:', fallbackError);
    return null;
  }

  const test: Test = {
    id: `dynamic-${Date.now()}`,
    title: `${topic} Practice`,
    topic,
    total_questions: fallbackQuestions.length,
    time_limit_seconds: fallbackQuestions.length * 60,
    is_mock: false,
    created_at: new Date().toISOString(),
  };

  return { test, questions: fallbackQuestions };
}

export async function generateMockTest(questionCount = 50, supabaseClient?: any): Promise<{ test: Test; questions: Question[] } | null> {
  const client = supabaseClient || supabase;
  // Try optimized RPC
  const { data: questions, error } = await client.rpc('get_random_questions_v2', {
    p_topic: null,
    p_limit: questionCount,
  }).select('id, topic, subtopic, difficulty, question, options, correct_answer, explanation, created_at') as { data: Question[] | null, error: any };

    // Balanced distribution: fetch some questions from every topic
    const { data: topicsData } = await client.rpc('get_topic_stats');
    if (topicsData && topicsData.length > 0) {
      const questionsPerTopic = Math.max(1, Math.floor(questionCount / topicsData.length));
      let allMockQuestions: Question[] = [];

      for (const topicInfo of topicsData) {
        const { data: topicQs } = await client.rpc('get_random_questions_v2', {
          p_topic: topicInfo.topic,
          p_limit: questionsPerTopic,
        });
        if (topicQs) allMockQuestions = [...allMockQuestions, ...topicQs];
      }

      // If we still need more (due to small topics or rounding), fill up
      if (allMockQuestions.length < questionCount) {
        const { data: extraQs } = await client.rpc('get_random_questions_v2', {
          p_limit: questionCount - allMockQuestions.length,
        });
        if (extraQs) allMockQuestions = [...allMockQuestions, ...extraQs];
      }

      // Shuffle final set
      const questions = allMockQuestions.slice(0, questionCount).sort(() => Math.random() - 0.5);

      if (questions.length > 0) {
        // Persist the dynamic mock test
        const { data: newTest, error: insertError } = await client
          .from('tests')
          .insert({
            title: `RRB Mock Exam - ${new Date().toLocaleDateString()}`,
            topic: null,
            total_questions: questions.length,
            time_limit_seconds: 3600, // 1 hour for mock
            is_mock: true,
          })
          .select()
          .single();

        if (!insertError && newTest) {
          const links = questions.map((q) => ({ test_id: newTest.id, question_id: q.id }));
          await client.from('test_questions').insert(links);
          return { test: newTest, questions };
        }
      }
    }

  // Fallback to standard random query
  console.warn('get_random_questions_v2 failed for mock, using fallback:', error);
  const { data: fallbackQuestions, error: fallbackError } = await supabase
    .from('questions')
    .select('id, topic, subtopic, difficulty, question, options, correct_answer, explanation, created_at')
    .limit(questionCount);

  if (fallbackError || !fallbackQuestions || fallbackQuestions.length === 0) {
    console.error('Error fetching questions in fallback:', fallbackError);
    return null;
  }

  const test: Test = {
    id: `mock-${Date.now()}`,
    title: 'RRB Full Mock Test',
    topic: null,
    total_questions: fallbackQuestions.length,
    time_limit_seconds: 3600,
    is_mock: true,
    created_at: new Date().toISOString(),
  };

  return { test, questions: fallbackQuestions };
}


