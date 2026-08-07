import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
}

export const ShippingLoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-slate-100 rounded-2xl p-4 space-y-3 ${className}`}>
      <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
      <div className="h-9 bg-slate-200 rounded-xl w-full"></div>
      <div className="grid grid-cols-2 gap-2 pt-2">
        <div className="h-12 bg-slate-200 rounded-xl"></div>
        <div className="h-12 bg-slate-200 rounded-xl"></div>
      </div>
    </div>
  );
};
