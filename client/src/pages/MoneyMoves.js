import React from 'react';
import { motion } from 'framer-motion';

const MoneyMoves = () => {
  return (
    <div className="min-h-screen bg-gradient-cyber p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-4xl font-gaming font-bold text-white mb-4">
            <span className="text-gradient">MoneyMoves</span> 💰
          </h1>
          <p className="text-gray-300 font-cyber mb-8">Gamified budgeting quests with treasure map UI</p>
          
          <div className="cyber-card max-w-2xl mx-auto">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-gaming text-white mb-4">Coming Soon!</h2>
            <p className="text-gray-300 leading-relaxed">
              MoneyMoves will gamify budgeting with treasure maps, branching quest paths, 
              and financial literacy challenges. Learn money management while having fun 
              and earning rewards for smart financial decisions!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MoneyMoves;