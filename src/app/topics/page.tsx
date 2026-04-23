import { getTopics } from '@/lib/api';
import Navbar from '@/components/Navbar';
import TopicsClient from './TopicsClient';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function TopicsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Debug: verify keys are present on the server
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    console.error('CRITICAL: NEXT_PUBLIC_SUPABASE_URL is missing or placeholder in Server Component');
  }

  // Fetch topics on the server
  const topics = await getTopics(supabase);

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-12 px-4 max-w-5xl mx-auto">
        <TopicsClient initialTopics={topics} />
      </main>
    </>
  );
}
