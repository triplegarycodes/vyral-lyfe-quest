const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Get feed posts
router.get('/feed', optionalAuth, async (req, res) => {
  try {
    const { limit = 20, offset = 0, category, featured } = req.query;
    
    let whereClause = "WHERE p.moderation_status = 'approved' AND p.visibility = 'public'";
    const params = [];
    let paramCount = 1;
    
    if (category) {
      whereClause += ` AND p.category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }
    
    if (featured === 'true') {
      whereClause += ` AND p.is_featured = true`;
    }
    
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await db.query(`
      SELECT 
        p.*,
        u.username,
        u.display_name,
        u.avatar_url,
        u.level,
        u.badges,
        ${req.user ? `
        CASE WHEN l.id IS NOT NULL THEN true ELSE false END as user_liked
        ` : 'false as user_liked'}
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ${req.user ? `
      LEFT JOIN likes l ON p.id = l.post_id AND l.user_id = ${req.user.id}
      ` : ''}
      ${whereClause}
      ORDER BY 
        CASE WHEN p.is_featured THEN 0 ELSE 1 END,
        p.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `, params);

    res.json({ posts: result.rows });
  } catch (error) {
    console.error('Get feed posts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's posts
router.get('/user/:username', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    // Get user ID
    const userResult = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userId = userResult.rows[0].id;
    const isOwnProfile = req.user && req.user.id === userId;
    
    let whereClause = "WHERE p.user_id = $1 AND p.moderation_status = 'approved'";
    if (!isOwnProfile) {
      whereClause += " AND p.visibility = 'public'";
    }
    
    const result = await db.query(`
      SELECT 
        p.*,
        u.username,
        u.display_name,
        u.avatar_url,
        u.level,
        u.badges,
        ${req.user ? `
        CASE WHEN l.id IS NOT NULL THEN true ELSE false END as user_liked
        ` : 'false as user_liked'}
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ${req.user ? `
      LEFT JOIN likes l ON p.id = l.post_id AND l.user_id = ${req.user.id}
      ` : ''}
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, parseInt(limit), parseInt(offset)]);

    res.json({ posts: result.rows });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create post
router.post('/', authenticateToken, [
  body('title').optional().isLength({ max: 255 }),
  body('content').notEmpty().isLength({ max: 5000 }),
  body('category').isIn(['art', 'music', 'writing', 'coding', 'other']),
  body('tags').optional().isArray(),
  body('mediaUrls').optional().isArray(),
  body('visibility').optional().isIn(['public', 'friends', 'private'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      title, 
      content, 
      category, 
      tags = [], 
      mediaUrls = [], 
      visibility = 'public' 
    } = req.body;

    const result = await db.query(`
      INSERT INTO posts (user_id, title, content, category, tags, media_urls, visibility)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [req.user.id, title, content, category, JSON.stringify(tags), JSON.stringify(mediaUrls), visibility]);

    // Award XP for posting
    await db.query(
      'UPDATE users SET xp = xp + 15, level = FLOOR((xp + 15) / 100) + 1 WHERE id = $1',
      [req.user.id]
    );

    res.status(201).json({ 
      message: 'Post created successfully!',
      post: result.rows[0] 
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single post
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      SELECT 
        p.*,
        u.username,
        u.display_name,
        u.avatar_url,
        u.level,
        u.badges,
        ${req.user ? `
        CASE WHEN l.id IS NOT NULL THEN true ELSE false END as user_liked
        ` : 'false as user_liked'}
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ${req.user ? `
      LEFT JOIN likes l ON p.id = l.post_id AND l.user_id = ${req.user.id}
      ` : ''}
      WHERE p.id = $1 AND p.moderation_status = 'approved'
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Get comments
    const commentsResult = await db.query(`
      SELECT 
        c.*,
        u.username,
        u.display_name,
        u.avatar_url,
        u.level,
        ${req.user ? `
        CASE WHEN l.id IS NOT NULL THEN true ELSE false END as user_liked
        ` : 'false as user_liked'}
      FROM comments c
      JOIN users u ON c.user_id = u.id
      ${req.user ? `
      LEFT JOIN likes l ON c.id = l.comment_id AND l.user_id = ${req.user.id}
      ` : ''}
      WHERE c.post_id = $1 AND c.moderation_status = 'approved'
      ORDER BY c.created_at ASC
    `, [id]);

    res.json({ 
      post: result.rows[0],
      comments: commentsResult.rows
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update post
router.put('/:id', authenticateToken, [
  body('title').optional().isLength({ max: 255 }),
  body('content').optional().isLength({ max: 5000 }),
  body('tags').optional().isArray(),
  body('visibility').optional().isIn(['public', 'friends', 'private'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;
    
    // Check if post belongs to user
    const postCheck = await db.query('SELECT * FROM posts WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        const dbField = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        updateFields.push(`${dbField} = $${paramCount}`);
        
        if (key === 'tags') {
          values.push(JSON.stringify(updates[key]));
        } else {
          values.push(updates[key]);
        }
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateFields.push('moderation_status = \'pending\''); // Re-moderate after edit
    values.push(id, req.user.id);

    const result = await db.query(`
      UPDATE posts 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `, values);

    res.json({ 
      message: 'Post updated successfully',
      post: result.rows[0] 
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete post
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Like/Unlike post
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if post exists
    const postResult = await db.query('SELECT * FROM posts WHERE id = $1', [id]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if already liked
    const likeResult = await db.query(
      'SELECT * FROM likes WHERE user_id = $1 AND post_id = $2',
      [req.user.id, id]
    );
    
    if (likeResult.rows.length > 0) {
      // Unlike
      await db.query('DELETE FROM likes WHERE user_id = $1 AND post_id = $2', [req.user.id, id]);
      await db.query('UPDATE posts SET likes_count = likes_count - 1 WHERE id = $1', [id]);
      
      res.json({ message: 'Post unliked', liked: false });
    } else {
      // Like
      await db.query('INSERT INTO likes (user_id, post_id) VALUES ($1, $2)', [req.user.id, id]);
      await db.query('UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1', [id]);
      
      // Award XP to post author (not self)
      const post = postResult.rows[0];
      if (post.user_id !== req.user.id) {
        await db.query(
          'UPDATE users SET xp = xp + 2, level = FLOOR((xp + 2) / 100) + 1 WHERE id = $1',
          [post.user_id]
        );
      }
      
      res.json({ message: 'Post liked', liked: true });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add comment
router.post('/:id/comments', authenticateToken, [
  body('content').notEmpty().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { content } = req.body;
    
    // Check if post exists
    const postResult = await db.query('SELECT user_id FROM posts WHERE id = $1', [id]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const result = await db.query(`
      INSERT INTO comments (user_id, post_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [req.user.id, id, content]);
    
    // Update comment count
    await db.query('UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1', [id]);
    
    // Award XP for commenting
    await db.query(
      'UPDATE users SET xp = xp + 5, level = FLOOR((xp + 5) / 100) + 1 WHERE id = $1',
      [req.user.id]
    );
    
    // Award XP to post author (if not self)
    const postAuthorId = postResult.rows[0].user_id;
    if (postAuthorId !== req.user.id) {
      await db.query(
        'UPDATE users SET xp = xp + 3, level = FLOOR((xp + 3) / 100) + 1 WHERE id = $1',
        [postAuthorId]
      );
    }

    res.status(201).json({ 
      message: 'Comment added successfully',
      comment: result.rows[0] 
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Like/Unlike comment
router.post('/comments/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if comment exists
    const commentResult = await db.query('SELECT * FROM comments WHERE id = $1', [id]);
    if (commentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if already liked
    const likeResult = await db.query(
      'SELECT * FROM likes WHERE user_id = $1 AND comment_id = $2',
      [req.user.id, id]
    );
    
    if (likeResult.rows.length > 0) {
      // Unlike
      await db.query('DELETE FROM likes WHERE user_id = $1 AND comment_id = $2', [req.user.id, id]);
      await db.query('UPDATE comments SET likes_count = likes_count - 1 WHERE id = $1', [id]);
      
      res.json({ message: 'Comment unliked', liked: false });
    } else {
      // Like
      await db.query('INSERT INTO likes (user_id, comment_id) VALUES ($1, $2)', [req.user.id, id]);
      await db.query('UPDATE comments SET likes_count = likes_count + 1 WHERE id = $1', [id]);
      
      res.json({ message: 'Comment liked', liked: true });
    }
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Search posts
router.get('/search/:query', optionalAuth, async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 20, category } = req.query;
    
    let whereClause = `
      WHERE (p.title ILIKE $1 OR p.content ILIKE $1 OR p.tags::text ILIKE $1)
      AND p.moderation_status = 'approved' AND p.visibility = 'public'
    `;
    const params = [`%${query}%`];
    let paramCount = 2;
    
    if (category) {
      whereClause += ` AND p.category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }
    
    params.push(parseInt(limit));
    
    const result = await db.query(`
      SELECT 
        p.*,
        u.username,
        u.display_name,
        u.avatar_url,
        u.level,
        ${req.user ? `
        CASE WHEN l.id IS NOT NULL THEN true ELSE false END as user_liked
        ` : 'false as user_liked'}
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ${req.user ? `
      LEFT JOIN likes l ON p.id = l.post_id AND l.user_id = ${req.user.id}
      ` : ''}
      ${whereClause}
      ORDER BY p.likes_count DESC, p.created_at DESC
      LIMIT $${paramCount}
    `, params);

    res.json({ posts: result.rows, query });
  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;