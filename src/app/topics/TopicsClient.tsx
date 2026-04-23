'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calculator,
  Brain,
  Globe,
  ChevronRight,
  BookOpen,
  Hash,
  Play,
  ArrowLeft,
} from 'lucide-react';
import type { TopicInfo, Test } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { getTestsByTopic } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

const topicIcons: Record<string, any> = {
  Arithmetic: Calculator,
  Reasoning: Brain,
  'General Awareness': Globe,
};

const topicColors: Record<string, string> = {
  Arithmetic: 'from-blue-500 to-indigo-500',
  Reasoning: 'from-purple-500 to-pink-500',
  'General Awareness': 'from-emerald-500 to-teal-500',
};

export default function TopicsClient({ initialTopics }: { initialTopics: TopicInfo[] }) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Use React Query for fetching tests once a topic is selected (caching)
  const { data: tests, isLoading: testsLoading } = useQuery({
    queryKey: ['tests', selectedTopic],
    queryFn: () => getTestsByTopic(selectedTopic!),
    enabled: !!selectedTopic,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  if (!selectedTopic) {
    return (
      <div className="animate-fadeIn">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black mb-2 flex items-center gap-4 text-slate-900">
            <BookOpen size={36} className="text-indigo-600" />
            Study Topics
          </h1>
          <p className="text-slate-500 text-base sm:text-lg font-medium">Select a subject to begin your focused practice sessions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {initialTopics.map((topic) => {
            const Icon = topicIcons[topic.topic] || BookOpen;
            const color = topicColors[topic.topic] || 'from-indigo-600 to-purple-600';

            return (
              <button
                key={topic.topic}
                onClick={() => setSelectedTopic(topic.topic)}
                className="glass-card p-8 text-left group bg-white border-slate-200 hover:border-indigo-300"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-lg shadow-black/10`}>
                  <Icon size={30} className="text-white" />
                </div>
                <h3 className="text-2xl font-black mb-3 text-slate-900">{topic.topic}</h3>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">
                  <Hash size={16} />
                  {topic.question_count} Questions
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {topic.subtopics.slice(0, 3).map((st) => (
                    <span key={st} className="text-[10px] px-3 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-100 font-black uppercase tracking-wider">
                      {st}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-base text-indigo-600 font-black uppercase tracking-widest pt-4 border-t border-slate-50 group-hover:gap-3 transition-all">
                  Browse Tests
                  <ChevronRight size={20} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <button
        onClick={() => setSelectedTopic(null)}
        className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-indigo-600 mb-8 uppercase tracking-widest transition-colors"
      >
        <ArrowLeft size={18} /> Back to All Topics
      </button>

      <h1 className="text-3xl sm:text-4xl font-black mb-8 text-slate-900">{selectedTopic} <span className="text-indigo-600">Tests</span></h1>

      {testsLoading ? (
        <LoadingSpinner message="Curating available tests..." />
      ) : (
        <div className="grid gap-4 sm:gap-5">
          {tests?.map((test: Test, i: number) => (
            <Link
              key={test.id}
              href={`/test/${test.id}`}
              className="glass-card p-6 flex items-center gap-5 group bg-white border-slate-200 hover:border-indigo-300"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg shadow-inner">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-lg text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{test.title}</h3>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                  <span>{test.total_questions} Questions</span>
                  <span>·</span>
                  <span>{Math.floor(test.time_limit_seconds / 60)} Minutes</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Play size={20} className="fill-current" />
              </div>
            </Link>
          ))}

          <Link
            href={`/test/dynamic?topic=${encodeURIComponent(selectedTopic)}`}
            className="glass-card p-6 flex items-center gap-5 group border-dashed border-2 border-slate-300 bg-slate-50/50 hover:bg-white hover:border-indigo-400"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner">
              <Play size={24} className="fill-current" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-lg text-slate-900">Custom Practice Session</h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">10 Dynamic Randomized Questions</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
              <ChevronRight size={24} />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
