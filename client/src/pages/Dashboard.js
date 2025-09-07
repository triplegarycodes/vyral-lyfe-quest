import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrophyIcon, 
  FireIcon, 
  StarIcon, 
  ChartBarIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const { connected } = useSocket();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [dailyChallenges, setDailyChallenges] = useState([]);
  const [activeGoals, setActiveGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all dashboard data in parallel
        const [
          goalsResponse,
          challengesResponse,
          goalStatsResponse,
          challengeStatsResponse
        ] = await Promise.all([
          axios.get('/goals?status=active&limit=3'),
          axios.get('/challenges/daily'),
          axios.get('/goals/stats'),
          axios.get('/challenges/stats')
        ]);

        setActiveGoals(goalsResponse.data.goals);
        setDailyChallenges(challengesResponse.data.dailyChallenges);
        
        // Combine stats
        setStats({
          ...goalStatsResponse.data.stats,
          ...challengeStatsResponse.data.stats
        });

        // Mock recent activity for now
        setRecentActivity([
          { type: 'goal_progress', message: 'Updated progress on "Master Digital Art"', time: '2 hours ago', icon: '🎯' },
          { type: 'challenge_complete', message: 'Completed "Morning Meditation" challenge', time: '5 hours ago', icon: '✅' },
          { type: 'level_up', message: 'Leveled up to Level ' + user.level, time: '1 day ago', icon: '🚀' },
          { type: 'badge_earned', message: 'Earned "Week Warrior" badge', time: '2 days ago', icon: '🏆' }
        ]);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading your dashboard" />
      </div>
    );
  }

  const quickActions = [
    { title: 'Create Goal', description: 'Set a new personal goal', icon: '🎯', link: '/lyfeboard', color: 'cyber-cyan' },
    { title: 'Take Challenge', description: 'Start today\'s challenge', icon: '⚔️', link: '/vybestrike', color: 'cyber-purple' },
    { title: 'Share Creation', description: 'Post your latest work', icon: '🎨', link: '/bvyral', color: 'electric-blue' },
    { title: 'Chat with AI', description: 'Get creative inspiration', icon: '🤖', link: '/skrybe', color: 'glitch-green' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-cyber p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-gaming font-bold text-white mb-2">
                Welcome back, <span className="text-gradient">{user.displayName || user.username}</span>! 🎮
              </h1>
              <p className="text-gray-300 font-cyber">
                {connected ? (
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                    Connected • Ready to level up
                  </span>
                ) : (
                  'Loading your data...'
                )}
              </p>
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="level-badge">LVL {user.level}</span>
                  {user.streakCount > 0 && (
                    <div className="flex items-center space-x-1 bg-orange-500 bg-opacity-20 px-2 py-1 rounded-full">
                      <FireIcon className="w-4 h-4 text-orange-400" />
                      <span className="text-orange-400 text-sm font-cyber">{user.streakCount}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <StarIcon className="w-4 h-4 text-cyber-cyan" />
                    <span className="text-white">{user.xp} XP</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400">🪙</span>
                    <span className="text-white">{user.coins}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={itemVariants} className="cyber-card hover-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-cyber">Active Goals</p>
                <p className="text-2xl font-gaming font-bold text-white">{stats?.activeGoals || 0}</p>
              </div>
              <div className="p-3 bg-cyber-cyan bg-opacity-20 rounded-xl">
                <TrophyIcon className="w-6 h-6 text-cyber-cyan" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="cyber-card hover-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-cyber">Completed Today</p>
                <p className="text-2xl font-gaming font-bold text-white">{stats?.todayCompleted || 0}</p>
              </div>
              <div className="p-3 bg-cyber-purple bg-opacity-20 rounded-xl">
                <BoltIcon className="w-6 h-6 text-cyber-purple" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="cyber-card hover-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-cyber">Total XP</p>
                <p className="text-2xl font-gaming font-bold text-white">{user.xp}</p>
              </div>
              <div className="p-3 bg-electric-blue bg-opacity-20 rounded-xl">
                <ArrowTrendingUpIcon className="w-6 h-6 text-electric-blue" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="cyber-card hover-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-cyber">Completion Rate</p>
                <p className="text-2xl font-gaming font-bold text-white">
                  {stats?.completionRate ? Math.round(stats.completionRate) : 0}%
                </p>
              </div>
              <div className="p-3 bg-glitch-green bg-opacity-20 rounded-xl">
                <ChartBarIcon className="w-6 h-6 text-glitch-green" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1"
          >
            <div className="cyber-card">
              <h3 className="text-xl font-gaming font-bold text-white mb-4 flex items-center">
                <BoltIcon className="w-5 h-5 mr-2 text-cyber-cyan" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <Link
                    key={action.title}
                    to={action.link}
                    className="flex items-center p-3 rounded-xl bg-dark-surface hover:bg-opacity-80 transition-all duration-300 hover:scale-105 group"
                  >
                    <div className={`p-2 bg-${action.color} bg-opacity-20 rounded-lg mr-3`}>
                      <span className="text-lg">{action.icon}</span>
                    </div>
                    <div>
                      <p className="font-cyber font-medium text-white group-hover:text-cyber-cyan transition-colors">
                        {action.title}
                      </p>
                      <p className="text-sm text-gray-400">{action.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Active Goals */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1"
          >
            <div className="cyber-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-gaming font-bold text-white flex items-center">
                  <TrophyIcon className="w-5 h-5 mr-2 text-cyber-cyan" />
                  Active Goals
                </h3>
                <Link
                  to="/lyfeboard"
                  className="text-cyber-cyan hover:text-white text-sm font-cyber transition-colors"
                >
                  View All
                </Link>
              </div>
              
              <div className="space-y-4">
                {activeGoals.length === 0 ? (
                  <div className="text-center py-8">
                    <TrophyIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 mb-4">No active goals yet</p>
                    <Link
                      to="/lyfeboard"
                      className="inline-flex items-center px-4 py-2 bg-cyber-cyan bg-opacity-20 text-cyber-cyan rounded-lg hover:bg-opacity-30 transition-colors"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Create Your First Goal
                    </Link>
                  </div>
                ) : (
                  activeGoals.map((goal) => (
                    <div key={goal.id} className="p-4 bg-dark-surface rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-cyber font-medium text-white truncate">{goal.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          goal.priority === 'high' ? 'bg-red-500 bg-opacity-20 text-red-400' :
                          goal.priority === 'medium' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                          'bg-green-500 bg-opacity-20 text-green-400'
                        }`}>
                          {goal.priority}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="xp-bar">
                            <div 
                              className="xp-fill"
                              style={{ width: `${goal.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-400 ml-3">{goal.progress}%</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* Daily Challenges & Recent Activity */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1 space-y-6"
          >
            {/* Daily Challenges */}
            <div className="cyber-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-gaming font-bold text-white flex items-center">
                  <BoltIcon className="w-5 h-5 mr-2 text-cyber-purple" />
                  Today's Challenges
                </h3>
                <Link
                  to="/vybestrike"
                  className="text-cyber-purple hover:text-white text-sm font-cyber transition-colors"
                >
                  View All
                </Link>
              </div>
              
              <div className="space-y-3">
                {dailyChallenges.slice(0, 3).map((challenge) => (
                  <div key={challenge.id} className="p-3 bg-dark-surface rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-cyber font-medium text-white text-sm">{challenge.title}</h4>
                        <p className="text-xs text-gray-400 mt-1">{challenge.description}</p>
                      </div>
                      <div className="ml-3 text-right">
                        <div className="flex items-center space-x-1">
                          <StarIcon className="w-3 h-3 text-cyber-cyan" />
                          <span className="text-xs text-cyber-cyan">{challenge.xp_reward}</span>
                        </div>
                        {challenge.user_status === 'completed' ? (
                          <span className="text-xs text-green-400">✅ Done</span>
                        ) : (
                          <Link
                            to="/vybestrike"
                            className="text-xs text-cyber-purple hover:text-white transition-colors"
                          >
                            Start
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="cyber-card">
              <h3 className="text-xl font-gaming font-bold text-white mb-4 flex items-center">
                <HeartIcon className="w-5 h-5 mr-2 text-glitch-green" />
                Recent Activity
              </h3>
              
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center p-3 bg-dark-surface rounded-xl">
                    <span className="text-lg mr-3">{activity.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm text-white font-cyber">{activity.message}</p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;