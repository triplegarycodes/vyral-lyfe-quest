const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Get user profile by username
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const result = await db.query(`
      SELECT id, username, display_name, avatar_url, bio, xp, level, 
             badges, created_at, streak_count
      FROM users WHERE username = $1
    `, [username]);
    
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user stats
    const statsResult = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM goals WHERE user_id = $1 AND status = 'completed') as completed_goals,
        (SELECT COUNT(*) FROM user_challenges WHERE user_id = $1 AND status = 'completed') as completed_challenges,
        (SELECT COUNT(*) FROM posts WHERE user_id = $1) as total_posts,
        (SELECT COUNT(*) FROM likes WHERE post_id IN (SELECT id FROM posts WHERE user_id = $1)) as total_likes
    `, [user.id]);
    
    const stats = statsResult.rows[0];

    res.json({ 
      user: {
        ...user,
        stats: {
          completedGoals: parseInt(stats.completed_goals),
          completedChallenges: parseInt(stats.completed_challenges),
          totalPosts: parseInt(stats.total_posts),
          totalLikes: parseInt(stats.total_likes)
        }
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get leaderboard
router.get('/leaderboard/top', async (req, res) => {
  try {
    const { limit = 10, period = 'all' } = req.query;
    
    let whereClause = '';
    if (period === 'week') {
      whereClause = "WHERE last_activity >= CURRENT_DATE - INTERVAL '7 days'";
    } else if (period === 'month') {
      whereClause = "WHERE last_activity >= CURRENT_DATE - INTERVAL '30 days'";
    }
    
    const result = await db.query(`
      SELECT username, display_name, avatar_url, xp, level, streak_count, badges
      FROM users 
      ${whereClause}
      ORDER BY xp DESC, level DESC, streak_count DESC
      LIMIT $1
    `, [parseInt(limit)]);

    res.json({ leaderboard: result.rows });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update XP and level
router.post('/xp/add', authenticateToken, async (req, res) => {
  try {
    const { amount, source } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid XP amount' });
    }

    const result = await db.query(`
      UPDATE users 
      SET xp = xp + $1, 
          level = FLOOR((xp + $1) / 100) + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING xp, level
    `, [amount, req.user.id]);

    const user = result.rows[0];
    const newLevel = user.level;
    const oldLevel = Math.floor((user.xp - amount) / 100) + 1;
    const leveledUp = newLevel > oldLevel;

    // Award coins for leveling up
    if (leveledUp) {
      await db.query('UPDATE users SET coins = coins + $1 WHERE id = $2', [newLevel * 10, req.user.id]);
    }

    res.json({ 
      xp: user.xp, 
      level: user.level, 
      leveledUp,
      source 
    });
  } catch (error) {
    console.error('Add XP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Award badge
router.post('/badges/award', authenticateToken, async (req, res) => {
  try {
    const { badgeId, badgeName, description, iconUrl } = req.body;
    
    // Check if user already has this badge
    const userResult = await db.query('SELECT badges FROM users WHERE id = $1', [req.user.id]);
    const currentBadges = userResult.rows[0].badges || [];
    
    const hasBadge = currentBadges.some(badge => badge.id === badgeId);
    if (hasBadge) {
      return res.status(400).json({ message: 'Badge already awarded' });
    }

    const newBadge = {
      id: badgeId,
      name: badgeName,
      description,
      iconUrl,
      awardedAt: new Date().toISOString()
    };

    const updatedBadges = [...currentBadges, newBadge];

    await db.query(
      'UPDATE users SET badges = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [JSON.stringify(updatedBadges), req.user.id]
    );

    res.json({ 
      message: 'Badge awarded successfully',
      badge: newBadge,
      badges: updatedBadges
    });
  } catch (error) {
    console.error('Award badge error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update streak
router.post('/streak/update', authenticateToken, async (req, res) => {
  try {
    const { action } = req.body; // 'increment' or 'reset'
    
    let updateQuery;
    if (action === 'increment') {
      updateQuery = `
        UPDATE users 
        SET streak_count = streak_count + 1,
            last_activity = CURRENT_DATE,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING streak_count
      `;
    } else if (action === 'reset') {
      updateQuery = `
        UPDATE users 
        SET streak_count = 0,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING streak_count
      `;
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const result = await db.query(updateQuery, [req.user.id]);
    const streakCount = result.rows[0].streak_count;

    // Award streak badges
    const streakMilestones = [7, 30, 100, 365];
    for (const milestone of streakMilestones) {
      if (streakCount === milestone) {
        // Award streak badge (simplified - would normally check if already awarded)
        await db.query(`
          UPDATE users 
          SET badges = badges || $1::jsonb
          WHERE id = $2 AND NOT (badges @> $1::jsonb)
        `, [JSON.stringify([{
          id: `streak_${milestone}`,
          name: `${milestone} Day Streak`,
          description: `Maintained a ${milestone} day streak!`,
          iconUrl: '/badges/streak.png',
          awardedAt: new Date().toISOString()
        }]), req.user.id]);
        break;
      }
    }

    res.json({ 
      streakCount,
      message: action === 'increment' ? 'Streak updated!' : 'Streak reset'
    });
  } catch (error) {
    console.error('Update streak error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Search users
router.get('/search/:query', authenticateToken, async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;
    
    const result = await db.query(`
      SELECT id, username, display_name, avatar_url, xp, level
      FROM users 
      WHERE (username ILIKE $1 OR display_name ILIKE $1)
        AND id != $2
      ORDER BY xp DESC
      LIMIT $3
    `, [`%${query}%`, req.user.id, parseInt(limit)]);

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;