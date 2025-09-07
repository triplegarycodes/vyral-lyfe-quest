import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Configure axios defaults
axios.defaults.baseURL = `${API_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('vyral_token'));

  // Set up axios interceptor for authentication
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => axios.interceptors.request.eject(interceptor);
  }, [token]);

  // Set up axios interceptor for handling auth errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
          toast.error('Session expired. Please log in again.');
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // Load user data on app start
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await axios.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('vyral_token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('vyral_token', newToken);
      setToken(newToken);
      setUser(userData);
      
      toast.success(`Welcome back, ${userData.displayName || userData.username}! 🎮`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;
      
      localStorage.setItem('vyral_token', newToken);
      setToken(newToken);
      setUser(newUser);
      
      toast.success(`Welcome to VYRAL, ${newUser.displayName || newUser.username}! 🚀`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('vyral_token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/auth/profile', profileData);
      setUser(response.data.user);
      toast.success('Profile updated successfully! ✨');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const addXP = async (amount, source) => {
    try {
      const response = await axios.post('/users/xp/add', { amount, source });
      const { xp, level, leveledUp } = response.data;
      
      setUser(prev => ({ ...prev, xp, level }));
      
      if (leveledUp) {
        toast.success(`🎉 LEVEL UP! You're now level ${level}!`, {
          duration: 6000,
          icon: '🚀',
        });
      } else {
        toast.success(`+${amount} XP from ${source}!`, {
          icon: '⭐',
        });
      }
      
      return { success: true, leveledUp };
    } catch (error) {
      console.error('Failed to add XP:', error);
      return { success: false };
    }
  };

  const updateStreak = async (action) => {
    try {
      const response = await axios.post('/users/streak/update', { action });
      const { streakCount } = response.data;
      
      setUser(prev => ({ ...prev, streakCount }));
      
      if (action === 'increment') {
        toast.success(`🔥 ${streakCount} day streak!`, {
          icon: '🔥',
        });
      }
      
      return { success: true, streakCount };
    } catch (error) {
      console.error('Failed to update streak:', error);
      return { success: false };
    }
  };

  const awardBadge = async (badgeData) => {
    try {
      const response = await axios.post('/users/badges/award', badgeData);
      const { badges } = response.data;
      
      setUser(prev => ({ ...prev, badges }));
      
      toast.success(`🏆 New badge earned: ${badgeData.badgeName}!`, {
        duration: 6000,
        icon: '🏆',
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to award badge:', error);
      return { success: false };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    addXP,
    updateStreak,
    awardBadge,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};