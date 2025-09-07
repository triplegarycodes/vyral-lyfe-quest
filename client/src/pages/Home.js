import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  RocketLaunchIcon, 
  TrophyIcon,
  UsersIcon,
  LightBulbIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const features = [
    {
      icon: <SparklesIcon className="w-8 h-8" />,
      title: 'LyfeBoard',
      description: 'Track your goals with draggable cards and progress visualization',
      color: 'cyber-cyan'
    },
    {
      icon: <RocketLaunchIcon className="w-8 h-8" />,
      title: 'VybeStrike',
      description: 'Daily RPG-style challenges with XP rewards and streaks',
      color: 'cyber-purple'
    },
    {
      icon: <TrophyIcon className="w-8 h-8" />,
      title: 'VybeTree',
      description: 'Watch your milestone tree grow with glowing animations',
      color: 'electric-blue'
    },
    {
      icon: <UsersIcon className="w-8 h-8" />,
      title: 'VybeZone',
      description: 'Connect with mentors and peers in a supportive community',
      color: 'glitch-green'
    },
    {
      icon: <LightBulbIcon className="w-8 h-8" />,
      title: 'Skrybe',
      description: 'AI-powered creative companion to spark your imagination',
      color: 'neon-pink'
    },
    {
      icon: <HeartIcon className="w-8 h-8" />,
      title: 'B-Vyral',
      description: 'Share your creative projects and get inspired by others',
      color: 'cyber-cyan'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-cyber">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyber-cyan rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-cyber-purple rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-electric-blue rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-6xl md:text-8xl font-gaming font-bold text-gradient mb-6 animate-glow-pulse">
              VYRAL
            </h1>
            <p className="text-2xl md:text-3xl font-cyber text-white mb-4">
              Level Up Your Life
            </p>
            <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              The ultimate teen-centered hub for growth, creativity, and connection. 
              Gamify your goals, unlock your potential, and join a community that celebrates your journey.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to="/register"
                className="cyber-button text-lg px-8 py-4 animate-bounce-subtle"
              >
                🚀 Start Your Journey
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 border-2 border-cyber-cyan text-cyber-cyan rounded-xl font-gaming font-semibold hover:bg-cyber-cyan hover:text-dark-bg transition-all duration-300 hover:glow-cyan"
              >
                🎮 Login
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-dark-bg bg-opacity-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-gaming font-bold text-white mb-6">
              Features That <span className="text-gradient">Level You Up</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover powerful tools designed to make personal growth feel like your favorite game
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="cyber-card hover-glow group"
              >
                <div className={`inline-flex p-3 rounded-xl mb-4 text-${feature.color} bg-${feature.color} bg-opacity-20`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-gaming font-bold text-white mb-4 group-hover:text-cyber-cyan transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-gaming font-bold text-white mb-6">
              Join the <span className="text-gradient-neon">Movement</span>
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          >
            <motion.div variants={itemVariants} className="cyber-card">
              <div className="text-4xl md:text-5xl font-gaming font-bold text-gradient mb-4">
                10K+
              </div>
              <p className="text-xl text-white font-cyber">Active Creators</p>
              <p className="text-gray-300 mt-2">Teens leveling up daily</p>
            </motion.div>

            <motion.div variants={itemVariants} className="cyber-card">
              <div className="text-4xl md:text-5xl font-gaming font-bold text-gradient mb-4">
                50K+
              </div>
              <p className="text-xl text-white font-cyber">Goals Achieved</p>
              <p className="text-gray-300 mt-2">Dreams turned into reality</p>
            </motion.div>

            <motion.div variants={itemVariants} className="cyber-card">
              <div className="text-4xl md:text-5xl font-gaming font-bold text-gradient mb-4">
                100K+
              </div>
              <p className="text-xl text-white font-cyber">Challenges Completed</p>
              <p className="text-gray-300 mt-2">Small wins, big impact</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyber-cyan via-cyber-purple to-electric-blue">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-gaming font-bold text-dark-bg mb-6">
              Ready to Go Viral?
            </h2>
            <p className="text-xl text-dark-bg mb-8 opacity-90">
              Join thousands of teens who are already leveling up their lives with VYRAL
            </p>
            <Link
              to="/register"
              className="inline-block bg-dark-bg text-white font-gaming font-bold text-lg px-12 py-4 rounded-xl hover:scale-105 transition-all duration-300 hover:shadow-2xl"
            >
              🎮 Start Playing Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-bg py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-3xl font-gaming font-bold text-gradient mb-4">VYRAL</div>
            <p className="text-gray-400 mb-4">Level Up Your Life</p>
            <p className="text-gray-500 text-sm">
              © 2024 VYRAL. Built for teens, by teens who believe in your potential.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;