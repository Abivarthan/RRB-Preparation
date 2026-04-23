import { NextResponse } from 'next/server';
import { generateMockTest } from '@/lib/api';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const data = await generateMockTest(50, supabase);

  if (!data) {
    return NextResponse.json({ error: 'Failed to generate mock test' }, { status: 500 });
  }

  return NextResponse.json(data);
}
