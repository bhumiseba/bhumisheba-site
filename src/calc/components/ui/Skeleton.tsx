import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`
        animate-pulse rounded-md
        bg-[var(--bg-surface-subtle)]
        ${className}
      `}
      aria-hidden="true"
    />
  );
};

export const SkeletonRow: React.FC = () => (
  <div className="flex items-center gap-3 py-3">
    <Skeleton className="h-4 w-4 rounded-full" />
    <Skeleton className="h-4 flex-1" />
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-4 w-16" />
  </div>
);