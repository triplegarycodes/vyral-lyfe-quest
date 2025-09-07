import React from 'react';
import { motion } from 'framer-motion';

const VybeZone = () => {
  return (
    <div className="min-h-screen bg-gradient-cyber p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-4xl font-gaming font-bold text-white mb-4">
            <span className="text-gradient">VybeZone</span> 🤝
          </h1>
          <p className="text-gray-300 font-cyber mb-8">Connect with mentors and peers in your growth journey</p>
          
          <div className="cyber-card max-w-2xl mx-auto">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-gaming text-white mb-4">Coming Soon!</h2>
            <p className="text-gray-300 leading-relaxed">
              VybeZone will be your peer mentorship hub with avatar circles, real-time chat, 
              and a safe space to connect with others on similar journeys. Find mentors, 
              become one yourself, and build meaningful relationships!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VybeZone;