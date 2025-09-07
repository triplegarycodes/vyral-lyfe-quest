import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bars3Icon, 
  XMarkIcon,
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markNotificationAsRead, clearNotifications } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '🎮' },
    { name: 'LyfeBoard', path: '/lyfeboard', icon: '📋' },
    { name: 'VybeTree', path: '/vybetree', icon: '🌳' },
    { name: 'VybeStrike', path: '/vybestrike', icon: '⚔️' },
    { name: 'VybeZone', path: '/vybezone', icon: '🤝' },
    { name: 'V-Shop', path: '/vshop', icon: '🛒' },
    { name: 'MoneyMoves', path: '/moneymoves', icon: '💰' },
    { name: 'B-Vyral', path: '/bvyral', icon: '🎨' },
    { name: 'Skrybe', path: '/skrybe', icon: '🤖' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  if (!user && (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/')) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-glass backdrop-blur-md border-b border-white border-opacity-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-gaming font-bold text-gradient">VYRAL</span>
            </Link>
            
            {location.pathname === '/' && (
              <div className="hidden md:flex space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-white hover:text-cyber-cyan transition-colors duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="cyber-button"
                >
                  Join VYRAL
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  }

  if (!user) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-glass backdrop-blur-md border-b border-white border-opacity-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl font-gaming font-bold text-gradient">VYRAL</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-cyber-cyan bg-opacity-20 text-cyber-cyan glow-cyan'
                    : 'text-white hover:text-cyber-cyan hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <span>{item.icon}</span>
                <span className="font-cyber">{item.name}</span>
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* User Stats */}
            <div className="hidden sm:flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="level-badge">LVL {user.level}</span>
                <div className="flex items-center space-x-1">
                  <span className="text-cyber-cyan">⭐</span>
                  <span className="font-cyber text-sm">{user.xp}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">🪙</span>
                  <span className="font-cyber text-sm">{user.coins}</span>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-white hover:text-cyber-cyan transition-colors duration-300"
              >
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-glass-card rounded-xl border border-white border-opacity-10 shadow-xl"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-gaming font-bold text-white">Notifications</h3>
                        {notifications.length > 0 && (
                          <button
                            onClick={clearNotifications}
                            className="text-xs text-cyber-cyan hover:text-white transition-colors"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                      
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {notifications.length === 0 ? (
                          <p className="text-gray-400 text-center py-4">No notifications</p>
                        ) : (
                          notifications.slice(0, 10).map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => markNotificationAsRead(notification.id)}
                              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                notification.read 
                                  ? 'bg-dark-surface' 
                                  : 'bg-cyber-cyan bg-opacity-10 border border-cyber-cyan border-opacity-30'
                              }`}
                            >
                              <p className="text-white text-sm font-medium">{notification.title}</p>
                              <p className="text-gray-300 text-xs">{notification.content}</p>
                              <p className="text-gray-500 text-xs mt-1">
                                {notification.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors duration-300"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-8 h-8 rounded-full border-2 border-cyber-cyan"
                  />
                ) : (
                  <UserCircleIcon className="w-8 h-8 text-cyber-cyan" />
                )}
                <span className="hidden sm:block text-white font-cyber">
                  {user.displayName || user.username}
                </span>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-glass-card rounded-xl border border-white border-opacity-10 shadow-xl"
                  >
                    <div className="py-2">
                      <Link
                        to={`/profile/${user.username}`}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-white hover:bg-white hover:bg-opacity-10 transition-colors"
                      >
                        <UserCircleIcon className="w-5 h-5" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-white hover:bg-white hover:bg-opacity-10 transition-colors"
                      >
                        <Cog6ToothIcon className="w-5 h-5" />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-red-400 hover:bg-red-400 hover:bg-opacity-10 transition-colors w-full text-left"
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-white hover:text-cyber-cyan transition-colors duration-300"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-white border-opacity-10"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                      isActive(item.path)
                        ? 'bg-cyber-cyan bg-opacity-20 text-cyber-cyan'
                        : 'text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-cyber">{item.name}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;