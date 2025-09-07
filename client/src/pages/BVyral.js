import React from 'react';
import { motion } from 'framer-motion';

const BVyral = () => {
  return (
    <div className="min-h-screen bg-gradient-cyber p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-4xl font-gaming font-bold text-white mb-4">
            <span className="text-gradient">B-Vyral</span> 🎨
          </h1>
          <p className="text-gray-300 font-cyber mb-8">Creative hub feed where teens share art, music, and projects</p>
          
          <div className="cyber-card max-w-2xl mx-auto">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-gaming text-white mb-4">Coming Soon!</h2>
            <p className="text-gray-300 leading-relaxed">
              B-Vyral will be your creative showcase with hover overlays for likes and comments, 
              safe moderation, and a supportive community. Share your art, music, writing, 
              coding projects, and get inspired by other young creators!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BVyral;