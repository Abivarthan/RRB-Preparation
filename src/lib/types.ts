// ============================================
// Database Types
// ============================================

export interface Profile {
  user_id: string;
  name: string;
  email: string;
  streak_count: number;
  last_active_date: string | null;
  total_score: number;
  tests_attempted: number;
  created_at: string;
}

export interface Question {
  id: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  random_id?: number;
  created_at: string;
}

export interface Test {
  id: string;
  title: string;
  topic: string | null;
  total_questions: number;
  time_limit_seconds: number;
  is_mock: boolean;
  created_at: string;
}

export interface TestQuestion {
  id: string;
  test_id: string;
  question_id: string;
  question?: Question;
}

export interface Attempt {
  id: string;
  user_id: string;
  test_id: string;
  score: number;
  accuracy: number;
  time_taken: number;
  started_at: string;
  completed_at: string | null;
  is_submitted: boolean;
  created_at: string;
  test?: Test;
}

export interface AttemptAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_answer: string | null;
  is_correct: boolean;
}

// ============================================
// Frontend Types
// ============================================

export interface QuizState {
  currentQuestionIndex: number;
  answers: Record<string, string | null>;
  flagged: Set<string>;
  timeRemaining: number;
}

export interface TopicInfo {
  topic: string;
  question_count: number;
  subtopics: string[];
}

export interface LeaderboardEntry {
  user_id: string;
  name: string;
  total_score: number;
  tests_attempted: number;
  avg_accuracy: number;
  rank: number;
}

export interface QuizQuestion extends Question {
  selectedAnswer?: string | null;
}

export interface TestWithQuestions extends Test {
  questions: Question[];
}
