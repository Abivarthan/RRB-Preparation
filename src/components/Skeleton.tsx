'use client';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export default function Skeleton({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className={`animate-pulse bg-slate-200 rounded-xl ${className}`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </>
  );
}

export function TopicCardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Skeleton count={6} className="h-64" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
      <Skeleton count={4} className="h-32 sm:h-40" />
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton count={5} className="h-16 w-full" />
    </div>
  );
}
