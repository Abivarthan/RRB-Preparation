'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getAttempt, getAttemptAnswers } from '@/lib/api';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import {
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Home,
  RotateCcw,
} from 'lucide-react';
import { useState } from 'react';
import type { Question } from '@/lib/types';

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  const { data: attempt, isLoading: attemptLoading } = useQuery({
    queryKey: ['attempt', attemptId],
    queryFn: () => getAttempt(attemptId),
    enabled: !!attemptId,
  });

  const { data: attemptAnswers, isLoading: answersLoading } = useQuery({
    queryKey: ['attemptAnswers', attemptId],
    queryFn: () => getAttemptAnswers(attemptId),
    enabled: !!attemptId,
  });

  if (attemptLoading || answersLoading) {
    return (
      <>
        <Navbar />
        <div className="pt-16"><LoadingSpinner message="Loading results..." /></div>
      </>
    );
  }

  if (!attempt) {
    return (
      <>
        <Navbar />
        <div className="pt-20 text-center p-8">
          <h2 className="text-xl font-bold mb-2">Result Not Found</h2>
          <p className="text-slate-400 mb-4">This result may have been removed.</p>
          <Link href="/dashboard" className="btn-primary">
            <Home size={16} /> Go to Dashboard
          </Link>
        </div>
      </>
    );
  }

  const test = attempt.test as unknown as { title: string; total_questions: number; topic?: string } | undefined;
  const totalQuestions = test?.total_questions || attemptAnswers?.length || 0;
  const correctCount = attemptAnswers?.filter((a) => a.is_correct).length || 0;
  const wrongCount = (attemptAnswers?.length || 0) - correctCount;
  const unanswered = totalQuestions - (attemptAnswers?.length || 0);

  const getGrade = (accuracy: number) => {
    if (accuracy >= 90) return { label: 'Excellent Achievement!', color: 'text-emerald-600', emoji: '🏆', bg: 'bg-emerald-50' };
    if (accuracy >= 70) return { label: 'Great Performance!', color: 'text-indigo-600', emoji: '🎉', bg: 'bg-indigo-50' };
    if (accuracy >= 50) return { label: 'Good Effort', color: 'text-amber-600', emoji: '👍', bg: 'bg-amber-50' };
    return { label: 'Keep Practicing', color: 'text-red-600', emoji: '💪', bg: 'bg-red-50' };
  };

  const grade = getGrade(attempt.accuracy);

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-indigo-600 mb-8 transition-colors uppercase tracking-widest"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        {/* Score Hero */}
        <div className="glass-card p-8 sm:p-12 text-center mb-10 animate-scaleIn relative overflow-hidden bg-white border-slate-200">
          <div className="absolute top-0 left-0 right-0 h-1.5 gradient-accent" />
          
          <div className="text-5xl sm:text-7xl mb-5">{grade.emoji}</div>
          <h1 className={`text-3xl sm:text-5xl font-black mb-3 ${grade.color} tracking-tight`}>
            {grade.label}
          </h1>
          <p className="text-slate-500 text-base sm:text-lg font-bold mb-10 max-w-lg mx-auto uppercase tracking-wide">{test?.title || 'Comprehensive Evaluation'}</p>

          <div className="relative inline-flex items-center justify-center mb-12 group">
            <div className="absolute inset-0 bg-indigo-100 blur-3xl rounded-full transition-all group-hover:scale-125 opacity-50" />
            <div className="relative w-40 h-40 sm:w-56 sm:h-56 rounded-full border-[8px] border-slate-50 flex items-center justify-center shadow-inner">
              <div className="text-center">
                <div className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tighter">{attempt.score}</div>
                <div className="text-xs sm:text-sm text-slate-400 font-black uppercase tracking-widest mt-1">of {totalQuestions} Correct</div>
              </div>
              <svg className="absolute inset-0 w-full h-full -rotate-90 p-[-4px]" viewBox="0 0 120 120">
                <circle
                  cx="60" cy="60" r="54" fill="none"
                  stroke="url(#scoreGradient)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(attempt.accuracy / 100) * 339.3} 339.3`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-lg hover:border-indigo-100">
              <Target size={22} className="mx-auto mb-3 text-indigo-600" />
              <div className="text-2xl font-black text-slate-900 tracking-tighter">{Math.round(attempt.accuracy)}%</div>
              <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Accuracy</div>
            </div>
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 transition-all hover:bg-white hover:shadow-lg hover:border-emerald-200">
              <CheckCircle2 size={22} className="mx-auto mb-3 text-emerald-600" />
              <div className="text-2xl font-black text-emerald-600 tracking-tighter">{correctCount}</div>
              <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Correct</div>
            </div>
            <div className="p-5 rounded-2xl bg-red-50 border border-red-100 transition-all hover:bg-white hover:shadow-lg hover:border-red-200">
              <XCircle size={22} className="mx-auto mb-3 text-red-600" />
              <div className="text-2xl font-black text-red-600 tracking-tighter">{wrongCount}</div>
              <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Incorrect</div>
            </div>
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 transition-all hover:bg-white hover:shadow-lg hover:border-amber-200">
              <Clock size={22} className="mx-auto mb-3 text-amber-600" />
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter">
                {Math.floor(attempt.time_taken / 60)}m {attempt.time_taken % 60}s
              </div>
              <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Time Elapsed</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-12">
          <Link href="/dashboard" className="flex-1 sm:flex-none btn-primary shadow-xl shadow-indigo-600/20">
            <Home size={20} /> Back to Dashboard
          </Link>
          {test?.topic && (
            <Link href="/topics" className="flex-1 sm:flex-none btn-secondary bg-white">
              <RotateCcw size={20} /> Retake Test
            </Link>
          )}
          <Link href="/leaderboard" className="flex-1 sm:flex-none btn-secondary bg-white">
            <Trophy size={20} /> Leaderboard
          </Link>
        </div>

        {/* Detailed Review */}
        <div className="mb-8">
          <h2 className="text-2xl font-black flex items-center gap-3 text-slate-900">
            <BarChart3 size={24} className="text-indigo-600" />
            Performance Review
          </h2>
        </div>

        <div className="space-y-4">
          {attemptAnswers?.map((answer, i) => {
            const question = answer.question as unknown as Question;
            if (!question) return null;

            const isExpanded = expandedQ === answer.id;

            return (
              <div
                key={answer.id}
                className={`glass-card overflow-hidden transition-all bg-white border-slate-200 ${
                  answer.is_correct ? 'border-l-[6px] border-l-emerald-500' : 'border-l-[6px] border-l-red-500'
                }`}
              >
                <button
                  onClick={() => setExpandedQ(isExpanded ? null : answer.id)}
                  className="w-full p-5 sm:p-6 flex items-center gap-4 text-left group"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                    answer.is_correct
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-red-50 text-red-600'
                  }`}>
                    {answer.is_correct ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-relaxed">
                      <span className="text-slate-300 font-black mr-2 uppercase text-xs tracking-widest">Question {i + 1}</span>
                      {question.question}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 sm:px-8 pb-8 sm:pb-10 pt-0 border-t border-slate-50 animate-fadeIn bg-slate-50/30">
                    <div className="mt-6 space-y-3">
                      {(Array.isArray(question.options) 
                        ? question.options 
                        : JSON.parse(question.options as any)).map((opt: string, j: number) => {
                        const isCorrectOption = opt === question.correct_answer;
                        const isSelectedOption = opt === answer.selected_answer;
                        const labels = ['A', 'B', 'C', 'D'];

                        return (
                          <div
                            key={j}
                            className={`flex items-center gap-4 p-4 rounded-xl text-sm font-bold transition-all shadow-sm ${
                              isCorrectOption
                                ? 'bg-emerald-50 border-2 border-emerald-500 text-slate-900 shadow-emerald-500/10'
                                : isSelectedOption && !answer.is_correct
                                ? 'bg-red-50 border-2 border-red-500 text-slate-900 shadow-red-500/10'
                                : 'bg-white border-2 border-slate-100 text-slate-600'
                            }`}
                          >
                            <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black shadow-inner ${
                              isCorrectOption
                                ? 'bg-emerald-600 text-white'
                                : isSelectedOption && !answer.is_correct
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-100 text-slate-400'
                            }`}>
                              {labels[j]}
                            </span>
                            <span className="flex-1 text-base">{opt}</span>
                            {isCorrectOption && (
                              <div className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">Correct Choice</div>
                            )}
                            {isSelectedOption && !answer.is_correct && (
                              <div className="bg-red-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">Your Choice</div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {question.explanation && (
                      <div className="mt-6 p-5 rounded-2xl bg-white border border-indigo-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />
                        <div className="flex items-center gap-3 text-sm font-black text-indigo-600 uppercase tracking-[0.2em] mb-3">
                          <BookOpen size={16} />
                          Detailed Explanation
                        </div>
                        <p className="text-base text-slate-600 font-medium leading-relaxed">
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {unanswered > 0 && (
          <div className="mt-8 glass-card p-6 text-center text-base font-bold text-amber-600 bg-amber-50 border-amber-200 animate-pulse">
            ⚠️ Attention: {unanswered} question(s) were left unanswered during this session.
          </div>
        )}
      </main>
    </>
  );
}
