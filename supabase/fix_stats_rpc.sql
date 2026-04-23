-- ============================================
-- Atomic Stats Update Function
-- ============================================

CREATE OR REPLACE FUNCTION submit_test_attempt(
  p_attempt_id UUID,
  p_score INTEGER,
  p_accuracy REAL,
  p_time_taken INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_is_submitted BOOLEAN;
  v_last_active DATE;
  v_streak INTEGER;
  -- Use IST (Indian Standard Time) as default for RRB exams
  v_today DATE := (timezone('Asia/Kolkata', now()))::DATE;
  v_result JSONB;
BEGIN
  -- 1. Get attempt info and check if already submitted
  SELECT user_id, is_submitted INTO v_user_id, v_is_submitted
  FROM attempts WHERE id = p_attempt_id;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Attempt not found');
  END IF;

  IF v_is_submitted THEN
    -- Already submitted, return current profile state without re-updating
    SELECT jsonb_build_object(
      'success', true,
      'already_submitted', true,
      'profile', json_build_object(
        'total_score', total_score,
        'tests_attempted', tests_attempted,
        'streak_count', streak_count
      )
    ) INTO v_result
    FROM profiles WHERE user_id = v_user_id;
    RETURN v_result;
  END IF;

  -- 2. Update the attempt
  UPDATE attempts
  SET 
    score = p_score,
    accuracy = p_accuracy,
    time_taken = p_time_taken,
    is_submitted = true,
    completed_at = NOW()
  WHERE id = p_attempt_id;

  -- 3. Update profile stats atomically
  -- Get current streak info
  SELECT streak_count, last_active_date INTO v_streak, v_last_active
  FROM profiles WHERE user_id = v_user_id;

  -- 4. Streak Logic
  IF v_last_active IS NULL THEN
    v_streak := 1;
  ELSIF v_last_active = v_today THEN
    -- Already active today, keep same streak
  ELSIF v_last_active = (v_today - INTERVAL '1 day')::DATE THEN
    -- Active yesterday, increment streak
    v_streak := v_streak + 1;
  ELSE
    -- Gap > 1 day, reset streak to 1
    v_streak := 1;
  END IF;

  -- 5. Update profile
  UPDATE profiles
  SET
    total_score = total_score + p_score,
    tests_attempted = tests_attempted + 1,
    streak_count = v_streak,
    last_active_date = v_today
  WHERE user_id = v_user_id
  RETURNING jsonb_build_object(
    'success', true,
    'total_score', total_score,
    'tests_attempted', tests_attempted,
    'streak_count', streak_count,
    'last_active_date', last_active_date
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
