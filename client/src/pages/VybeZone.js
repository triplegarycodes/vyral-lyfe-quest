import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const VybeZone = () => {
  const [activeTab, setActiveTab] = useState('mentors');

  const mockMentors = [
    {
      id: 1,
      name: 'Alex Creator',
      level: 25,
      expertise: ['Digital Art', 'Music Production'],
      avatar: '🎨',
      status: 'online',
      rating: 4.9
    },
    {
      id: 2,
      name: 'Jordan Codes',
      level: 18,
      expertise: ['Web Development', 'Game Design'],
      avatar: '💻',
      status: 'online',
      rating: 4.8
    },
    {
      id: 3,
      name: 'Sam Writer',
      level: 22,
      expertise: ['Creative Writing', 'Poetry'],
      avatar: '✍️',
      status: 'away',
      rating: 4.7
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-cyber p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-gaming font-bold text-white mb-4">
            <span className="text-gradient">VybeZone</span> 🤝
          </h1>
          <p className="text-gray-300 font-cyber mb-8">Connect with mentors and peers in your growth journey</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="cyber-card">
              <h3 className="font-gaming text-white mb-4">Navigation</h3>
              <div className="space-y-2">
                {[
                  { id: 'mentors', label: 'Find Mentors', icon: '🧑‍🏫' },
                  { id: 'peers', label: 'Connect with Peers', icon: '👥' },
                  { id: 'chats', label: 'My Chats', icon: '💬' },
                  { id: 'groups', label: 'Study Groups', icon: '📚' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-300 flex items-center space-x-3 ${
                      activeTab === tab.id
                        ? 'bg-cyber-cyan bg-opacity-20 text-cyber-cyan'
                        : 'text-gray-300 hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="font-cyber">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="cyber-card">
              {activeTab === 'mentors' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-gaming text-white">Available Mentors</h3>
                    <button className="cyber-button flex items-center">
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Become a Mentor
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mockMentors.map((mentor) => (
                      <motion.div
                        key={mentor.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-dark-surface rounded-xl p-6 border border-white border-opacity-10 hover:border-cyber-cyan hover:border-opacity-50 transition-all duration-300"
                      >
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-cyber-cyan to-cyber-purple rounded-full flex items-center justify-center text-2xl">
                            {mentor.avatar}
                          </div>
                          <div>
                            <h4 className="text-white font-gaming font-bold">{mentor.name}</h4>
                            <div className="flex items-center space-x-2">
                              <span className="level-badge text-xs">LVL {mentor.level}</span>
                              <span className={`w-2 h-2 rounded-full ${
                                mentor.status === 'online' ? 'bg-green-400' : 'bg-yellow-400'
                              }`}></span>
                              <span className="text-xs text-gray-400 capitalize">{mentor.status}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-gray-400 text-sm mb-2">Expertise:</p>
                          <div className="flex flex-wrap gap-1">
                            {mentor.expertise.map((skill, i) => (
                              <span key={i} className="text-xs bg-cyber-cyan bg-opacity-20 text-cyber-cyan px-2 py-1 rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <StarIcon className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-400 text-sm font-gaming">{mentor.rating}</span>
                          </div>
                          <button className="px-4 py-2 bg-cyber-purple bg-opacity-20 text-cyber-purple rounded-lg hover:bg-opacity-30 transition-colors text-sm font-cyber">
                            Connect
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab !== 'mentors' && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🚧</div>
                  <h3 className="text-xl font-gaming text-white mb-2">Coming Soon!</h3>
                  <p className="text-gray-300">
                    This feature is being built with real-time chat, avatar circles, 
                    and safe moderation tools. Stay tuned!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VybeZone;