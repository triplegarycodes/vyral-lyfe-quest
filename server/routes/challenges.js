const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Get all available challenges
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    
    let whereClause = 'WHERE active = true';
    const params = [];
    let paramCount = 1;
    
    if (category) {
      whereClause += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }
    
    if (difficulty) {
      whereClause += ` AND difficulty = $${paramCount}`;
      params.push(difficulty);
      paramCount++;
    }
    
    const result = await db.query(`
      SELECT c.*, 
        CASE 
          WHEN uc.id IS NOT NULL THEN uc.status
          ELSE 'not_started'
        END as user_status,
        uc.progress,
        uc.streak_count,
        uc.started_at,
        uc.completed_at
      FROM challenges c
      LEFT JOIN user_challenges uc ON c.id = uc.challenge_id 
        AND uc.user_id = $${paramCount}
        AND DATE(uc.started_at) = CURRENT_DATE
      ${whereClause}
      ORDER BY c.difficulty DESC, c.xp_reward DESC
    `, [...params, req.user.id]);

    res.json({ challenges: result.rows });
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get daily challenges
router.get('/daily', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, 
        CASE 
          WHEN uc.id IS NOT NULL THEN uc.status
          ELSE 'not_started'
        END as user_status,
        uc.progress,
        uc.streak_count,
        uc.started_at,
        uc.completed_at
      FROM challenges c
      LEFT JOIN user_challenges uc ON c.id = uc.challenge_id 
        AND uc.user_id = $1
        AND DATE(uc.started_at) = CURRENT_DATE
      WHERE c.is_daily = true AND c.active = true
      ORDER BY 
        CASE WHEN uc.status = 'completed' THEN 1 ELSE 0 END,
        c.difficulty DESC
      LIMIT 5
    `, [req.user.id]);

    res.json({ dailyChallenges: result.rows });
  } catch (error) {
    console.error('Get daily challenges error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start a challenge
router.post('/:id/start', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if challenge exists and is active
    const challengeResult = await db.query(
      'SELECT * FROM challenges WHERE id = $1 AND active = true',
      [id]
    );
    
    if (challengeResult.rows.length === 0) {
      return res.status(404).json({ message: 'Challenge not found or inactive' });
    }

    const challenge = challengeResult.rows[0];
    
    // Check if user already has this challenge active today
    const existingResult = await db.query(`
      SELECT * FROM user_challenges 
      WHERE user_id = $1 AND challenge_id = $2 
      AND DATE(started_at) = CURRENT_DATE
    `, [req.user.id, id]);
    
    if (existingResult.rows.length > 0) {
      return res.status(400).json({ message: 'Challenge already started today' });
    }

    // Start the challenge
    const result = await db.query(`
      INSERT INTO user_challenges (user_id, challenge_id, progress)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [req.user.id, id, JSON.stringify({ started: true })]);

    res.json({ 
      message: 'Challenge started successfully!',
      userChallenge: result.rows[0],
      challenge
    });
  } catch (error) {
    console.error('Start challenge error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update challenge progress
router.put('/:id/progress', authenticateToken, [
  body('progress').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { progress } = req.body;
    
    // Get current user challenge
    const userChallengeResult = await db.query(`
      SELECT uc.*, c.xp_reward, c.coin_reward, c.requirements, c.badge_unlock
      FROM user_challenges uc
      JOIN challenges c ON uc.challenge_id = c.id
      WHERE uc.user_id = $1 AND uc.challenge_id = $2 
      AND DATE(uc.started_at) = CURRENT_DATE
      AND uc.status = 'active'
    `, [req.user.id, id]);
    
    if (userChallengeResult.rows.length === 0) {
      return res.status(404).json({ message: 'Active challenge not found for today' });
    }

    const userChallenge = userChallengeResult.rows[0];
    const updatedProgress = { ...userChallenge.progress, ...progress };
    
    // Check if challenge is completed based on requirements
    const isCompleted = checkChallengeCompletion(updatedProgress, userChallenge.requirements);
    
    let updateQuery = `
      UPDATE user_challenges 
      SET progress = $1, updated_at = CURRENT_TIMESTAMP
    `;
    const params = [JSON.stringify(updatedProgress)];
    let paramCount = 2;
    
    if (isCompleted && userChallenge.status !== 'completed') {
      updateQuery += `, status = 'completed', completed_at = CURRENT_TIMESTAMP`;
      
      // Award XP and coins
      await db.query(
        'UPDATE users SET xp = xp + $1, coins = coins + $2, level = FLOOR((xp + $1) / 100) + 1 WHERE id = $3',
        [userChallenge.xp_reward, userChallenge.coin_reward || 0, req.user.id]
      );
      
      // Update streak
      await updateChallengeStreak(req.user.id, id);
      
      // Award badge if specified
      if (userChallenge.badge_unlock) {
        await awardBadge(req.user.id, userChallenge.badge_unlock);
      }
    }
    
    updateQuery += ` WHERE id = $${paramCount} RETURNING *`;
    params.push(userChallenge.id);
    
    const result = await db.query(updateQuery, params);

    res.json({ 
      message: isCompleted ? 'Challenge completed! 🎉' : 'Progress updated',
      userChallenge: result.rows[0],
      completed: isCompleted,
      xpAwarded: isCompleted ? userChallenge.xp_reward : 0
    });
  } catch (error) {
    console.error('Update challenge progress error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's challenge history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const result = await db.query(`
      SELECT uc.*, c.title, c.description, c.category, c.difficulty, c.xp_reward
      FROM user_challenges uc
      JOIN challenges c ON uc.challenge_id = c.id
      WHERE uc.user_id = $1
      ORDER BY uc.started_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, parseInt(limit), parseInt(offset)]);

    res.json({ history: result.rows });
  } catch (error) {
    console.error('Get challenge history error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get challenge statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_attempts,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_challenges,
        COUNT(CASE WHEN DATE(started_at) = CURRENT_DATE THEN 1 END) as today_attempts,
        COUNT(CASE WHEN DATE(started_at) = CURRENT_DATE AND status = 'completed' THEN 1 END) as today_completed,
        MAX(streak_count) as best_streak,
        AVG(CASE WHEN status = 'completed' THEN 1.0 ELSE 0.0 END) * 100 as completion_rate
      FROM user_challenges 
      WHERE user_id = $1
    `, [req.user.id]);

    const stats = result.rows[0];
    
    // Get category breakdown
    const categoryResult = await db.query(`
      SELECT c.category, 
        COUNT(*) as attempts,
        COUNT(CASE WHEN uc.status = 'completed' THEN 1 END) as completed
      FROM user_challenges uc
      JOIN challenges c ON uc.challenge_id = c.id
      WHERE uc.user_id = $1
      GROUP BY c.category
      ORDER BY completed DESC
    `, [req.user.id]);

    res.json({ 
      stats: {
        totalAttempts: parseInt(stats.total_attempts),
        completedChallenges: parseInt(stats.completed_challenges),
        todayAttempts: parseInt(stats.today_attempts),
        todayCompleted: parseInt(stats.today_completed),
        bestStreak: parseInt(stats.best_streak) || 0,
        completionRate: parseFloat(stats.completion_rate) || 0
      },
      categoryBreakdown: categoryResult.rows
    });
  } catch (error) {
    console.error('Get challenge stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Helper functions
function checkChallengeCompletion(progress, requirements) {
  if (!requirements || Object.keys(requirements).length === 0) {
    return progress.completed === true;
  }
  
  // Check each requirement
  for (const [key, requiredValue] of Object.entries(requirements)) {
    const currentValue = progress[key];
    
    if (typeof requiredValue === 'number') {
      if (!currentValue || currentValue < requiredValue) {
        return false;
      }
    } else if (typeof requiredValue === 'boolean') {
      if (currentValue !== requiredValue) {
        return false;
      }
    } else if (Array.isArray(requiredValue)) {
      if (!currentValue || !requiredValue.every(item => currentValue.includes(item))) {
        return false;
      }
    }
  }
  
  return true;
}

async function updateChallengeStreak(userId, challengeId) {
  try {
    // Get yesterday's challenge attempt
    const yesterdayResult = await db.query(`
      SELECT status FROM user_challenges 
      WHERE user_id = $1 AND challenge_id = $2 
      AND DATE(started_at) = CURRENT_DATE - INTERVAL '1 day'
    `, [userId, challengeId]);
    
    let newStreak = 1;
    
    if (yesterdayResult.rows.length > 0 && yesterdayResult.rows[0].status === 'completed') {
      // Continue streak
      const currentStreakResult = await db.query(`
        SELECT MAX(streak_count) as max_streak
        FROM user_challenges 
        WHERE user_id = $1 AND challenge_id = $2
      `, [userId, challengeId]);
      
      newStreak = (currentStreakResult.rows[0].max_streak || 0) + 1;
    }
    
    // Update today's challenge with new streak
    await db.query(`
      UPDATE user_challenges 
      SET streak_count = $1
      WHERE user_id = $2 AND challenge_id = $3 
      AND DATE(started_at) = CURRENT_DATE
    `, [newStreak, userId, challengeId]);
    
    return newStreak;
  } catch (error) {
    console.error('Update challenge streak error:', error);
    return 1;
  }
}

async function awardBadge(userId, badgeId) {
  try {
    const badgeDefinitions = {
      'first_challenge': {
        name: 'First Steps',
        description: 'Completed your first challenge!',
        iconUrl: '/badges/first_challenge.png'
      },
      'streak_7': {
        name: 'Week Warrior',
        description: '7-day challenge streak!',
        iconUrl: '/badges/streak_7.png'
      },
      'fitness_master': {
        name: 'Fitness Master',
        description: 'Completed 10 fitness challenges',
        iconUrl: '/badges/fitness_master.png'
      }
      // Add more badge definitions
    };
    
    const badgeInfo = badgeDefinitions[badgeId];
    if (!badgeInfo) return;
    
    // Check if user already has this badge
    const userResult = await db.query('SELECT badges FROM users WHERE id = $1', [userId]);
    const currentBadges = userResult.rows[0].badges || [];
    
    const hasBadge = currentBadges.some(badge => badge.id === badgeId);
    if (hasBadge) return;

    const newBadge = {
      id: badgeId,
      ...badgeInfo,
      awardedAt: new Date().toISOString()
    };

    const updatedBadges = [...currentBadges, newBadge];

    await db.query(
      'UPDATE users SET badges = $1 WHERE id = $2',
      [JSON.stringify(updatedBadges), userId]
    );
  } catch (error) {
    console.error('Award badge error:', error);
  }
}

module.exports = router;