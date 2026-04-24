'use client';

import { useEffect, useState, useCallback, useRef, lazy, Suspense, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  startAttempt,
  saveAnswer,
  submitAttempt,
} from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  Grid3X3,
  Maximize,
  Minimize,
  X,
  AlertTriangle,
} from 'lucide-react';
import type { Question, Test, Attempt } from '@/lib/types';

const QuestionGrid = lazy(() => import('./QuestionGrid'));

interface QuizEngineProps {
  initialTest: Test;
  initialQuestions: Question[];
  userId: string;
}

export default function QuizEngine({ initialTest, initialQuestions, userId }: QuizEngineProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(initialTest.time_limit_seconds);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startedAtRef = useRef<number>(Date.now());

  // Mutations for efficiency and caching
  const saveAnswerMutation = useMutation({
    mutationFn: ({ qId, ans, correct }: { qId: string, ans: string, correct: boolean }) => 
      saveAnswer(attempt!.id, qId, ans, correct),
  });

  const submitMutation = useMutation({
    mutationFn: (data: { attemptId: string, userId: string, score: number, accuracy: number, timeTaken: number, answers: any[] }) =>
      submitAttempt(data.attemptId, data.userId, data.score, data.accuracy, data.timeTaken, data.answers),
    onSuccess: (data: any) => {
      if (attempt) localStorage.removeItem(`quiz_progress_${attempt.id}`);
      
      // Optimistic/Immediate cache update for profile stats
      if (data && !data.error) {
        queryClient.setQueryData(['profile', userId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            total_score: data.total_score,
            tests_attempted: data.tests_attempted,
            streak_count: data.streak_count,
            last_active_date: data.last_active_date,
          };
        });
      }

      queryClient.invalidateQueries({ queryKey: ['recentAttempts', userId] });
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      toast.success('Test submitted successfully!');
      router.push(`/result/${attempt!.id}`);
    },
    onError: (error: any) => {
      console.error('Submission Error Details:', error);
      toast.error(error.message || 'Submission failed. Please try again.');
    }
  });

  // 1. Initialize or Resume Attempt
  useEffect(() => {
    const init = async () => {
      try {
        const a = await startAttempt(userId, initialTest.id);
        if (a) {
          setAttempt(a);
          const started = new Date(a.started_at).getTime();
          startedAtRef.current = started;
          
          // Calculate precise remaining time from server start time
          const elapsed = Math.floor((Date.now() - started) / 1000);
          const remaining = Math.max(0, initialTest.time_limit_seconds - elapsed);
          setTimeRemaining(remaining);
          
          if (remaining <= 0 && !a.is_submitted) {
            handleAutoSubmit();
          }
        }
        setIsReady(true);
      } catch (err) {
        toast.error('Failed to initialize test');
        router.push('/dashboard');
      }
    };
    init();
  }, [userId, initialTest.id]);

  // 2. Optimized Timer Effect
  useEffect(() => {
    if (!isReady || timeRemaining <= 0 || submitMutation.isPending) return;

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startedAtRef.current) / 1000);
      const remaining = Math.max(0, initialTest.time_limit_seconds - elapsed);
      
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        handleAutoSubmit();
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isReady, initialTest.time_limit_seconds]);

  // 3. Navigation & Fullscreen Trapping
  useEffect(() => {
    if (!isReady) return;

    // Prevent Browser Back Button
    window.history.pushState(null, '', window.location.href);
    const handlePopState = (e: PopStateEvent) => {
      window.history.pushState(null, '', window.location.href);
      setShowExitConfirm(true);
    };

    // Prevent Refresh/Tab Close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    // Fullscreen Change Listener
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isReady]);

  // 4. Persistence (LocalStorage)
  useEffect(() => {
    if (!isReady || !attempt) return;
    
    const key = `quiz_progress_${attempt.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const { savedAnswers, savedIndex } = JSON.parse(saved);
        setAnswers(prev => ({ ...prev, ...savedAnswers }));
        setCurrentIndex(savedIndex);
      } catch (err) {
        console.error('Failed to load saved progress', err);
      }
    }
  }, [isReady, attempt]);

  useEffect(() => {
    if (isReady && attempt) {
      localStorage.setItem(`quiz_progress_${attempt.id}`, JSON.stringify({
        savedAnswers: answers,
        savedIndex: currentIndex
      }));
    }
  }, [answers, currentIndex, isReady, attempt]);

  const toggleFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen toggle failed', err);
    }
  };

  const handleExitTest = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    router.push('/dashboard');
  };

  const handleSubmit = useCallback(async () => {
    if (submitMutation.isPending || !attempt || !userId) {
      if (!userId) toast.error("Authentication required to submit.");
      return;
    }

    // Map all answers to match the RPC structure
    const mappedAnswers = initialQuestions.map(q => ({
      question_id: q.id,
      selected_answer: answers[q.id] || null,
      is_correct: answers[q.id] === q.correct_answer
    })).filter(a => a.selected_answer !== null); // Only send questions that were actually answered

    let score = 0;
    initialQuestions.forEach(q => {
      if (answers[q.id] === q.correct_answer) score++;
    });

    const accuracy = initialQuestions.length > 0 ? (score / initialQuestions.length) * 100 : 0;
    const timeTaken = Math.floor((Date.now() - startedAtRef.current) / 1000);

    console.log('Initiating submission...', { score, accuracy, answersCount: mappedAnswers.length });

    submitMutation.mutate({ 
      attemptId: attempt.id, 
      userId, 
      score, 
      accuracy, 
      timeTaken,
      answers: mappedAnswers
    });
  }, [answers, initialQuestions, userId, attempt, submitMutation]);

  const handleAutoSubmit = useCallback(() => {
    toast.error('Time is up! Submitting your answers...', { duration: 4000 });
    handleSubmit();
  }, [handleSubmit]);

  const handleSelectAnswer = useCallback((questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));

    if (attempt) {
      const question = initialQuestions.find((q) => q.id === questionId);
      const isCorrect = answer === question?.correct_answer;
      saveAnswerMutation.mutate({ qId: questionId, ans: answer, correct: isCorrect });
    }
  }, [attempt, initialQuestions, saveAnswerMutation]);

  const toggleFlag = useCallback((questionId: string) => {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  }, []);

  const progress = useMemo(() => {
    if (initialQuestions.length === 0) return 0;
    return (Object.keys(answers).length / initialQuestions.length) * 100;
  }, [answers.length, initialQuestions.length]);

  if (!isReady) return <LoadingSpinner message="Syncing with server..." />;
  
  if (initialQuestions.length === 0) {
    return (
      <div className="pt-32 text-center p-8">
        <h2 className="text-xl font-bold mb-2">No Questions Found</h2>
        <p className="text-slate-400 mb-4">This test doesn't have any questions yet.</p>
        <Link href="/topics" className="btn-primary">Back to Topics</Link>
      </div>
    );
  }

  const currentQuestion = initialQuestions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Optimized Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-2 sm:py-3 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setShowGrid(true)} 
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-all active:scale-95 shadow-sm"
              title="Question Grid"
            >
              <Grid3X3 size={20} />
            </button>
            <button 
              onClick={toggleFullScreen} 
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-all active:scale-95 shadow-sm"
              title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
            <button 
              onClick={() => setShowExitConfirm(true)} 
              className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 transition-all active:scale-95 shadow-sm"
              title="Exit Test"
            >
              <X size={20} />
            </button>
            <div className="min-w-0">
              <h2 className="font-black text-sm sm:text-base truncate max-w-[120px] sm:max-w-[250px] text-slate-900 tracking-tight">{initialTest.title}</h2>
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-400 font-black">
                Progress: {currentIndex + 1} / {initialQuestions.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-5">
            <div className={`flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-2xl border transition-all shadow-sm ${
              timeRemaining < 60 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}>
              <Clock size={16} className="sm:size-18" />
              <span className="font-mono font-black text-lg sm:text-xl tracking-tighter">
                {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
              </span>
            </div>
            <button 
              onClick={() => setShowConfirm(true)} 
              className="btn-primary py-2 sm:py-3 px-4 sm:px-7 shadow-lg shadow-indigo-600/20 text-xs sm:text-sm font-black uppercase tracking-widest"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? '...' : <><Send size={16} className="sm:size-18" /> <span className="hidden xs:inline">Submit</span></>}
            </button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto mt-2 sm:mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(79,70,229,0.4)]" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>

      {/* Optimized Main Content Area */}
      <main className="pt-24 sm:pt-32 pb-24 sm:pb-32 px-4 max-w-3xl mx-auto min-h-screen flex flex-col">
        <div className="animate-fadeIn flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-6 sm:mb-8">
            <span className="text-[10px] sm:text-xs font-black px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 uppercase tracking-widest border border-indigo-100 shadow-sm">
              {currentQuestion.topic}
            </span>
            <span className="text-[10px] sm:text-xs font-bold px-3 py-1 rounded-lg bg-slate-100 text-slate-500 uppercase tracking-widest border border-slate-200">
              {currentQuestion.difficulty}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-10 sm:mb-12 leading-tight text-slate-900 tracking-tight">
            {currentQuestion.question}
          </h2>

          <div className="grid gap-4 sm:gap-5">
            {(Array.isArray(currentQuestion.options) 
              ? currentQuestion.options 
              : JSON.parse(currentQuestion.options as any)).map((opt: string, i: number) => (
              <button
                key={`${currentQuestion.id}-${i}`}
                onClick={() => handleSelectAnswer(currentQuestion.id, opt)}
                className={`flex items-center gap-4 sm:gap-5 p-5 sm:p-6 rounded-2xl border-2 text-left transition-all duration-200 group active:scale-[0.98] ${
                  answers[currentQuestion.id] === opt 
                    ? 'bg-indigo-50 border-indigo-600 text-slate-900 shadow-xl shadow-indigo-600/10' 
                    : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className={`w-10 h-10 sm:w-11 sm:h-11 shrink-0 flex items-center justify-center rounded-xl text-base font-black transition-all ${
                  answers[currentQuestion.id] === opt 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                }`}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span className="font-bold text-lg sm:text-xl leading-tight">{opt}</span>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Sticky Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-5 bg-white/90 backdrop-blur-2xl border-t border-slate-200 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(prev => prev - 1)}
            className="flex-1 sm:flex-none btn-secondary h-12 sm:h-auto px-5 sm:px-10 py-3 disabled:opacity-30 disabled:cursor-not-allowed text-sm sm:text-base font-black uppercase tracking-widest active:scale-95"
          >
            <ChevronLeft size={22} /> <span className="hidden xs:inline">Prev</span><span className="hidden sm:inline">ious</span>
          </button>

          <button 
            onClick={() => toggleFlag(currentQuestion.id)} 
            className={`p-3 sm:p-4 rounded-2xl transition-all duration-300 active:scale-90 shadow-sm border ${
              flagged.has(currentQuestion.id) 
                ? 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/30' 
                : 'bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-slate-200'
            }`}
            title="Flag for review"
          >
            <Flag className="w-5 h-5 sm:w-6 sm:h-6" fill={flagged.has(currentQuestion.id) ? 'currentColor' : 'none'} />
          </button>

          {currentIndex === initialQuestions.length - 1 ? (
             <button 
              onClick={() => setShowConfirm(true)} 
              className="flex-1 sm:flex-none btn-success h-12 sm:h-auto px-5 sm:px-10 py-3 shadow-lg shadow-emerald-600/20 text-sm sm:text-base font-black uppercase tracking-widest active:scale-95"
             >
               Finish Test
             </button>
          ) : (
            <button 
              onClick={() => setCurrentIndex(prev => prev + 1)} 
              className="flex-1 sm:flex-none btn-primary h-12 sm:h-auto px-5 sm:px-10 py-3 shadow-lg shadow-indigo-600/20 text-sm sm:text-base font-black uppercase tracking-widest active:scale-95"
            >
              Next <ChevronRight size={22} />
            </button>
          )}
        </div>
      </div>

      {/* Lazy Overlays */}
      <Suspense fallback={null}>
        {showGrid && (
          <QuestionGrid 
            questions={initialQuestions} 
            currentIndex={currentIndex} 
            answers={answers} 
            flagged={flagged}
            onSelect={(i) => { setCurrentIndex(i); setShowGrid(false); }}
            onClose={() => setShowGrid(false)}
          />
        )}
      </Suspense>

      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-card p-8 max-w-md w-full border-white/20">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Send size={32} className="text-indigo-400" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-center">Ready to Submit?</h3>
            <p className="text-slate-400 mb-8 text-center leading-relaxed">
              You have answered <span className="text-white font-bold">{answeredCount}</span> out of <span className="text-white font-bold">{initialQuestions.length}</span> questions.
              {answeredCount < initialQuestions.length && <br />}
              {answeredCount < initialQuestions.length && <span className="text-amber-400 text-sm font-semibold">⚠️ You still have unanswered questions!</span>}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowConfirm(false)} 
                className="btn-secondary flex-1 py-3"
                disabled={submitMutation.isPending}
              >
                Back to Review
              </button>
              <button 
                onClick={handleSubmit} 
                className="btn-primary flex-1 py-3"
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? 'Submitting...' : 'Confirm Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showExitConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-card p-8 max-w-md w-full border-red-500/20">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <AlertTriangle size={32} className="text-red-400" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-center text-red-400">Exit Test?</h3>
            <p className="text-slate-400 mb-8 text-center leading-relaxed">
              Are you sure you want to leave? Your current progress is saved, but the timer will continue to run on the server.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowExitConfirm(false)} 
                className="btn-secondary flex-1 py-3"
              >
                Stay in Test
              </button>
              <button 
                onClick={handleExitTest} 
                className="btn-danger flex-1 py-3"
              >
                Confirm Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
