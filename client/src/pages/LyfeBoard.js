import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  TrophyIcon, 
  CalendarIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const LyfeBoard = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'personal',
    priority: 'medium',
    targetDate: '',
    xpReward: 50
  });

  const categories = [
    { value: 'academic', label: 'Academic', color: 'cyber-cyan', icon: '📚' },
    { value: 'personal', label: 'Personal', color: 'cyber-purple', icon: '💪' },
    { value: 'future', label: 'Future', color: 'electric-blue', icon: '🚀' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'high', label: 'High', color: 'red' }
  ];

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await axios.get('/goals');
      setGoals(response.data.goals);
    } catch (error) {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/goals', newGoal);
      setGoals([response.data.goal, ...goals]);
      setShowCreateModal(false);
      setNewGoal({
        title: '',
        description: '',
        category: 'personal',
        priority: 'medium',
        targetDate: '',
        xpReward: 50
      });
      toast.success('🎯 Goal created! Time to level up!');
    } catch (error) {
      toast.error('Failed to create goal');
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(goals);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setGoals(items);
    // You could also save the new order to the backend here
  };

  const updateGoalProgress = async (goalId, newProgress) => {
    try {
      await axios.put(`/goals/${goalId}`, { progress: newProgress });
      setGoals(goals.map(goal => 
        goal.id === goalId ? { ...goal, progress: newProgress } : goal
      ));
      
      if (newProgress === 100) {
        toast.success('🎉 Goal completed! Amazing work!');
      } else {
        toast.success('Progress updated! 📈');
      }
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const filteredGoals = goals.filter(goal => {
    if (filter === 'all') return true;
    if (filter === 'active') return goal.status === 'active';
    if (filter === 'completed') return goal.status === 'completed';
    return goal.category === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading your goals" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-cyber p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-gaming font-bold text-white mb-2">
              <span className="text-gradient">LyfeBoard</span> 🎯
            </h1>
            <p className="text-gray-300 font-cyber">Track your goals and level up your life</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="cyber-button mt-4 sm:mt-0 flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Goal
          </button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {['all', 'active', 'completed', ...categories.map(c => c.value)].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg font-cyber transition-all duration-300 ${
                filter === filterOption
                  ? 'bg-cyber-cyan text-dark-bg'
                  : 'bg-dark-surface text-white hover:bg-opacity-80'
              }`}
            >
              {filterOption === 'all' ? 'All Goals' :
               filterOption === 'active' ? 'Active' :
               filterOption === 'completed' ? 'Completed' :
               categories.find(c => c.value === filterOption)?.label || filterOption}
            </button>
          ))}
        </motion.div>

        {/* Goals Grid */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="goals">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredGoals.map((goal, index) => (
                  <Draggable key={goal.id} draggableId={goal.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <motion.div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`cyber-card hover-glow cursor-move ${
                          snapshot.isDragging ? 'rotate-3 scale-105' : ''
                        }`}
                        style={{
                          ...provided.draggableProps.style,
                          borderLeft: `4px solid ${
                            goal.category === 'academic' ? '#00ffff' :
                            goal.category === 'personal' ? '#8b5cf6' :
                            '#0ea5e9'
                          }`
                        }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">
                              {categories.find(c => c.value === goal.category)?.icon || '🎯'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              goal.priority === 'high' ? 'bg-red-500 bg-opacity-20 text-red-400' :
                              goal.priority === 'medium' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                              'bg-green-500 bg-opacity-20 text-green-400'
                            }`}>
                              {goal.priority}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {goal.xp_reward} XP
                          </span>
                        </div>

                        <h3 className="text-lg font-gaming font-bold text-white mb-2">
                          {goal.title}
                        </h3>
                        
                        {goal.description && (
                          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                            {goal.description}
                          </p>
                        )}

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Progress</span>
                            <span className="text-sm text-white font-cyber">{goal.progress}%</span>
                          </div>
                          <div className="xp-bar">
                            <div 
                              className="xp-fill transition-all duration-500"
                              style={{ width: `${goal.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Progress Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateGoalProgress(goal.id, Math.max(0, goal.progress - 10))}
                            className="px-2 py-1 bg-red-500 bg-opacity-20 text-red-400 rounded text-xs hover:bg-opacity-30 transition-colors"
                            disabled={goal.progress === 0}
                          >
                            -10%
                          </button>
                          <button
                            onClick={() => updateGoalProgress(goal.id, Math.min(100, goal.progress + 10))}
                            className="px-2 py-1 bg-green-500 bg-opacity-20 text-green-400 rounded text-xs hover:bg-opacity-30 transition-colors"
                            disabled={goal.progress === 100}
                          >
                            +10%
                          </button>
                          {goal.progress === 100 && (
                            <span className="text-green-400 text-xs flex items-center">
                              <TrophyIcon className="w-4 h-4 mr-1" />
                              Complete!
                            </span>
                          )}
                        </div>

                        {goal.target_date && (
                          <div className="mt-3 flex items-center text-xs text-gray-400">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            Due: {new Date(goal.target_date).toLocaleDateString()}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {filteredGoals.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <TrophyIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-gaming text-white mb-2">No goals yet!</h3>
            <p className="text-gray-400 mb-6">Create your first goal and start your journey</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="cyber-button"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Your First Goal
            </button>
          </motion.div>
        )}

        {/* Create Goal Modal */}
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
                <h3 className="text-2xl font-gaming font-bold text-white mb-6">
                  Create New Goal 🎯
                </h3>

                <form onSubmit={handleCreateGoal} className="space-y-4">
                  <div>
                    <label className="block text-sm font-cyber text-white mb-2">Title *</label>
                    <input
                      type="text"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      className="cyber-input w-full"
                      placeholder="What do you want to achieve?"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-cyber text-white mb-2">Description</label>
                    <textarea
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      className="cyber-input w-full h-20 resize-none"
                      placeholder="Describe your goal..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-cyber text-white mb-2">Category</label>
                      <select
                        value={newGoal.category}
                        onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
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
                      <label className="block text-sm font-cyber text-white mb-2">Priority</label>
                      <select
                        value={newGoal.priority}
                        onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                        className="cyber-input w-full"
                      >
                        {priorities.map((priority) => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-cyber text-white mb-2">Target Date</label>
                    <input
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                      className="cyber-input w-full"
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-600 text-white rounded-xl hover:bg-white hover:bg-opacity-10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 cyber-button"
                    >
                      Create Goal
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

export default LyfeBoard;