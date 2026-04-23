'use client';

import Link from 'next/link';
import { GraduationCap, BookOpen, Timer, Trophy, ArrowRight, Zap, Target, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]" />

        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-32 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-sm font-medium mb-8 animate-fadeIn">
            <Zap size={14} />
            Railway Recruitment Board Exam Prep
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            Ace Your{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              RRB Exam
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            Practice with topic-wise quizzes, full mock tests, smart timers, and real-time 
            leaderboards. Track your progress and build winning streaks.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <Link href="/login" className="btn-primary text-lg px-8 py-3.5">
              Start Preparing <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="btn-secondary text-lg px-8 py-3.5">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Everything You Need to Succeed</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            A comprehensive platform built specifically for RRB exam aspirants
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
          {[
            {
              icon: BookOpen,
              title: 'Topic Quizzes',
              desc: 'Practice Arithmetic, Reasoning, and GK with focused topic tests.',
              color: 'from-indigo-500 to-blue-500',
            },
            {
              icon: Target,
              title: 'Mock Tests',
              desc: '50-question full mock exams with 60-minute timer, just like the real exam.',
              color: 'from-purple-500 to-pink-500',
            },
            {
              icon: Timer,
              title: 'Smart Timer',
              desc: 'Persistent timer that survives page refreshes. Auto-submits when time is up.',
              color: 'from-amber-500 to-orange-500',
            },
            {
              icon: Trophy,
              title: 'Leaderboard',
              desc: 'Compete with fellow aspirants. Track your rank and accuracy.',
              color: 'from-emerald-500 to-teal-500',
            },
          ].map((feature, i) => (
            <div key={i} className="glass-card p-6 group">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                <feature.icon size={22} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '50+', label: 'Questions' },
            { value: '3', label: 'Topics' },
            { value: '60m', label: 'Mock Timer' },
            { value: '∞', label: 'Practice' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6">
              <div className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-24 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-bold">RRB <span className="text-indigo-400">Prep</span></span>
          </div>
          <p className="text-sm text-slate-500">
            © 2026 RRB Prep. Built for serious aspirants.
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <BarChart3 size={14} className="text-slate-500" />
            <span className="text-xs text-slate-500">Powered by Supabase + Next.js</span>
          </div>
        </div>
      </div>
    </div>
  );
}
