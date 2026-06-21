import { motion } from 'framer-motion';
import React from 'react';

const GlassCard = ({ children, className = '', animate = true }) => {
  const Component = animate ? motion.div : 'div';
  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  } : {};

  return (
    <Component
      {...animationProps}
      className={`glass-card ${className}`}
    >
      {children}
    </Component>
  );
};

export default React.memo(GlassCard);
