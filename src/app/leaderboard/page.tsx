'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLeaderboard } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  Trophy,
  Medal,
  Crown,
  Target,
  ClipboardList,
  TrendingUp,
  User,
} from 'lucide-react';

export default function LeaderboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { user } = useAuth();

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => getLeaderboard(50),
  });

  if (!mounted || isLoading) {
    return (
      <>
        <Navbar />
        <div className="pt-16"><LoadingSpinner message="Loading leaderboard..." /></div>
      </>
    );
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={20} className="rank-gold" />;
    if (rank === 2) return <Medal size={20} className="rank-silver" />;
    if (rank === 3) return <Medal size={20} className="rank-bronze" />;
    return <span className="text-sm font-bold text-slate-400">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-amber-50 border-amber-200 shadow-lg shadow-amber-500/10';
    if (rank === 2) return 'bg-slate-50 border-slate-200 shadow-md shadow-slate-400/10';
    if (rank === 3) return 'bg-orange-50 border-orange-200 shadow-md shadow-orange-500/10';
    return 'bg-white border-slate-100';
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 px-4 max-w-3xl mx-auto">
        <div className="mb-10 animate-fadeIn text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black mb-2 flex items-center justify-center sm:justify-start gap-4 text-slate-900">
            <Trophy size={36} className="text-amber-500 fill-amber-500/10" />
            Hall of <span className="text-indigo-600">Fame</span>
          </h1>
          <p className="text-slate-500 text-base sm:text-lg font-medium">Recognizing the elite performers in the RRB community.</p>
        </div>

        {/* Podium Section */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end mb-16 px-2 sm:px-0">
          {/* 2nd place */}
          <div className="flex flex-col items-center animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            {leaderboard?.[1] && (
              <>
                <div className="relative mb-4 group">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-4 border-slate-200 p-1 bg-white shadow-xl overflow-hidden">
                    <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <User size={32} />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-1 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-200 border-4 border-white flex items-center justify-center text-slate-600 font-black text-xs sm:text-sm shadow-md">
                    2
                  </div>
                </div>
                <div className="w-full h-24 sm:h-32 bg-amber-400 rounded-t-2xl flex flex-col items-center justify-center p-2 shadow-inner border-x border-t border-amber-500/20">
                  <span className="text-[10px] sm:text-xs font-black text-amber-900/40 uppercase tracking-widest truncate max-w-full">{leaderboard[1].name}</span>
                  <span className="text-xl sm:text-3xl font-black text-amber-950 tracking-tighter">{leaderboard[1].total_score}</span>
                </div>
              </>
            )}
          </div>

          {/* 1st place */}
          <div className="flex flex-col items-center animate-fadeInUp z-10" style={{ animationDelay: '0s' }}>
            {leaderboard?.[0] && (
              <>
                <div className="relative mb-6 group scale-110">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-amber-400 drop-shadow-lg animate-bounce">
                    <Crown size={40} className="fill-current" />
                  </div>
                  <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full border-4 border-indigo-200 p-1 bg-white shadow-2xl overflow-hidden ring-4 ring-amber-400/30">
                    <div className="w-full h-full rounded-full bg-indigo-50 flex items-center justify-center text-indigo-400">
                      <User size={48} />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-1 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-indigo-600 border-4 border-white flex items-center justify-center text-white font-black text-base sm:text-xl shadow-lg">
                    1
                  </div>
                </div>
                <div className="w-full h-32 sm:h-48 bg-indigo-600 rounded-t-2xl flex flex-col items-center justify-center p-2 shadow-2xl border-x border-t border-indigo-700">
                  <span className="text-[10px] sm:text-sm font-black text-white/50 uppercase tracking-widest truncate max-w-full mb-1">{leaderboard[0].name}</span>
                  <span className="text-3xl sm:text-5xl font-black text-white tracking-tighter drop-shadow-sm">{leaderboard[0].total_score}</span>
                </div>
              </>
            )}
          </div>

          {/* 3rd place */}
          <div className="flex flex-col items-center animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            {leaderboard?.[2] && (
              <>
                <div className="relative mb-4 group">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-4 border-orange-200 p-1 bg-white shadow-xl overflow-hidden">
                    <div className="w-full h-full rounded-full bg-orange-50 flex items-center justify-center text-orange-400">
                      <User size={32} />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-1 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-500 border-4 border-white flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-md">
                    3
                  </div>
                </div>
                <div className="w-full h-16 sm:h-24 bg-orange-500 rounded-t-2xl flex flex-col items-center justify-center p-2 shadow-inner border-x border-t border-orange-600/20">
                  <span className="text-[10px] sm:text-xs font-black text-white/40 uppercase tracking-widest truncate max-w-full">{leaderboard[2].name}</span>
                  <span className="text-xl sm:text-3xl font-black text-white tracking-tighter">{leaderboard[2].total_score}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Full List */}
        <div className="space-y-3 stagger-children">
          {/* Header */}
          <div className="flex items-center gap-4 px-6 py-3 text-[10px] sm:text-xs text-slate-400 font-black uppercase tracking-[0.2em] bg-slate-50/50 rounded-xl border border-slate-100">
            <div className="w-12 text-center">Rank</div>
            <div className="flex-1">Challenger</div>
            <div className="w-20 text-center hidden sm:block">Tests</div>
            <div className="w-20 text-center hidden sm:block">Accuracy</div>
            <div className="w-24 text-right">Score</div>
          </div>

          {!leaderboard || leaderboard.length <= 3 ? (
            <div className="glass-card p-12 text-center bg-white border-slate-200">
              <TrendingUp size={64} className="text-slate-100 mx-auto mb-4" />
              <p className="text-slate-400 font-bold text-lg text-balance">The battle for the top ranks continues!</p>
            </div>
          ) : (
            leaderboard.slice(3).map((entry) => {
              const isCurrentUser = entry.user_id === user?.id;

              return (
                <div
                  key={entry.user_id}
                  className={`glass-card flex items-center gap-4 px-6 py-4.5 border transition-all hover:scale-[1.01] ${getRankBg(entry.rank)} ${
                    isCurrentUser ? 'ring-2 ring-indigo-500 shadow-xl shadow-indigo-500/10 border-indigo-200 z-10 relative' : ''
                  }`}
                >
                  <div className="w-12 flex items-center justify-center flex-shrink-0">
                    {getRankIcon(entry.rank)}
                  </div>

                  <div className="flex-1 min-w-0 flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-base font-black shadow-inner ${
                      isCurrentUser
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {entry.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <span className="font-black text-slate-900 text-base truncate block tracking-tight">
                        {entry.name}
                        {isCurrentUser && (
                          <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-lg ml-2 uppercase font-black tracking-widest">You</span>
                        )}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest sm:hidden mt-1">
                        <span>{entry.tests_attempted} Tests</span>
                        <span>·</span>
                        <span className="text-indigo-500">{Math.round(entry.avg_accuracy || 0)}% ACC</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-20 text-center hidden sm:flex flex-col items-center justify-center gap-0.5 text-slate-900">
                    <span className="text-sm font-black tracking-tighter">{entry.tests_attempted}</span>
                    <span className="text-[10px] font-black text-slate-300 uppercase">Tests</span>
                  </div>

                  <div className="w-20 text-center hidden sm:flex flex-col items-center justify-center gap-0.5 text-slate-900">
                    <span className="text-sm font-black tracking-tighter">{Math.round(entry.avg_accuracy || 0)}%</span>
                    <span className="text-[10px] font-black text-slate-300 uppercase">Accuracy</span>
                  </div>

                  <div className="w-24 text-right">
                    <span className="text-2xl font-black text-slate-900 tracking-tighter">{entry.total_score}</span>
                    <span className="text-[10px] font-black text-slate-400 ml-1 uppercase">pts</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </>
  );
}
