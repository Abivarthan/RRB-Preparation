'use client';

import { useQuery } from '@tanstack/react-query';
import { getMockTests } from '@/lib/api';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import {
  FileText,
  Clock,
  Hash,
  Play,
  Zap,
  BookOpen,
  ChevronRight,
} from 'lucide-react';

export default function MockTestPage() {
  const { data: mockTests, isLoading } = useQuery({
    queryKey: ['mockTests'],
    queryFn: getMockTests,
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="pt-16"><LoadingSpinner message="Loading mock tests..." /></div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-12 px-4 max-w-4xl mx-auto">
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 flex items-center gap-3">
            <FileText size={28} className="text-purple-400" />
            Mock Tests
          </h1>
          <p className="text-slate-400">Full-length practice exams to test your readiness</p>
        </div>

        {/* Info Card */}
        <div className="glass-card p-6 mb-8 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Zap size={22} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">RRB Full Mock Exam</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Simulate the actual RRB exam environment. 50 mixed-topic questions covering
                Arithmetic, Reasoning, and General Awareness. You have 60 minutes to complete.
                Timer persists even if you refresh!
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Hash size={14} className="text-purple-400" />
                  50 Questions
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Clock size={14} className="text-purple-400" />
                  60 Minutes
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <BookOpen size={14} className="text-purple-400" />
                  Mixed Topics
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mock Test List */}
        <div className="space-y-3 stagger-children">
          {mockTests && mockTests.length > 0 ? (
            mockTests.map((test, i) => (
              <Link
                key={test.id}
                href={`/test/${test.id}`}
                className="glass-card p-5 flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{test.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Hash size={12} />
                      {test.total_questions} questions
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {Math.floor(test.time_limit_seconds / 60)} minutes
                    </span>
                  </div>
                </div>
                <div className="btn-primary py-2.5 px-5 flex-shrink-0">
                  <Play size={16} />
                  Start Exam
                </div>
              </Link>
            ))
          ) : (
            <>
              {/* Generate on-the-fly mock */}
              <Link
                href="/test/mock"
                className="glass-card p-6 flex items-center gap-4 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
                  <Play size={26} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Start Full Mock Test</h3>
                  <p className="text-sm text-slate-400">
                    50 questions · 60 minutes · All topics mixed
                  </p>
                </div>
                <ChevronRight size={20} className="text-slate-500 group-hover:text-purple-400 transition-colors flex-shrink-0" />
              </Link>

            </>
          )}
        </div>

        {/* Tips */}
        <div className="mt-8 glass-card p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            💡 Exam Tips
          </h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              Attempt easier questions first to build confidence
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              Use the Flag feature to mark questions for review
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              Don&apos;t spend more than 1.5 minutes on any single question
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              Timer persists even if you refresh the page
            </li>
          </ul>
        </div>
      </main>
    </>
  );
}
