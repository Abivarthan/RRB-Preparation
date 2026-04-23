-- ============================================
-- RRB Quiz Platform - Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Profiles Table (extends Supabase Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  streak_count INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  total_score INTEGER NOT NULL DEFAULT 0,
  tests_attempted INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. Questions Table (Optimized for 100k+ records)
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic TEXT NOT NULL,
  subtopic TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT 'medium', -- added difficulty
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  explanation TEXT NOT NULL DEFAULT '',
  random_id DOUBLE PRECISION DEFAULT random(), -- for efficient randomization
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance (High Volume)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_questions_topic_subtopic ON questions(topic, subtopic);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_random_id ON questions(random_id);

CREATE TABLE IF NOT EXISTS tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  topic TEXT,
  total_questions INTEGER NOT NULL DEFAULT 10,
  time_limit_seconds INTEGER NOT NULL DEFAULT 600,
  is_mock BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 4. Test Questions (join table)
-- ============================================
CREATE TABLE IF NOT EXISTS test_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  UNIQUE(test_id, question_id)
);

-- ============================================
-- 5. Attempts Table
-- ============================================
CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  accuracy REAL NOT NULL DEFAULT 0,
  time_taken INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  is_submitted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 6. Attempt Answers Table
-- ============================================
CREATE TABLE IF NOT EXISTS attempt_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_answer TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(attempt_id, question_id)
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic);
CREATE INDEX IF NOT EXISTS idx_questions_subtopic ON questions(subtopic);
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_test_id ON attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_attempts_created_at ON attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_questions_test_id ON test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt_id ON attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_profiles_total_score ON profiles(total_score DESC);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempt_answers ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles, update own
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Questions: readable by all authenticated users
CREATE POLICY "Questions are readable by authenticated users" ON questions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Tests: readable by all authenticated users
CREATE POLICY "Tests are readable by authenticated users" ON tests
  FOR SELECT USING (auth.role() = 'authenticated');

-- Test Questions: readable by all authenticated users
CREATE POLICY "Test questions are readable by authenticated users" ON test_questions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Attempts: users can CRUD their own attempts
CREATE POLICY "Users can view own attempts" ON attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own attempts" ON attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attempts" ON attempts
  FOR UPDATE USING (auth.uid() = user_id);

-- Attempt Answers: users can CRUD their own answers
CREATE POLICY "Users can view own attempt answers" ON attempt_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM attempts
      WHERE attempts.id = attempt_answers.attempt_id
      AND attempts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own attempt answers" ON attempt_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM attempts
      WHERE attempts.id = attempt_answers.attempt_id
      AND attempts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own attempt answers" ON attempt_answers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM attempts
      WHERE attempts.id = attempt_answers.attempt_id
      AND attempts.user_id = auth.uid()
    )
  );

-- ============================================
-- Function: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Function: Get leaderboard
-- ============================================
CREATE OR REPLACE FUNCTION get_leaderboard(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  total_score INTEGER,
  tests_attempted INTEGER,
  avg_accuracy REAL,
  rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.user_id,
    p.name,
    p.total_score,
    p.tests_attempted,
    CASE
      WHEN p.tests_attempted > 0 THEN
        (SELECT COALESCE(AVG(a.accuracy), 0)::REAL FROM attempts a WHERE a.user_id = p.user_id AND a.is_submitted = true)
      ELSE 0::REAL
    END AS avg_accuracy,
    ROW_NUMBER() OVER (ORDER BY p.total_score DESC, p.tests_attempted DESC) AS rank
  FROM profiles p
  WHERE p.tests_attempted > 0
  ORDER BY p.total_score DESC, p.tests_attempted DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Efficient Random Questions (Optimized for 100k+ rows)
-- ============================================
CREATE OR REPLACE FUNCTION get_random_questions_v2(
  p_topic TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS SETOF questions AS $$
DECLARE
  v_random FLOAT := random();
BEGIN
  IF p_topic IS NOT NULL THEN
    RETURN QUERY
    (
      SELECT * FROM questions
      WHERE topic = p_topic AND random_id >= v_random
      LIMIT p_limit
    )
    UNION ALL
    (
      SELECT * FROM questions
      WHERE topic = p_topic AND random_id < v_random
      LIMIT p_limit
    )
    LIMIT p_limit;
  ELSE
    RETURN QUERY
    (
      SELECT * FROM questions
      WHERE random_id >= v_random
      LIMIT p_limit
    )
    UNION ALL
    (
      SELECT * FROM questions
      WHERE random_id < v_random
      LIMIT p_limit
    )
    LIMIT p_limit;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Get Topic Stats (Efficiently)
-- ============================================
CREATE OR REPLACE FUNCTION get_topic_stats()
RETURNS TABLE (
  topic TEXT,
  question_count BIGINT,
  subtopics TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.topic,
    COUNT(*)::BIGINT as question_count,
    COALESCE(ARRAY_AGG(DISTINCT q.subtopic) FILTER (WHERE q.subtopic <> ''), '{}'::TEXT[]) as subtopics
  FROM questions q
  GROUP BY q.topic;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

