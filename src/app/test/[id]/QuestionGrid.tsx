'use client';

import { X } from 'lucide-react';
import type { Question } from '@/lib/types';

interface QuestionGridProps {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, string>;
  flagged: Set<string>;
  onSelect: (index: number) => void;
  onClose: () => void;
}

export default function QuestionGrid({ 
  questions, 
  currentIndex, 
  answers, 
  flagged, 
  onSelect, 
  onClose 
}: QuestionGridProps) {
  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-md flex justify-end">
      <div className="w-full sm:max-w-md bg-white border-l border-slate-200 p-6 sm:p-10 shadow-2xl animate-slideIn flex flex-col h-full">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Test Navigator</h3>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Jump to question</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 transition-all active:scale-90 shadow-sm"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-5 xs:grid-cols-6 sm:grid-cols-5 gap-3 sm:gap-4">
            {questions.map((q, i) => {
              const isAnswered = !!answers[q.id];
              const isFlagged = flagged.has(q.id);
              const isCurrent = i === currentIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => onSelect(i)}
                  className={`aspect-square rounded-2xl text-base sm:text-lg font-black flex items-center justify-center border-2 transition-all active:scale-90
                    ${isCurrent ? 'border-indigo-600 bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 
                      isAnswered ? 'border-emerald-200 bg-emerald-50 text-emerald-600' :
                      isFlagged ? 'border-amber-200 bg-amber-50 text-amber-600' :
                      'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300 hover:text-slate-600'}
                  `}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-100 space-y-4">
           <div className="flex items-center gap-4 text-xs font-black text-slate-400 uppercase tracking-widest">
             <div className="w-5 h-5 rounded-lg bg-indigo-600 shadow-md shadow-indigo-600/20" /> Current
           </div>
           <div className="flex items-center gap-4 text-xs font-black text-slate-400 uppercase tracking-widest">
             <div className="w-5 h-5 rounded-lg bg-emerald-50 border border-emerald-200 shadow-sm" /> Answered
           </div>
           <div className="flex items-center gap-4 text-xs font-black text-slate-400 uppercase tracking-widest">
             <div className="w-5 h-5 rounded-lg bg-amber-50 border border-amber-200 shadow-sm" /> Flagged
           </div>
           <div className="flex items-center gap-4 text-xs font-black text-slate-400 uppercase tracking-widest">
             <div className="w-5 h-5 rounded-lg bg-slate-50 border border-slate-100 shadow-sm" /> Not Visited
           </div>
        </div>
      </div>
    </div>
  );
}
