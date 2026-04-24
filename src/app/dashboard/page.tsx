'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { getProfile, getRecentAttempts } from '@/lib/api';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import Skeleton, { StatCardSkeleton, ListSkeleton } from '@/components/Skeleton';
import {
  Flame,
  Trophy,
  Target,
  ClipboardList,
  ArrowRight,
  BookOpen,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => getProfile(user!.id),
    enabled: !!user,
  });

  const { data: recentAttempts, isLoading: attemptsLoading } = useQuery({
    queryKey: ['recentAttempts', user?.id],
    queryFn: () => getRecentAttempts(user!.id),
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="pt-20"><LoadingSpinner message="Authenticating..." /></div>
      </>
    );
  }

  const stats = [
    {
      icon: Flame,
      label: 'Day Streak',
      value: profile?.streak_count ?? 0,
      color: 'from-orange-500 to-amber-500',
      suffix: profile?.streak_count === 1 ? 'day' : 'days',
    },
    {
      icon: Trophy,
      label: 'Total Score',
      value: profile?.total_score ?? 0,
      color: 'from-indigo-500 to-purple-500',
      suffix: 'pts',
    },
    {
      icon: ClipboardList,
      label: 'Tests Taken',
      value: profile?.tests_attempted ?? 0,
      color: 'from-emerald-500 to-teal-500',
      suffix: '',
    },
    {
      icon: Target,
      label: 'Accuracy',
      value: recentAttempts && recentAttempts.length > 0
        ? Math.round(recentAttempts.reduce((sum, a) => sum + a.accuracy, 0) / recentAttempts.length)
        : 0,
      color: 'from-pink-500 to-rose-500',
      suffix: '%',
    },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-24 sm:pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Welcome */}
        <div className="mb-10 animate-fadeIn">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 text-slate-900 tracking-tight">
            Welcome back, <span className="text-indigo-600">{profile?.name || user?.email?.split('@')[0]}</span> 👋
          </h1>
          <p className="text-slate-500 text-base sm:text-lg font-medium">Let&apos;s continue your preparation journey and crush your goals.</p>
        </div>

        {/* Stats Grid */}
        {profileLoading ? (
          <StatCardSkeleton />
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 stagger-children">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card group hover:shadow-xl transition-shadow border-slate-200">
                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg shadow-black/10`}>
                    <stat.icon size={22} className="text-white" />
                  </div>
                  <span className="text-xs sm:text-sm text-slate-400 font-black uppercase tracking-widest">{stat.label}</span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">
                  {stat.value}
                  {stat.suffix && <span className="text-sm sm:text-base text-slate-400 font-bold ml-2 uppercase">{stat.suffix}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8 mb-12">
          <Link href="/topics" className="glass-card p-6 sm:p-10 flex items-center gap-6 group relative overflow-hidden bg-white border-slate-200 hover:border-indigo-200">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full -mr-24 -mt-24 transition-transform group-hover:scale-110" />
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-indigo-600 flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110 shadow-2xl shadow-indigo-600/20 relative z-10">
              <BookOpen size={32} className="text-white" />
            </div>
            <div className="flex-1 min-w-0 relative z-10">
              <h3 className="font-black text-xl sm:text-2xl mb-2 text-slate-900">Topic Quizzes</h3>
              <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">Master specific subjects with curated practice tests on core topics.</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all flex-shrink-0">
              <ArrowRight size={24} className="transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link href="/mock-test" className="glass-card p-6 sm:p-10 flex items-center gap-6 group relative overflow-hidden bg-white border-slate-200 hover:border-purple-200">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-50 rounded-full -mr-24 -mt-24 transition-transform group-hover:scale-110" />
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-purple-600 flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110 shadow-2xl shadow-purple-600/20 relative z-10">
              <FileText size={32} className="text-white" />
            </div>
            <div className="flex-1 min-w-0 relative z-10">
              <h3 className="font-black text-xl sm:text-2xl mb-2 text-slate-900">Full Mock Test</h3>
              <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">Challenge yourself with a timed exam simulating real conditions.</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all flex-shrink-0">
              <ArrowRight size={24} className="transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>

        {/* Recent Attempts */}
        <div className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black flex items-center gap-3 text-slate-900">
              <TrendingUp size={24} className="text-indigo-600" />
              Recent Progress
            </h2>
          </div>

          {attemptsLoading ? (
            <ListSkeleton />
          ) : !recentAttempts || recentAttempts.length === 0 ? (
            <div className="glass-card p-12 text-center bg-white border-slate-200">
              <ClipboardList size={56} className="text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 text-lg font-bold mb-6">No attempts yet. Ready to start?</p>
              <Link href="/topics" className="btn-primary inline-flex">
                Take Your First Test <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentAttempts.map((attempt) => (
                <Link
                  key={attempt.id}
                  href={`/result/${attempt.id}`}
                  className="glass-card p-5 sm:p-6 flex items-center gap-5 group bg-white border-slate-200 hover:border-indigo-300"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${attempt.accuracy >= 70
                      ? 'bg-emerald-50 text-emerald-600'
                      : attempt.accuracy >= 40
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-red-50 text-red-600'
                    }`}>
                    {attempt.accuracy >= 70 ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors truncate">
                      {(attempt.test as unknown as { title: string })?.title || 'Comprehensive Test'}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><Target size={14} /> {Math.round(attempt.accuracy)}% Accuracy</span>
                      <span className="hidden sm:inline">·</span>
                      <span className="flex items-center gap-1.5"><Clock size={14} /> {Math.floor(attempt.time_taken / 60)}m {attempt.time_taken % 60}s</span>
                      <span className="hidden sm:inline">·</span>
                      <span>Score: {attempt.score}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                    <ArrowRight size={18} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
