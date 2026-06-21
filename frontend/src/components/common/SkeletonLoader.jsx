import React from 'react';

const SkeletonLoader = ({ count = 1, className = "" }) => {
  return (
    <div className="space-y-4 animate-pulse w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className={`bg-slate-200 dark:bg-slate-800 rounded-xl ${className}`} 
        />
      ))}
    </div>
  );
};

export default React.memo(SkeletonLoader);
