import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapIcon,
  PlusIcon,
  BanknotesIcon,
  ChartBarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const MoneyMoves = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBudget, setNewBudget] = useState({
    name: '',
    totalAmount: '',
    category: 'entertainment',
    period: 'monthly'
  });

  const categories = [
    { value: 'entertainment', label: 'Entertainment', icon: '🎮', color: 'cyber-cyan' },
    { value: 'food', label: 'Food & Dining', icon: '🍕', color: 'cyber-purple' },
    { value: 'shopping', label: 'Shopping', icon: '🛍️', color: 'electric-blue' },
    { value: 'transport', label: 'Transport', icon: '🚗', color: 'glitch-green' },
    { value: 'education', label: 'Education', icon: '📚', color: 'neon-pink' },
    { value: 'savings', label: 'Savings Goal', icon: '💎', color: 'yellow-400' }
  ];

  useEffect(() => {
    // Mock data for demonstration
    setBudgets([
      {
        id: 1,
        name: 'Gaming & Entertainment',
        totalAmount: 200,
        spentAmount: 85,
        category: 'entertainment',
        period: 'monthly',
        questCompleted: false,
        milestones: [
          { name: 'Track expenses for 1 week', completed: true },
          { name: 'Stay under 50% budget', completed: true },
          { name: 'Find 3 money-saving tips', completed: false },
          { name: 'Complete monthly goal', completed: false }
        ]
      },
      {
        id: 2,
        name: 'College Fund Quest',
        totalAmount: 500,
        spentAmount: 150,
        category: 'savings',
        period: 'monthly',
        questCompleted: false,
        milestones: [
          { name: 'Set savings target', completed: true },
          { name: 'Save first $100', completed: true },
          { name: 'Learn about compound interest', completed: true },
          { name: 'Reach monthly goal', completed: false }
        ]
      }
    ]);
  }, []);

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    
    if (!newBudget.name || !newBudget.totalAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const budget = {
      id: Date.now(),
      ...newBudget,
      totalAmount: parseFloat(newBudget.totalAmount),
      spentAmount: 0,
      questCompleted: false,
      milestones: [
        { name: 'Track expenses for 1 week', completed: false },
        { name: 'Stay under 75% budget', completed: false },
        { name: 'Find money-saving opportunities', completed: false },
        { name: 'Complete budget goal', completed: false }
      ]
    };

    setBudgets([budget, ...budgets]);
    setShowCreateModal(false);
    setNewBudget({
      name: '',
      totalAmount: '',
      category: 'entertainment',
      period: 'monthly'
    });
    
    toast.success('🗺️ New money quest created!');
  };

  const getCategoryData = (category) => {
    return categories.find(c => c.value === category) || categories[0];
  };

  const getProgressPercentage = (budget) => {
    return Math.min((budget.spentAmount / budget.totalAmount) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-cyber p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-gaming font-bold text-white mb-4">
            <span className="text-gradient">MoneyMoves</span> 💰
          </h1>
          <p className="text-gray-300 font-cyber mb-6">
            Gamified budgeting quests with treasure map adventures
          </p>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="cyber-button flex items-center mx-auto"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Start New Quest
          </button>
        </motion.div>

        {/* Treasure Map Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="cyber-card p-8 h-96 relative overflow-hidden">
              <h3 className="text-xl font-gaming text-white mb-6 text-center">
                🗺️ Your Financial Journey
              </h3>
              
              <div className="absolute inset-4 bg-gradient-to-br from-yellow-900 via-yellow-800 to-yellow-700 rounded-xl opacity-20"></div>
              
              <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-4">
                <motion.path
                  d="M 10 80 Q 25 60 45 40 T 85 15"
                  stroke="#8b5cf6"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2 }}
                />
                
                {[
                  { x: 10, y: 80, icon: '🏴‍☠️' },
                  { x: 25, y: 60, icon: '⭐' },
                  { x: 45, y: 40, icon: '💰' },
                  { x: 65, y: 25, icon: '🏆' },
                  { x: 85, y: 15, icon: '💎' }
                ].map((point, index) => (
                  <motion.g key={index}>
                    <motion.circle
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill="#00ffff"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.3, duration: 0.5 }}
                    />
                    <motion.text
                      x={point.x}
                      y={point.y - 8}
                      textAnchor="middle"
                      className="text-2xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.3 + 0.5, duration: 0.5 }}
                    >
                      {point.icon}
                    </motion.text>
                  </motion.g>
                ))}
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            <div className="cyber-card">
              <h3 className="text-lg font-gaming text-white mb-4">Quest Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Active Quests</span>
                  <span className="text-cyber-cyan font-gaming">{budgets.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Saved</span>
                  <span className="text-yellow-400 font-gaming">
                    ${budgets.reduce((sum, b) => sum + (b.totalAmount - b.spentAmount), 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Quests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map((budget, index) => {
            const categoryData = getCategoryData(budget.category);
            const progress = getProgressPercentage(budget);
            
            return (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="cyber-card hover-glow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`text-2xl p-2 rounded-lg bg-${categoryData.color} bg-opacity-20`}>
                      {categoryData.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-gaming text-white">{budget.name}</h3>
                      <p className="text-sm text-gray-400">{budget.period} quest</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300 text-sm">Progress</span>
                    <span className="text-white font-gaming">
                      ${budget.spentAmount} / ${budget.totalAmount}
                    </span>
                  </div>
                  <div className="xp-bar">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        progress > 80 ? 'bg-red-500' : 
                        progress > 60 ? 'bg-yellow-500' : 
                        'bg-gradient-to-r from-cyber-cyan to-cyber-purple'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-cyber text-white">Milestones</h4>
                  {budget.milestones.slice(0, 2).map((milestone, i) => (
                    <div
                      key={i}
                      className={`flex items-center space-x-2 text-xs ${
                        milestone.completed ? 'text-green-400' : 'text-gray-400'
                      }`}
                    >
                      <span>{milestone.completed ? '✅' : '⭕'}</span>
                      <span>{milestone.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Create Budget Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-glass-card rounded-2xl p-6 w-full max-w-md border border-white border-opacity-10"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-gaming font-bold text-white">
                    New Money Quest 🗺️
                  </h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleCreateBudget} className="space-y-4">
                  <div>
                    <label className="block text-sm font-cyber text-white mb-2">Quest Name *</label>
                    <input
                      type="text"
                      value={newBudget.name}
                      onChange={(e) => setNewBudget({ ...newBudget, name: e.target.value })}
                      className="cyber-input w-full"
                      placeholder="e.g., Gaming & Entertainment Fund"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-cyber text-white mb-2">Budget Amount *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        value={newBudget.totalAmount}
                        onChange={(e) => setNewBudget({ ...newBudget, totalAmount: e.target.value })}
                        className="cyber-input w-full pl-8"
                        placeholder="200"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-cyber text-white mb-2">Category</label>
                      <select
                        value={newBudget.category}
                        onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                        className="cyber-input w-full"
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-cyber text-white mb-2">Period</label>
                      <select
                        value={newBudget.period}
                        onChange={(e) => setNewBudget({ ...newBudget, period: e.target.value })}
                        className="cyber-input w-full"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-3 border border-gray-600 text-white rounded-xl hover:bg-white hover:bg-opacity-10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 cyber-button"
                    >
                      Start Quest
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MoneyMoves;