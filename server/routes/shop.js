const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Get all shop items
router.get('/items', authenticateToken, async (req, res) => {
  try {
    const { category, rarity } = req.query;
    
    let whereClause = 'WHERE active = true';
    const params = [];
    let paramCount = 1;
    
    if (category) {
      whereClause += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }
    
    if (rarity) {
      whereClause += ` AND rarity = $${paramCount}`;
      params.push(rarity);
      paramCount++;
    }
    
    const result = await db.query(`
      SELECT si.*, 
        CASE WHEN ui.id IS NOT NULL THEN true ELSE false END as owned,
        ui.quantity,
        ui.equipped
      FROM shop_items si
      LEFT JOIN user_inventory ui ON si.id = ui.item_id AND ui.user_id = $${paramCount}
      ${whereClause}
      ORDER BY 
        CASE rarity 
          WHEN 'legendary' THEN 4
          WHEN 'epic' THEN 3
          WHEN 'rare' THEN 2
          ELSE 1
        END DESC,
        si.price ASC
    `, [...params, req.user.id]);

    res.json({ items: result.rows });
  } catch (error) {
    console.error('Get shop items error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Purchase item
router.post('/purchase/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get item details
    const itemResult = await db.query('SELECT * FROM shop_items WHERE id = $1 AND active = true', [id]);
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found or inactive' });
    }
    
    const item = itemResult.rows[0];
    
    // Check if user has enough coins
    const userResult = await db.query('SELECT coins FROM users WHERE id = $1', [req.user.id]);
    const userCoins = userResult.rows[0].coins;
    
    if (userCoins < item.price) {
      return res.status(400).json({ message: 'Insufficient coins' });
    }
    
    // Check if user already owns the item
    const inventoryResult = await db.query(
      'SELECT * FROM user_inventory WHERE user_id = $1 AND item_id = $2',
      [req.user.id, id]
    );
    
    if (inventoryResult.rows.length > 0) {
      return res.status(400).json({ message: 'Item already owned' });
    }
    
    // Check requirements
    if (item.requirements && Object.keys(item.requirements).length > 0) {
      const userDetailsResult = await db.query(
        'SELECT level, badges FROM users WHERE id = $1',
        [req.user.id]
      );
      const userDetails = userDetailsResult.rows[0];
      
      if (item.requirements.level && userDetails.level < item.requirements.level) {
        return res.status(400).json({ 
          message: `Requires level ${item.requirements.level}` 
        });
      }
      
      if (item.requirements.badges) {
        const userBadgeIds = (userDetails.badges || []).map(b => b.id);
        const requiredBadges = Array.isArray(item.requirements.badges) 
          ? item.requirements.badges 
          : [item.requirements.badges];
        
        const hasAllBadges = requiredBadges.every(badgeId => userBadgeIds.includes(badgeId));
        if (!hasAllBadges) {
          return res.status(400).json({ 
            message: 'Missing required badges' 
          });
        }
      }
    }
    
    // Process purchase
    await db.query('BEGIN');
    
    try {
      // Deduct coins
      await db.query('UPDATE users SET coins = coins - $1 WHERE id = $2', [item.price, req.user.id]);
      
      // Add to inventory
      await db.query(
        'INSERT INTO user_inventory (user_id, item_id) VALUES ($1, $2)',
        [req.user.id, id]
      );
      
      await db.query('COMMIT');
      
      res.json({ 
        message: 'Item purchased successfully!',
        item,
        coinsRemaining: userCoins - item.price
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Purchase item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user inventory
router.get('/inventory', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT ui.*, si.name, si.description, si.category, si.rarity, si.image_url, si.effects
      FROM user_inventory ui
      JOIN shop_items si ON ui.item_id = si.id
      WHERE ui.user_id = $1
      ORDER BY ui.purchased_at DESC
    `, [req.user.id]);

    res.json({ inventory: result.rows });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Equip/Unequip item
router.put('/inventory/:id/equip', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { equipped } = req.body;
    
    // Check if item belongs to user
    const inventoryResult = await db.query(
      'SELECT ui.*, si.category FROM user_inventory ui JOIN shop_items si ON ui.item_id = si.id WHERE ui.id = $1 AND ui.user_id = $2',
      [id, req.user.id]
    );
    
    if (inventoryResult.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found in inventory' });
    }
    
    const inventoryItem = inventoryResult.rows[0];
    
    // If equipping, unequip other items of same category
    if (equipped) {
      await db.query(
        'UPDATE user_inventory SET equipped = false WHERE user_id = $1 AND item_id IN (SELECT id FROM shop_items WHERE category = $2)',
        [req.user.id, inventoryItem.category]
      );
    }
    
    // Update item equipped status
    await db.query(
      'UPDATE user_inventory SET equipped = $1 WHERE id = $2',
      [equipped, id]
    );
    
    res.json({ 
      message: equipped ? 'Item equipped!' : 'Item unequipped',
      equipped 
    });
  } catch (error) {
    console.error('Equip item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;