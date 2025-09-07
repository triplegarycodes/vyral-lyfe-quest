import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'medium', color = 'cyber-cyan', text }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.div
        className={`${sizeClasses[size]} border-2 border-transparent rounded-full`}
        style={{
          borderTopColor: color === 'cyber-cyan' ? '#00ffff' : 
                          color === 'cyber-purple' ? '#8b5cf6' :
                          color === 'electric-blue' ? '#0ea5e9' :
                          color === 'glitch-green' ? '#00ff41' : '#00ffff',
          borderRightColor: 'rgba(255, 255, 255, 0.1)',
          borderBottomColor: 'rgba(255, 255, 255, 0.1)',
          borderLeftColor: 'rgba(255, 255, 255, 0.1)',
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      
      {text && (
        <motion.p 
          className={`${textSizes[size]} text-white font-cyber text-center`}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        >
          {text}
          <span className="loading-dots"></span>
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;