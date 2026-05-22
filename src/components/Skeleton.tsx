import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-md ${className}`}
        />
      ))}
    </>
  );
};

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900/40 border-2 border-slate-100 dark:border-slate-800/60 rounded-3xl p-6 space-y-4">
    <div className="flex items-start space-x-4">
      <Skeleton className="w-12 h-12 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-20 w-full rounded-xl" />
    <div className="flex justify-between items-center pt-4">
      <Skeleton className="h-8 w-24 rounded-xl" />
      <Skeleton className="h-8 w-24 rounded-xl" />
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <div className="flex items-center space-x-4 p-4 border-b border-slate-100 dark:border-slate-800/60">
    <Skeleton className="w-8 h-8 rounded-full" />
    <Skeleton className="h-4 flex-1" />
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-4 w-16" />
  </div>
);
