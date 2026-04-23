import { NextResponse } from 'next/server';
import { generateTopicTest } from '@/lib/api';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic');

  if (!topic) {
    return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const data = await generateTopicTest(topic, 10, supabase);

  if (!data) {
    return NextResponse.json({ error: 'Failed to generate test' }, { status: 500 });
  }

  return NextResponse.json(data);
}
