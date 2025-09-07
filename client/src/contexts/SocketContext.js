import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: {
          token: token
        }
      });

      newSocket.on('connect', () => {
        console.log('🔌 Connected to VYRAL socket');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Disconnected from VYRAL socket');
        setConnected(false);
      });

      newSocket.on('connected', (data) => {
        toast.success(data.message, {
          icon: '🎮',
          duration: 3000,
        });
      });

      // Handle real-time notifications
      newSocket.on('message_notification', (data) => {
        toast(`💬 New message from ${data.sender}`, {
          icon: '💬',
          duration: 4000,
          onClick: () => {
            // Navigate to chat
            window.location.href = '/vybezone';
          },
        });
        
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'message',
          title: 'New Message',
          content: `${data.sender}: ${data.preview}`,
          timestamp: new Date(),
          read: false,
        }]);
      });

      newSocket.on('post_interaction', (data) => {
        const message = data.type === 'like' 
          ? `${data.user.displayName || data.user.username} liked your post!`
          : `${data.user.displayName || data.user.username} commented on your post!`;
        
        toast(message, {
          icon: data.type === 'like' ? '❤️' : '💬',
          duration: 4000,
        });
        
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'post_interaction',
          title: data.type === 'like' ? 'New Like' : 'New Comment',
          content: message,
          timestamp: new Date(),
          read: false,
        }]);
      });

      newSocket.on('challenge_celebration', (data) => {
        toast(`🎉 Challenge completed! +${data.xpGained} XP`, {
          icon: '🏆',
          duration: 5000,
        });
      });

      newSocket.on('level_up_celebration', (data) => {
        toast(`🚀 LEVEL UP! Welcome to level ${data.newLevel}!`, {
          icon: '🚀',
          duration: 6000,
        });
      });

      newSocket.on('streak_milestone', (data) => {
        toast(`🔥 ${data.milestone} Amazing dedication!`, {
          icon: '🔥',
          duration: 5000,
        });
      });

      newSocket.on('daily_reminder', (data) => {
        toast(data.message, {
          icon: '⏰',
          duration: 6000,
        });
        
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'reminder',
          title: 'Daily Reminder',
          content: data.message,
          timestamp: new Date(),
          read: false,
        }]);
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        toast.error(error.message || 'Connection error');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setConnected(false);
      };
    }
  }, [user, token]);

  const joinChat = (connectionId) => {
    if (socket) {
      socket.emit('join_chat', connectionId);
    }
  };

  const leaveChat = (connectionId) => {
    if (socket) {
      socket.emit('leave_chat', connectionId);
    }
  };

  const sendMessage = (connectionId, content, messageType = 'text') => {
    if (socket) {
      socket.emit('send_message', {
        connectionId,
        content,
        messageType
      });
    }
  };

  const startTyping = (connectionId) => {
    if (socket) {
      socket.emit('typing_start', connectionId);
    }
  };

  const stopTyping = (connectionId) => {
    if (socket) {
      socket.emit('typing_stop', connectionId);
    }
  };

  const emitGoalUpdate = (goalData) => {
    if (socket) {
      socket.emit('goal_updated', goalData);
    }
  };

  const emitChallengeCompletion = (challengeData) => {
    if (socket) {
      socket.emit('challenge_completed', challengeData);
    }
  };

  const emitLevelUp = (levelData) => {
    if (socket) {
      socket.emit('level_up', levelData);
    }
  };

  const emitVybeTreeMilestone = (milestoneData) => {
    if (socket) {
      socket.emit('vybetree_milestone', milestoneData);
    }
  };

  const emitPostLiked = (postData) => {
    if (socket) {
      socket.emit('post_liked', postData);
    }
  };

  const emitPostCommented = (commentData) => {
    if (socket) {
      socket.emit('post_commented', commentData);
    }
  };

  const sendAIMessage = (conversationId, message) => {
    if (socket) {
      socket.emit('ai_message', {
        conversationId,
        message
      });
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    socket,
    connected,
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    joinChat,
    leaveChat,
    sendMessage,
    startTyping,
    stopTyping,
    emitGoalUpdate,
    emitChallengeCompletion,
    emitLevelUp,
    emitVybeTreeMilestone,
    emitPostLiked,
    emitPostCommented,
    sendAIMessage,
    markNotificationAsRead,
    clearNotifications,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};