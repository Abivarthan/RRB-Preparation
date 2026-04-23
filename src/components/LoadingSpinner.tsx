'use client';

export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="spinner" />
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  );
}
