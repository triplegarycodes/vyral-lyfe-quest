const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Mock AI responses for now - replace with actual OpenAI integration
const generateAIResponse = async (message, context) => {
  // This would integrate with OpenAI API
  const responses = {
    creative: [
      "That's a fascinating creative direction! Have you considered exploring the emotional depth of your characters?",
      "I love where this is going! What if we added some unexpected elements to make it even more engaging?",
      "Your creativity is amazing! Let's brainstorm some ways to make this concept even more unique.",
    ],
    academic: [
      "Great question! Let's break this down step by step to make it easier to understand.",
      "I can help you approach this systematically. What specific part would you like to focus on first?",
      "That's a solid foundation! Here are some ways to expand on that idea...",
    ],
    general: [
      "I'm here to help you explore your ideas! What's on your mind today?",
      "That's an interesting perspective! Tell me more about what you're thinking.",
      "I love your curiosity! Let's dive deeper into this topic together.",
    ]
  };
  
  const contextResponses = responses[context] || responses.general;
  const randomResponse = contextResponses[Math.floor(Math.random() * contextResponses.length)];
  
  return randomResponse;
};

// Get AI conversations
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const result = await db.query(`
      SELECT id, title, context_type, created_at, updated_at,
        (messages->-1->>'content') as last_message
      FROM ai_conversations
      WHERE user_id = $1
      ORDER BY updated_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, parseInt(limit), parseInt(offset)]);

    res.json({ conversations: result.rows });
  } catch (error) {
    console.error('Get AI conversations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single conversation
router.get('/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'SELECT * FROM ai_conversations WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({ conversation: result.rows[0] });
  } catch (error) {
    console.error('Get AI conversation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start new conversation
router.post('/conversations', authenticateToken, [
  body('message').notEmpty().isLength({ max: 2000 }),
  body('contextType').optional().isIn(['general', 'creative', 'academic']),
  body('title').optional().isLength({ max: 255 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, contextType = 'general', title } = req.body;
    
    // Generate AI response
    const aiResponse = await generateAIResponse(message, contextType);
    
    const messages = [
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
    
    const conversationTitle = title || `Chat ${new Date().toLocaleDateString()}`;
    
    const result = await db.query(`
      INSERT INTO ai_conversations (user_id, title, context_type, messages)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [req.user.id, conversationTitle, contextType, JSON.stringify(messages)]);

    res.status(201).json({ 
      message: 'Conversation started!',
      conversation: result.rows[0] 
    });
  } catch (error) {
    console.error('Start AI conversation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Send message to conversation
router.post('/conversations/:id/messages', authenticateToken, [
  body('message').notEmpty().isLength({ max: 2000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { message } = req.body;
    
    // Get conversation
    const conversationResult = await db.query(
      'SELECT * FROM ai_conversations WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    
    if (conversationResult.rows.length === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    const conversation = conversationResult.rows[0];
    const currentMessages = conversation.messages || [];
    
    // Generate AI response
    const aiResponse = await generateAIResponse(message, conversation.context_type);
    
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
    
    const result = await db.query(`
      UPDATE ai_conversations 
      SET messages = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `, [JSON.stringify(newMessages), id, req.user.id]);

    res.json({ 
      message: 'Message sent!',
      conversation: result.rows[0],
      aiResponse
    });
  } catch (error) {
    console.error('Send AI message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete conversation
router.delete('/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'DELETE FROM ai_conversations WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete AI conversation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get AI suggestions based on user activity
router.get('/suggestions', authenticateToken, async (req, res) => {
  try {
    // Get user's recent activity to provide contextual suggestions
    const userStatsResult = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM goals WHERE user_id = $1 AND status = 'active') as active_goals,
        (SELECT COUNT(*) FROM user_challenges WHERE user_id = $1 AND DATE(started_at) = CURRENT_DATE) as today_challenges,
        (SELECT COUNT(*) FROM posts WHERE user_id = $1 AND created_at > CURRENT_DATE - INTERVAL '7 days') as recent_posts
    `, [req.user.id]);
    
    const stats = userStatsResult.rows[0];
    
    const suggestions = [];
    
    if (parseInt(stats.active_goals) === 0) {
      suggestions.push({
        type: 'goal_setting',
        title: 'Set Your First Goal',
        content: 'Let\'s create a goal that excites you! What would you like to achieve?',
        action: 'Start Goal Planning'
      });
    }
    
    if (parseInt(stats.today_challenges) === 0) {
      suggestions.push({
        type: 'challenge',
        title: 'Daily Challenge Awaits',
        content: 'Ready for today\'s challenge? I can help you pick one that matches your vibe!',
        action: 'Explore Challenges'
      });
    }
    
    if (parseInt(stats.recent_posts) === 0) {
      suggestions.push({
        type: 'creative',
        title: 'Share Your Creativity',
        content: 'Got something creative brewing? Let\'s brainstorm ways to share it with the community!',
        action: 'Creative Brainstorm'
      });
    }
    
    // Default suggestions if user is active
    if (suggestions.length === 0) {
      suggestions.push(
        {
          type: 'reflection',
          title: 'Reflect on Your Progress',
          content: 'How are you feeling about your recent achievements? Let\'s talk about your journey!',
          action: 'Start Reflection'
        },
        {
          type: 'inspiration',
          title: 'Need Some Inspiration?',
          content: 'I\'m here to help spark new ideas and keep your creative energy flowing!',
          action: 'Get Inspired'
        }
      );
    }

    res.json({ suggestions });
  } catch (error) {
    console.error('Get AI suggestions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;