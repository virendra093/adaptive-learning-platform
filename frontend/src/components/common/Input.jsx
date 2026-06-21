import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <input
        ref={ref}
        className={`px-4 py-2 rounded-lg bg-white/50 dark:bg-surface-dark/50 border ${error ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900 dark:text-white`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error.message}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
