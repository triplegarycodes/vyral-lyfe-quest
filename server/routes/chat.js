const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Get mentorship connections
router.get('/connections', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        mc.*,
        CASE 
          WHEN mc.mentor_id = $1 THEN u2.username
          ELSE u1.username
        END as other_username,
        CASE 
          WHEN mc.mentor_id = $1 THEN u2.display_name
          ELSE u1.display_name
        END as other_display_name,
        CASE 
          WHEN mc.mentor_id = $1 THEN u2.avatar_url
          ELSE u1.avatar_url
        END as other_avatar_url,
        CASE 
          WHEN mc.mentor_id = $1 THEN u2.level
          ELSE u1.level
        END as other_level,
        CASE 
          WHEN mc.mentor_id = $1 THEN 'mentee'
          ELSE 'mentor'
        END as my_role,
        (
          SELECT cm.content 
          FROM chat_messages cm 
          WHERE cm.connection_id = mc.id 
          ORDER BY cm.created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT cm.created_at 
          FROM chat_messages cm 
          WHERE cm.connection_id = mc.id 
          ORDER BY cm.created_at DESC 
          LIMIT 1
        ) as last_message_at
      FROM mentorship_connections mc
      JOIN users u1 ON mc.mentor_id = u1.id
      JOIN users u2 ON mc.mentee_id = u2.id
      WHERE (mc.mentor_id = $1 OR mc.mentee_id = $1) AND mc.status = 'active'
      ORDER BY last_message_at DESC NULLS LAST
    `, [req.user.id]);

    res.json({ connections: result.rows });
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get chat messages for a connection
router.get('/messages/:connectionId', authenticateToken, async (req, res) => {
  try {
    const { connectionId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    // Verify user is part of this connection
    const connectionResult = await db.query(
      'SELECT * FROM mentorship_connections WHERE id = $1 AND (mentor_id = $2 OR mentee_id = $2)',
      [connectionId, req.user.id]
    );
    
    if (connectionResult.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const result = await db.query(`
      SELECT 
        cm.*,
        u.username,
        u.display_name,
        u.avatar_url
      FROM chat_messages cm
      JOIN users u ON cm.sender_id = u.id
      WHERE cm.connection_id = $1
      ORDER BY cm.created_at DESC
      LIMIT $2 OFFSET $3
    `, [connectionId, parseInt(limit), parseInt(offset)]);
    
    // Mark messages as read
    await db.query(
      'UPDATE chat_messages SET read_at = CURRENT_TIMESTAMP WHERE connection_id = $1 AND receiver_id = $2 AND read_at IS NULL',
      [connectionId, req.user.id]
    );

    res.json({ messages: result.rows.reverse() });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Send message
router.post('/messages', authenticateToken, [
  body('connectionId').isInt(),
  body('content').notEmpty().isLength({ max: 2000 }),
  body('messageType').optional().isIn(['text', 'image', 'file'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { connectionId, content, messageType = 'text' } = req.body;
    
    // Verify user is part of this connection
    const connectionResult = await db.query(
      'SELECT * FROM mentorship_connections WHERE id = $1 AND (mentor_id = $2 OR mentee_id = $2) AND status = \'active\'',
      [connectionId, req.user.id]
    );
    
    if (connectionResult.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied or connection inactive' });
    }
    
    const connection = connectionResult.rows[0];
    const receiverId = connection.mentor_id === req.user.id ? connection.mentee_id : connection.mentor_id;
    
    const result = await db.query(`
      INSERT INTO chat_messages (sender_id, receiver_id, connection_id, content, message_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [req.user.id, receiverId, connectionId, content, messageType]);

    res.status(201).json({ 
      message: 'Message sent successfully',
      chatMessage: result.rows[0] 
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Request mentorship
router.post('/request-mentorship', authenticateToken, [
  body('mentorUsername').notEmpty(),
  body('focusAreas').isArray(),
  body('message').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mentorUsername, focusAreas, message } = req.body;
    
    // Get mentor user
    const mentorResult = await db.query('SELECT id FROM users WHERE username = $1', [mentorUsername]);
    if (mentorResult.rows.length === 0) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    
    const mentorId = mentorResult.rows[0].id;
    
    if (mentorId === req.user.id) {
      return res.status(400).json({ message: 'Cannot request mentorship from yourself' });
    }
    
    // Check if connection already exists
    const existingResult = await db.query(
      'SELECT * FROM mentorship_connections WHERE mentor_id = $1 AND mentee_id = $2',
      [mentorId, req.user.id]
    );
    
    if (existingResult.rows.length > 0) {
      return res.status(400).json({ message: 'Mentorship request already exists' });
    }
    
    const result = await db.query(`
      INSERT INTO mentorship_connections (mentor_id, mentee_id, focus_areas)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [mentorId, req.user.id, JSON.stringify(focusAreas)]);
    
    // Send initial message if provided
    if (message) {
      await db.query(`
        INSERT INTO chat_messages (sender_id, receiver_id, connection_id, content)
        VALUES ($1, $2, $3, $4)
      `, [req.user.id, mentorId, result.rows[0].id, message]);
    }

    res.status(201).json({ 
      message: 'Mentorship request sent!',
      connection: result.rows[0] 
    });
  } catch (error) {
    console.error('Request mentorship error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Accept/Reject mentorship request
router.put('/connections/:id/status', authenticateToken, [
  body('status').isIn(['active', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;
    
    // Verify user is the mentor for this connection
    const connectionResult = await db.query(
      'SELECT * FROM mentorship_connections WHERE id = $1 AND mentor_id = $2 AND status = \'pending\'',
      [id, req.user.id]
    );
    
    if (connectionResult.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied or connection not found' });
    }
    
    await db.query(
      'UPDATE mentorship_connections SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, id]
    );
    
    const message = status === 'active' ? 'Mentorship request accepted!' : 'Mentorship request declined';
    
    res.json({ message });
  } catch (error) {
    console.error('Update connection status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;