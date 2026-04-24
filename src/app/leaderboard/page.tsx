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

            {/* 2nd place */}
            {leaderboard?.[1] && (
              <div className="glass-card p-4 sm:p-7 text-center relative overflow-hidden group hover:scale-105 transition-all bg-white border-slate-200">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 border-4 border-white shadow-lg">
                  <User size={24} className="text-slate-400" />
                </div>
                <Medal size={20} className="rank-silver mx-auto mb-2 drop-shadow-md" />
                <h3 className="font-black text-[10px] sm:text-sm truncate text-slate-800 uppercase tracking-wider">{leaderboard?.[1].name}</h3>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{leaderboard?.[1].total_score}</p>
                <p className="text-[9px] sm:text-xs text-slate-400 font-bold uppercase mt-1">{leaderboard?.[1].tests_attempted} tests</p>
              </div>
            )}

            {/* 1st place */}
            {leaderboard?.[0] && (
              <div className="glass-card p-6 sm:p-10 text-center border-amber-300 relative overflow-hidden group hover:scale-110 transition-all bg-amber-50 shadow-2xl shadow-amber-500/10 z-10">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400" />
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-4 border-4 border-amber-200 shadow-xl">
                  <User size={32} className="text-amber-500" />
                </div>
                <Crown size={28} className="rank-gold mx-auto mb-2 drop-shadow-md" />
                <h3 className="font-black text-xs sm:text-lg truncate text-slate-900 uppercase tracking-widest">{leaderboard?.[0].name}</h3>
                <p className="text-2xl sm:text-4xl font-black text-amber-600 mt-1">{leaderboard?.[0].total_score}</p>
                <p className="text-xs sm:text-sm text-amber-700/60 font-black uppercase tracking-widest mt-1">{leaderboard?.[0].tests_attempted} tests</p>
              </div>
            )}

            {/* 3rd place */}
            {leaderboard?.[2] && (
              <div className="glass-card p-4 sm:p-7 text-center relative overflow-hidden group hover:scale-105 transition-all bg-white border-slate-200">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-3 border-4 border-white shadow-lg">
                  <User size={24} className="text-orange-400" />
                </div>
                <Medal size={20} className="rank-bronze mx-auto mb-2 drop-shadow-md" />
                <h3 className="font-black text-[10px] sm:text-sm truncate text-slate-800 uppercase tracking-wider">{leaderboard?.[2].name}</h3>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{leaderboard?.[2].total_score}</p>
                <p className="text-[9px] sm:text-xs text-slate-400 font-bold uppercase mt-1">{leaderboard?.[2].tests_attempted} tests</p>
              </div>
            )}

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

          {!leaderboard || leaderboard.length === 0 ? (
            <div className="glass-card p-12 text-center bg-white border-slate-200">
              <TrendingUp size={64} className="text-slate-100 mx-auto mb-4" />
              <p className="text-slate-400 font-bold text-lg">The arena is empty. Be the first to claim your rank!</p>
            </div>
          ) : (
            leaderboard.map((entry) => {
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
