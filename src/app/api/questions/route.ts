import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic');
  const limit = parseInt(searchParams.get('limit') || '10');

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.rpc('get_random_questions_v2', {
    p_topic: topic,
    p_limit: limit,
  }).select('id, topic, subtopic, difficulty, question, options');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
