const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await db.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    const user = result.rows[0];

    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = user.id;
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

const socketHandler = (io) => {
  // Authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`🔌 User ${socket.user.username} connected`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Handle chat messages
    socket.on('join_chat', (connectionId) => {
      socket.join(`chat_${connectionId}`);
    });

    socket.on('leave_chat', (connectionId) => {
      socket.leave(`chat_${connectionId}`);
    });

    socket.on('send_message', async (data) => {
      try {
        const { connectionId, content, messageType = 'text' } = data;
        
        // Verify user is part of this connection
        const connectionResult = await db.query(
          'SELECT * FROM mentorship_connections WHERE id = $1 AND (mentor_id = $2 OR mentee_id = $2) AND status = \'active\'',
          [connectionId, socket.userId]
        );
        
        if (connectionResult.rows.length === 0) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }
        
        const connection = connectionResult.rows[0];
        const receiverId = connection.mentor_id === socket.userId ? connection.mentee_id : connection.mentor_id;
        
        // Save message to database
        const messageResult = await db.query(`
          INSERT INTO chat_messages (sender_id, receiver_id, connection_id, content, message_type)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `, [socket.userId, receiverId, connectionId, content, messageType]);
        
        const message = messageResult.rows[0];
        
        // Broadcast to chat room
        io.to(`chat_${connectionId}`).emit('new_message', {
          ...message,
          sender: {
            id: socket.user.id,
            username: socket.user.username,
            displayName: socket.user.display_name,
            avatarUrl: socket.user.avatar_url
          }
        });
        
        // Send notification to receiver
        io.to(`user_${receiverId}`).emit('message_notification', {
          connectionId,
          sender: socket.user.username,
          preview: content.substring(0, 100)
        });
        
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (connectionId) => {
      socket.to(`chat_${connectionId}`).emit('user_typing', {
        userId: socket.userId,
        username: socket.user.username
      });
    });

    socket.on('typing_stop', (connectionId) => {
      socket.to(`chat_${connectionId}`).emit('user_stopped_typing', {
        userId: socket.userId
      });
    });

    // Handle live goal updates
    socket.on('goal_updated', (goalData) => {
      // Broadcast goal update to user's connections if they want to share progress
      socket.to(`user_${socket.userId}`).emit('goal_progress_update', {
        userId: socket.userId,
        username: socket.user.username,
        goal: goalData
      });
    });

    // Handle challenge completions
    socket.on('challenge_completed', async (challengeData) => {
      try {
        // Broadcast achievement to user's room for celebration effects
        io.to(`user_${socket.userId}`).emit('challenge_celebration', {
          userId: socket.userId,
          username: socket.user.username,
          challenge: challengeData,
          xpGained: challengeData.xpReward
        });

        // Check for streak milestones and broadcast special celebrations
        if (challengeData.streakCount && challengeData.streakCount % 7 === 0) {
          io.to(`user_${socket.userId}`).emit('streak_milestone', {
            streakCount: challengeData.streakCount,
            milestone: `${challengeData.streakCount} Day Streak!`
          });
        }
      } catch (error) {
        console.error('Challenge completion broadcast error:', error);
      }
    });

    // Handle level up celebrations
    socket.on('level_up', (levelData) => {
      io.to(`user_${socket.userId}`).emit('level_up_celebration', {
        userId: socket.userId,
        username: socket.user.username,
        newLevel: levelData.newLevel,
        oldLevel: levelData.oldLevel
      });
    });

    // Handle VybeTree updates
    socket.on('vybetree_milestone', (milestoneData) => {
      io.to(`user_${socket.userId}`).emit('vybetree_animation', {
        userId: socket.userId,
        milestone: milestoneData,
        animationType: 'branch_grow'
      });
    });

    // Handle post interactions for real-time updates
    socket.on('post_liked', (postData) => {
      // Notify post author
      if (postData.authorId !== socket.userId) {
        io.to(`user_${postData.authorId}`).emit('post_interaction', {
          type: 'like',
          postId: postData.postId,
          user: {
            username: socket.user.username,
            displayName: socket.user.display_name,
            avatarUrl: socket.user.avatar_url
          }
        });
      }
    });

    socket.on('post_commented', (commentData) => {
      // Notify post author
      if (commentData.authorId !== socket.userId) {
        io.to(`user_${commentData.authorId}`).emit('post_interaction', {
          type: 'comment',
          postId: commentData.postId,
          comment: commentData.content,
          user: {
            username: socket.user.username,
            displayName: socket.user.display_name,
            avatarUrl: socket.user.avatar_url
          }
        });
      }
    });

    // Handle AI chat for real-time responses
    socket.on('ai_message', async (data) => {
      try {
        const { conversationId, message } = data;
        
        // Verify conversation belongs to user
        const conversationResult = await db.query(
          'SELECT * FROM ai_conversations WHERE id = $1 AND user_id = $2',
          [conversationId, socket.userId]
        );
        
        if (conversationResult.rows.length === 0) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }
        
        // Show typing indicator
        socket.emit('ai_typing', { conversationId });
        
        // Simulate AI processing delay
        setTimeout(async () => {
          try {
            // This would integrate with actual AI service
            const aiResponse = "I understand what you're saying. Let me help you explore this further...";
            
            // Update conversation in database
            const conversation = conversationResult.rows[0];
            const currentMessages = conversation.messages || [];
            
            const newMessages = [
              ...currentMessages,
              {
                role: 'user',
                content: message,
                timestamp: new Date().toISOString()
              },
              {
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date().toISOString()
              }
            ];
            
            await db.query(`
              UPDATE ai_conversations 
              SET messages = $1, updated_at = CURRENT_TIMESTAMP
              WHERE id = $2
            `, [JSON.stringify(newMessages), conversationId]);
            
            // Send AI response
            socket.emit('ai_response', {
              conversationId,
              message: aiResponse,
              timestamp: new Date().toISOString()
            });
            
          } catch (error) {
            console.error('AI response error:', error);
            socket.emit('error', { message: 'AI service temporarily unavailable' });
          }
        }, 1000 + Math.random() * 2000); // 1-3 second delay
        
      } catch (error) {
        console.error('AI message error:', error);
        socket.emit('error', { message: 'Failed to process AI message' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 User ${socket.user.username} disconnected`);
    });

    // Send welcome message
    socket.emit('connected', {
      message: `Welcome back, ${socket.user.display_name || socket.user.username}! ✨`,
      user: {
        id: socket.user.id,
        username: socket.user.username,
        displayName: socket.user.display_name,
        level: socket.user.level,
        xp: socket.user.xp
      }
    });
  });

  // Handle global events
  setInterval(async () => {
    try {
      // Broadcast daily challenge reminders
      const now = new Date();
      if (now.getHours() === 9 && now.getMinutes() === 0) { // 9 AM reminder
        const activeUsers = await db.query(`
          SELECT id FROM users 
          WHERE last_activity >= CURRENT_DATE - INTERVAL '7 days'
        `);
        
        activeUsers.rows.forEach(user => {
          io.to(`user_${user.id}`).emit('daily_reminder', {
            type: 'challenges',
            message: 'New daily challenges are waiting for you! 🎮',
            action: 'view_challenges'
          });
        });
      }
    } catch (error) {
      console.error('Global event error:', error);
    }
  }, 60000); // Check every minute
};

module.exports = socketHandler;