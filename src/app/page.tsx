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

        {/* Testimonials */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Trusted by Aspirants</h2>
            <p className="text-slate-400 max-w-xl mx-auto">See what candidates are saying about their experience with RRB Prep.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Rahul Sharma",
                role: "RRB NTPC Aspirant",
                quote: "The mock tests are incredibly realistic. The persistent timer helped me manage my time better during the actual exam.",
                avatar: "RS"
              },
              {
                name: "Priya Patel",
                role: "Group D Candidate",
                quote: "I love the topic-wise quizzes. They allowed me to focus on my weak areas in Arithmetic and Reasoning effectively.",
                avatar: "PP"
              },
              {
                name: "Amit Kumar",
                role: "ALP Applicant",
                quote: "The real-time leaderboard kept me motivated. Seeing my rank improve every week gave me the confidence I needed.",
                avatar: "AK"
              }
            ].map((t, i) => (
              <div key={i} className="glass-card p-8 relative hover:border-indigo-500/50 transition-colors">
                <div className="text-indigo-400 mb-6 font-serif text-5xl opacity-20 absolute top-4 left-4">"</div>
                <p className="text-slate-300 italic mb-8 relative z-10 leading-relaxed">{t.quote}</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-600/20 flex items-center justify-center font-bold text-indigo-400 border border-indigo-500/20">
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200">{t.name}</h4>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mt-32 glass-card p-8 sm:p-16 border-indigo-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black mb-6 tracking-tight">Your Success is Our <span className="text-indigo-400">Mission</span></h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                We've built a platform that removes the guesswork from preparation. With our atomic submission system and detailed analytics, you'll always know where you stand.
              </p>
              <ul className="space-y-4">
                {[
                  "90,000+ Question Bank",
                  "Real-time Accuracy Tracking",
                  "Daily Streak & Motivation",
                  "Mobile-First Experience"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-200 font-bold">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <ArrowRight size={14} className="text-emerald-500" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="glass-card p-6 bg-indigo-500/5 border-indigo-500/10">
                  <BarChart3 className="text-indigo-400 mb-3" size={32} />
                  <h4 className="font-bold mb-1">Analytics</h4>
                  <p className="text-xs text-slate-500">Deep performance insights</p>
                </div>
                <div className="glass-card p-6 bg-purple-500/5 border-purple-500/10">
                  <Target className="text-purple-400 mb-3" size={32} />
                  <h4 className="font-bold mb-1">Precision</h4>
                  <p className="text-xs text-slate-500">Exact exam simulation</p>
                </div>
              </div>
              <div className="space-y-4 sm:space-y-6 mt-8">
                <div className="glass-card p-6 bg-emerald-500/5 border-emerald-500/10">
                  <Trophy className="text-emerald-400 mb-3" size={32} />
                  <h4 className="font-bold mb-1">Ranking</h4>
                  <p className="text-xs text-slate-500">Compete with the best</p>
                </div>
                <div className="glass-card p-6 bg-amber-500/5 border-amber-500/10">
                  <Zap className="text-amber-400 mb-3" size={32} />
                  <h4 className="font-bold mb-1">Speed</h4>
                  <p className="text-xs text-slate-500">Fast-paced drill sessions</p>
                </div>
              </div>
            </div>
          </div>
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
