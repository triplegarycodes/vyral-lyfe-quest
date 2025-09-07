const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Get all goals for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, status } = req.query;
    
    let whereClause = 'WHERE user_id = $1';
    const params = [req.user.id];
    let paramCount = 2;
    
    if (category) {
      whereClause += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }
    
    if (status) {
      whereClause += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    const result = await db.query(`
      SELECT * FROM goals 
      ${whereClause}
      ORDER BY created_at DESC
    `, params);

    res.json({ goals: result.rows });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create goal
router.post('/', authenticateToken, [
  body('title').notEmpty().isLength({ max: 255 }),
  body('description').optional().isLength({ max: 1000 }),
  body('category').isIn(['academic', 'personal', 'future']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('targetDate').optional().isISO8601(),
  body('xpReward').optional().isInt({ min: 1, max: 1000 }),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      title, 
      description, 
      category, 
      priority = 'medium',
      targetDate,
      xpReward = 10,
      color = '#6366f1',
      positionX = 0,
      positionY = 0
    } = req.body;

    const result = await db.query(`
      INSERT INTO goals (
        user_id, title, description, category, priority, 
        target_date, xp_reward, color, position_x, position_y
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      req.user.id, title, description, category, priority,
      targetDate, xpReward, color, positionX, positionY
    ]);

    res.status(201).json({ 
      message: 'Goal created successfully',
      goal: result.rows[0] 
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update goal
router.put('/:id', authenticateToken, [
  body('title').optional().isLength({ max: 255 }),
  body('description').optional().isLength({ max: 1000 }),
  body('category').optional().isIn(['academic', 'personal', 'future']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('status').optional().isIn(['active', 'completed', 'paused']),
  body('progress').optional().isInt({ min: 0, max: 100 }),
  body('targetDate').optional().isISO8601(),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;
    
    // Check if goal belongs to user
    const goalCheck = await db.query('SELECT * FROM goals WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (goalCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const currentGoal = goalCheck.rows[0];
    
    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        const dbField = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        updateFields.push(`${dbField} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id, req.user.id);

    const result = await db.query(`
      UPDATE goals 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `, values);

    const updatedGoal = result.rows[0];
    
    // Award XP if goal was completed
    if (updates.status === 'completed' && currentGoal.status !== 'completed') {
      await db.query(
        'UPDATE users SET xp = xp + $1, level = FLOOR((xp + $1) / 100) + 1 WHERE id = $2',
        [updatedGoal.xp_reward, req.user.id]
      );
    }

    res.json({ 
      message: 'Goal updated successfully',
      goal: updatedGoal 
    });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update goal position (for drag and drop)
router.put('/:id/position', authenticateToken, [
  body('positionX').isFloat(),
  body('positionY').isFloat()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { positionX, positionY } = req.body;
    
    const result = await db.query(`
      UPDATE goals 
      SET position_x = $1, position_y = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND user_id = $4
      RETURNING *
    `, [positionX, positionY, id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ 
      message: 'Goal position updated',
      goal: result.rows[0] 
    });
  } catch (error) {
    console.error('Update goal position error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add milestone to goal
router.post('/:id/milestones', authenticateToken, [
  body('title').notEmpty().isLength({ max: 255 }),
  body('description').optional().isLength({ max: 500 }),
  body('targetDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, targetDate } = req.body;
    
    // Get current milestones
    const goalResult = await db.query(
      'SELECT milestones FROM goals WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    
    if (goalResult.rows.length === 0) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const currentMilestones = goalResult.rows[0].milestones || [];
    const newMilestone = {
      id: Date.now().toString(),
      title,
      description,
      targetDate,
      completed: false,
      createdAt: new Date().toISOString()
    };

    const updatedMilestones = [...currentMilestones, newMilestone];

    await db.query(
      'UPDATE goals SET milestones = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3',
      [JSON.stringify(updatedMilestones), id, req.user.id]
    );

    res.json({ 
      message: 'Milestone added successfully',
      milestone: newMilestone,
      milestones: updatedMilestones
    });
  } catch (error) {
    console.error('Add milestone error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Complete milestone
router.put('/:id/milestones/:milestoneId/complete', authenticateToken, async (req, res) => {
  try {
    const { id, milestoneId } = req.params;
    
    // Get current milestones
    const goalResult = await db.query(
      'SELECT milestones FROM goals WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    
    if (goalResult.rows.length === 0) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const milestones = goalResult.rows[0].milestones || [];
    const milestoneIndex = milestones.findIndex(m => m.id === milestoneId);
    
    if (milestoneIndex === -1) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    milestones[milestoneIndex].completed = true;
    milestones[milestoneIndex].completedAt = new Date().toISOString();

    await db.query(
      'UPDATE goals SET milestones = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3',
      [JSON.stringify(milestones), id, req.user.id]
    );

    // Award XP for milestone completion
    await db.query(
      'UPDATE users SET xp = xp + 5, level = FLOOR((xp + 5) / 100) + 1 WHERE id = $1',
      [req.user.id]
    );

    res.json({ 
      message: 'Milestone completed!',
      milestones
    });
  } catch (error) {
    console.error('Complete milestone error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete goal
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get goal statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_goals,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_goals,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_goals,
        COUNT(CASE WHEN status = 'paused' THEN 1 END) as paused_goals,
        COUNT(CASE WHEN category = 'academic' THEN 1 END) as academic_goals,
        COUNT(CASE WHEN category = 'personal' THEN 1 END) as personal_goals,
        COUNT(CASE WHEN category = 'future' THEN 1 END) as future_goals,
        AVG(progress) as average_progress
      FROM goals 
      WHERE user_id = $1
    `, [req.user.id]);

    const stats = result.rows[0];
    
    res.json({ 
      stats: {
        totalGoals: parseInt(stats.total_goals),
        completedGoals: parseInt(stats.completed_goals),
        activeGoals: parseInt(stats.active_goals),
        pausedGoals: parseInt(stats.paused_goals),
        academicGoals: parseInt(stats.academic_goals),
        personalGoals: parseInt(stats.personal_goals),
        futureGoals: parseInt(stats.future_goals),
        averageProgress: parseFloat(stats.average_progress) || 0
      }
    });
  } catch (error) {
    console.error('Get goal stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;