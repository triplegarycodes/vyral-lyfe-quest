import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BoltIcon, FireIcon, StarIcon, TrophyIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const VybeStrike = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await axios.get('/challenges');
      setChallenges(response.data.challenges);
    } catch (error) {
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const startChallenge = async (challengeId) => {
    try {
      await axios.post(`/challenges/${challengeId}/start`);
      toast.success('🎮 Challenge started! Let\'s go!');
      fetchChallenges(); // Refresh to show updated status
    } catch (error) {
      toast.error('Failed to start challenge');
    }
  };

  const categories = ['all', 'fitness', 'creativity', 'social', 'academic', 'mindfulness'];
  
  const filteredChallenges = challenges.filter(challenge => 
    filter === 'all' || challenge.category === filter
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading challenges" />
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
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-gaming font-bold text-white mb-4">
            <span className="text-gradient">VybeStrike</span> ⚔️
          </h1>
          <p className="text-gray-300 font-cyber">Daily RPG-style challenges to level up your life</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-wrap gap-2 mb-8 justify-center"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 py-2 rounded-lg font-cyber transition-all duration-300 capitalize ${
                filter === category
                  ? 'bg-cyber-purple text-dark-bg'
                  : 'bg-dark-surface text-white hover:bg-opacity-80'
              }`}
            >
              {category === 'all' ? 'All Challenges' : category}
            </button>
          ))}
        </motion.div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`cyber-card hover-glow ${
                challenge.user_status === 'completed' ? 'border-green-500 border-opacity-50' :
                challenge.user_status === 'active' ? 'border-cyber-purple border-opacity-50' :
                ''
              }`}
            >
              {/* Challenge Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {challenge.category === 'fitness' ? '💪' :
                     challenge.category === 'creativity' ? '🎨' :
                     challenge.category === 'social' ? '🤝' :
                     challenge.category === 'academic' ? '📚' :
                     challenge.category === 'mindfulness' ? '🧘' : '⚡'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    challenge.difficulty === 'easy' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                    challenge.difficulty === 'medium' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                    challenge.difficulty === 'hard' ? 'bg-red-500 bg-opacity-20 text-red-400' :
                    'bg-purple-500 bg-opacity-20 text-purple-400'
                  }`}>
                    {challenge.difficulty}
                  </span>
                </div>
                
                {challenge.user_status === 'completed' && (
                  <div className="flex items-center space-x-1">
                    <TrophyIcon className="w-5 h-5 text-green-400" />
                    {challenge.streak_count > 0 && (
                      <div className="flex items-center space-x-1">
                        <FireIcon className="w-4 h-4 text-orange-400" />
                        <span className="text-orange-400 text-sm">{challenge.streak_count}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Challenge Info */}
              <h3 className="text-lg font-gaming font-bold text-white mb-2">
                {challenge.title}
              </h3>
              
              <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                {challenge.description}
              </p>

              {/* Rewards */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <StarIcon className="w-4 h-4 text-cyber-cyan" />
                    <span className="text-cyber-cyan text-sm font-cyber">{challenge.xp_reward} XP</span>
                  </div>
                  {challenge.coin_reward > 0 && (
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">🪙</span>
                      <span className="text-yellow-400 text-sm font-cyber">{challenge.coin_reward}</span>
                    </div>
                  )}
                </div>
                
                {challenge.is_daily && (
                  <span className="text-xs bg-cyber-cyan bg-opacity-20 text-cyber-cyan px-2 py-1 rounded-full">
                    Daily
                  </span>
                )}
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between">
                {challenge.user_status === 'completed' ? (
                  <span className="flex items-center text-green-400 font-cyber">
                    <TrophyIcon className="w-4 h-4 mr-1" />
                    Completed!
                  </span>
                ) : challenge.user_status === 'active' ? (
                  <span className="flex items-center text-cyber-purple font-cyber">
                    <BoltIcon className="w-4 h-4 mr-1" />
                    In Progress
                  </span>
                ) : (
                  <button
                    onClick={() => startChallenge(challenge.id)}
                    className="cyber-button text-sm px-4 py-2"
                  >
                    Start Challenge
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredChallenges.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <BoltIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-gaming text-white mb-2">No challenges found</h3>
            <p className="text-gray-400">Try a different category or check back later for new challenges!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VybeStrike;