import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/30',
    secondary: 'bg-slate-800/50 hover:bg-slate-800 text-white border border-white/10 dark:bg-surface-dark/50 dark:hover:bg-surface-dark',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500/10'
  };

  return (
    <motion.button
      type={type}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
};

export default React.memo(Button);
