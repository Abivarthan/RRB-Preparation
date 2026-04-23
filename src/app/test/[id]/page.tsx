import { getTestWithQuestions, generateTopicTest, generateMockTest } from '@/lib/api';
import QuizEngine from './QuizEngine';
import Navbar from '@/components/Navbar';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function TestPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ topic?: string }>;
}) {
  const { id: testId } = await params;
  const { topic: topicParam } = await searchParams;
  
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let initialData: any = null;

  if (testId === 'dynamic' && topicParam) {
    const data = await generateTopicTest(topicParam, 10, supabase);
    if (data?.test.id) {
      redirect(`/test/${data.test.id}`);
    }
  } else if (testId === 'mock') {
    const data = await generateMockTest(50, supabase);
    if (data?.test.id) {
      redirect(`/test/${data.test.id}`);
    }
  } else {
    initialData = await getTestWithQuestions(testId, supabase);
  }

  if (!initialData) {
    return (
      <>
        <Navbar />
        <div className="pt-20 text-center p-8">
          <h2 className="text-xl font-bold mb-2">Test Not Found</h2>
          <p className="text-slate-400">Could not load questions. Please try again.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <QuizEngine 
        initialTest={initialData.test} 
        initialQuestions={initialData.questions} 
        userId={user.id}
      />
    </>
  );
}
