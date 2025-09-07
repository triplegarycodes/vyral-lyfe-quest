import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  TrophyIcon, 
  StarIcon,
  FireIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const VybeTree = () => {
  const { user } = useAuth();
  const { emitVybeTreeMilestone } = useSocket();
  const [treeData, setTreeData] = useState({
    level: user?.level || 1,
    branches: [],
    totalMilestones: 0,
    unlockedMilestones: 0
  });
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [animatingBranch, setAnimatingBranch] = useState(null);

  useEffect(() => {
    fetchTreeData();
  }, [user]);

  const fetchTreeData = async () => {
    try {
      // Fetch user's goals and challenges to build tree
      const [goalsResponse, challengesResponse, userStatsResponse] = await Promise.all([
        axios.get('/goals'),
        axios.get('/challenges/stats'),
        axios.get('/users/me')
      ]);

      const goals = goalsResponse.data.goals;
      const challengeStats = challengesResponse.data.stats;
      
      // Create branches based on user progress
      const branches = generateTreeBranches(goals, challengeStats, user);
      
      setTreeData({
        level: user.level,
        branches,
        totalMilestones: branches.reduce((sum, branch) => sum + branch.milestones.length, 0),
        unlockedMilestones: branches.reduce((sum, branch) => 
          sum + branch.milestones.filter(m => m.unlocked).length, 0
        )
      });
    } catch (error) {
      console.error('Failed to fetch tree data:', error);
    }
  };

  const generateTreeBranches = (goals, challengeStats, user) => {
    const branches = [
      // Main trunk - Level progress
      {
        id: 'trunk',
        type: 'trunk',
        name: 'Level Progress',
        color: 'cyber-cyan',
        x: 50,
        y: 85,
        length: 25,
        angle: 90,
        thickness: 8,
        unlocked: true,
        milestones: generateLevelMilestones(user.level)
      },
      // Goals branch
      {
        id: 'goals',
        type: 'goals',
        name: 'Goal Achievements',
        color: 'cyber-purple',
        x: 50,
        y: 60,
        length: 20,
        angle: 45,
        thickness: 6,
        unlocked: goals.length > 0,
        milestones: generateGoalMilestones(goals)
      },
      // Challenges branch
      {
        id: 'challenges',
        type: 'challenges',
        name: 'Challenge Victories',
        color: 'electric-blue',
        x: 50,
        y: 60,
        length: 18,
        angle: 135,
        thickness: 5,
        unlocked: challengeStats.completedChallenges > 0,
        milestones: generateChallengeMilestones(challengeStats)
      },
      // Streak branch
      {
        id: 'streaks',
        type: 'streaks',
        name: 'Consistency',
        color: 'glitch-green',
        x: 35,
        y: 45,
        length: 15,
        angle: 30,
        thickness: 4,
        unlocked: user.streakCount > 0,
        milestones: generateStreakMilestones(user.streakCount)
      },
      // Social branch (placeholder for future features)
      {
        id: 'social',
        type: 'social',
        name: 'Community',
        color: 'neon-pink',
        x: 65,
        y: 45,
        length: 12,
        angle: 150,
        thickness: 3,
        unlocked: false, // Will unlock with social features
        milestones: [
          { id: 'first_friend', name: 'First Connection', unlocked: false, icon: '🤝' },
          { id: 'mentor', name: 'Found Mentor', unlocked: false, icon: '🧑‍🏫' },
          { id: 'helper', name: 'Helped Others', unlocked: false, icon: '💝' }
        ]
      }
    ];

    return branches;
  };

  const generateLevelMilestones = (currentLevel) => {
    const milestones = [];
    for (let i = 1; i <= Math.max(currentLevel + 2, 10); i++) {
      milestones.push({
        id: `level_${i}`,
        name: `Level ${i}`,
        unlocked: i <= currentLevel,
        icon: i <= currentLevel ? '⭐' : '🔒',
        reward: `${i * 10} coins`
      });
    }
    return milestones;
  };

  const generateGoalMilestones = (goals) => {
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const activeGoals = goals.filter(g => g.status === 'active').length;
    
    return [
      { id: 'first_goal', name: 'First Goal Created', unlocked: goals.length > 0, icon: '🎯' },
      { id: 'goal_progress', name: 'Made Progress', unlocked: goals.some(g => g.progress > 0), icon: '📈' },
      { id: 'first_complete', name: 'First Victory', unlocked: completedGoals > 0, icon: '🏆' },
      { id: 'goal_master', name: 'Goal Master', unlocked: completedGoals >= 5, icon: '👑' },
      { id: 'ambitious', name: 'Ambitious', unlocked: activeGoals >= 3, icon: '🚀' }
    ];
  };

  const generateChallengeMilestones = (stats) => {
    return [
      { id: 'first_challenge', name: 'First Challenge', unlocked: stats.totalAttempts > 0, icon: '⚔️' },
      { id: 'daily_warrior', name: 'Daily Warrior', unlocked: stats.todayCompleted > 0, icon: '🛡️' },
      { id: 'challenge_streak', name: 'On Fire', unlocked: stats.bestStreak >= 3, icon: '🔥' },
      { id: 'completionist', name: 'Completionist', unlocked: stats.completedChallenges >= 10, icon: '💯' },
      { id: 'legend', name: 'Legendary', unlocked: stats.completedChallenges >= 50, icon: '🌟' }
    ];
  };

  const generateStreakMilestones = (streakCount) => {
    return [
      { id: 'streak_3', name: '3 Day Streak', unlocked: streakCount >= 3, icon: '🔥' },
      { id: 'streak_7', name: 'Week Warrior', unlocked: streakCount >= 7, icon: '⚡' },
      { id: 'streak_30', name: 'Monthly Master', unlocked: streakCount >= 30, icon: '💪' },
      { id: 'streak_100', name: 'Consistency King', unlocked: streakCount >= 100, icon: '👑' }
    ];
  };

  const handleBranchClick = (branch) => {
    if (!branch.unlocked) {
      toast('🔒 Complete more activities to unlock this branch!', {
        icon: '🌱',
        duration: 3000
      });
      return;
    }
    
    setSelectedBranch(branch);
    setAnimatingBranch(branch.id);
    
    // Emit milestone celebration
    emitVybeTreeMilestone({
      branchId: branch.id,
      branchName: branch.name,
      milestones: branch.milestones.filter(m => m.unlocked).length
    });

    setTimeout(() => setAnimatingBranch(null), 1000);
  };

  const getBranchPath = (branch) => {
    const startX = branch.x;
    const startY = branch.y;
    const radians = (branch.angle * Math.PI) / 180;
    const endX = startX + Math.cos(radians) * branch.length;
    const endY = startY - Math.sin(radians) * branch.length;
    
    return `M ${startX} ${startY} L ${endX} ${endY}`;
  };

  const getGlowColor = (color) => {
    const colors = {
      'cyber-cyan': '#00ffff',
      'cyber-purple': '#8b5cf6',
      'electric-blue': '#0ea5e9',
      'glitch-green': '#00ff41',
      'neon-pink': '#ff00ff'
    };
    return colors[color] || '#00ffff';
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
            <span className="text-gradient">VybeTree</span> 🌳
          </h1>
          <p className="text-gray-300 font-cyber mb-4">
            Watch your milestone tree grow with every achievement
          </p>
          
          {/* Progress Stats */}
          <div className="flex justify-center space-x-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-gaming text-cyber-cyan">{treeData.unlockedMilestones}</div>
              <div className="text-sm text-gray-400">Milestones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-gaming text-cyber-purple">{treeData.branches.filter(b => b.unlocked).length}</div>
              <div className="text-sm text-gray-400">Branches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-gaming text-electric-blue">{user.level}</div>
              <div className="text-sm text-gray-400">Level</div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tree Visualization */}
          <div className="lg:col-span-2">
            <div className="cyber-card p-8 h-96 relative overflow-hidden">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                className="absolute inset-0"
              >
                {/* Background glow effect */}
                <defs>
                  {treeData.branches.map(branch => (
                    <filter key={`glow-${branch.id}`} id={`glow-${branch.id}`}>
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  ))}
                </defs>

                {/* Tree branches */}
                {treeData.branches.map((branch, index) => (
                  <motion.g
                    key={branch.id}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ 
                      pathLength: branch.unlocked ? 1 : 0.3, 
                      opacity: branch.unlocked ? 1 : 0.3 
                    }}
                    transition={{ 
                      delay: index * 0.5,
                      duration: 1.5,
                      ease: "easeOut"
                    }}
                  >
                    <motion.path
                      d={getBranchPath(branch)}
                      stroke={getGlowColor(branch.color)}
                      strokeWidth={branch.thickness / 10}
                      fill="none"
                      filter={`url(#glow-${branch.id})`}
                      className="cursor-pointer"
                      onClick={() => handleBranchClick(branch)}
                      animate={animatingBranch === branch.id ? {
                        stroke: ['#ffffff', getGlowColor(branch.color), '#ffffff'],
                        strokeWidth: [branch.thickness / 10, (branch.thickness + 2) / 10, branch.thickness / 10]
                      } : {}}
                      transition={{ duration: 1, repeat: animatingBranch === branch.id ? 2 : 0 }}
                    />
                    
                    {/* Branch endpoint with milestone count */}
                    {branch.unlocked && (
                      <motion.circle
                        cx={branch.x + Math.cos((branch.angle * Math.PI) / 180) * branch.length}
                        cy={branch.y - Math.sin((branch.angle * Math.PI) / 180) * branch.length}
                        r="2"
                        fill={getGlowColor(branch.color)}
                        className="cursor-pointer"
                        onClick={() => handleBranchClick(branch)}
                        animate={animatingBranch === branch.id ? {
                          r: [2, 4, 2],
                          fill: ['#ffffff', getGlowColor(branch.color), '#ffffff']
                        } : {}}
                        transition={{ duration: 1, repeat: animatingBranch === branch.id ? 2 : 0 }}
                      >
                        <title>{branch.name} - {branch.milestones.filter(m => m.unlocked).length} milestones</title>
                      </motion.circle>
                    )}
                  </motion.g>
                ))}

                {/* Floating particles */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.circle
                    key={i}
                    cx={20 + Math.random() * 60}
                    cy={20 + Math.random() * 60}
                    r="0.5"
                    fill="#00ffff"
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2
                    }}
                  />
                ))}
              </svg>

              {/* Branch labels */}
              {treeData.branches.map((branch) => (
                <motion.div
                  key={`label-${branch.id}`}
                  className={`absolute text-xs font-cyber ${
                    branch.unlocked ? 'text-white' : 'text-gray-500'
                  } cursor-pointer hover:text-cyber-cyan transition-colors`}
                  style={{
                    left: `${branch.x + Math.cos((branch.angle * Math.PI) / 180) * (branch.length + 5)}%`,
                    top: `${branch.y - Math.sin((branch.angle * Math.PI) / 180) * (branch.length + 5)}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={() => handleBranchClick(branch)}
                  whileHover={{ scale: 1.1 }}
                >
                  {branch.name}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Branch Details */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {selectedBranch ? (
                <motion.div
                  key={selectedBranch.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="cyber-card"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-gaming text-white">{selectedBranch.name}</h3>
                    <button
                      onClick={() => setSelectedBranch(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedBranch.milestones.map((milestone) => (
                      <motion.div
                        key={milestone.id}
                        className={`p-3 rounded-xl flex items-center space-x-3 ${
                          milestone.unlocked
                            ? 'bg-green-500 bg-opacity-20 border border-green-500 border-opacity-30'
                            : 'bg-dark-surface border border-gray-600'
                        }`}
                        whileHover={{ scale: 1.02 }}
                      >
                        <span className="text-2xl">{milestone.icon}</span>
                        <div className="flex-1">
                          <p className={`font-cyber font-medium ${
                            milestone.unlocked ? 'text-green-400' : 'text-gray-400'
                          }`}>
                            {milestone.name}
                          </p>
                          {milestone.reward && milestone.unlocked && (
                            <p className="text-xs text-gray-300">Reward: {milestone.reward}</p>
                          )}
                        </div>
                        {milestone.unlocked && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-green-400"
                          >
                            ✓
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-dark-surface rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Progress</span>
                      <span className="text-sm text-white font-cyber">
                        {selectedBranch.milestones.filter(m => m.unlocked).length} / {selectedBranch.milestones.length}
                      </span>
                    </div>
                    <div className="xp-bar">
                      <div 
                        className="xp-fill"
                        style={{ 
                          width: `${(selectedBranch.milestones.filter(m => m.unlocked).length / selectedBranch.milestones.length) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="cyber-card text-center"
                >
                  <SparklesIcon className="w-12 h-12 text-cyber-cyan mx-auto mb-4" />
                  <h3 className="text-xl font-gaming text-white mb-2">Your Growth Tree</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Click on any branch to see your milestones and progress!
                  </p>
                  <div className="text-xs text-gray-400">
                    🌱 Complete goals and challenges to unlock new branches
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Achievement Celebration */}
        <AnimatePresence>
          {animatingBranch && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <motion.div
                className="bg-gradient-to-r from-cyber-cyan to-cyber-purple rounded-full p-8"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 1, repeat: 2 }}
              >
                <SparklesIcon className="w-16 h-16 text-white" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VybeTree;