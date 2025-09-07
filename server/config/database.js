const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Database initialization and table creation
async function initialize() {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connection established');
    
    // Create tables if they don't exist
    await createTables();
    
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

async function createTables() {
  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255),
      google_id VARCHAR(255) UNIQUE,
      avatar_url TEXT,
      display_name VARCHAR(100),
      bio TEXT,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      coins INTEGER DEFAULT 100,
      streak_count INTEGER DEFAULT 0,
      last_activity DATE DEFAULT CURRENT_DATE,
      badges JSONB DEFAULT '[]',
      settings JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Goals table (LyfeBoard)
    `CREATE TABLE IF NOT EXISTS goals (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(50) NOT NULL, -- academic, personal, future
      priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
      status VARCHAR(20) DEFAULT 'active', -- active, completed, paused
      progress INTEGER DEFAULT 0, -- 0-100
      target_date DATE,
      xp_reward INTEGER DEFAULT 10,
      position_x FLOAT DEFAULT 0,
      position_y FLOAT DEFAULT 0,
      color VARCHAR(7) DEFAULT '#6366f1',
      milestones JSONB DEFAULT '[]',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Challenges table (VybeStrike)
    `CREATE TABLE IF NOT EXISTS challenges (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(50) NOT NULL, -- fitness, creativity, social, academic, mindfulness
      difficulty VARCHAR(20) DEFAULT 'easy', -- easy, medium, hard, legendary
      xp_reward INTEGER NOT NULL,
      coin_reward INTEGER DEFAULT 0,
      duration_days INTEGER DEFAULT 1,
      is_daily BOOLEAN DEFAULT true,
      requirements JSONB DEFAULT '{}',
      badge_unlock VARCHAR(100),
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // User Challenges (progress tracking)
    `CREATE TABLE IF NOT EXISTS user_challenges (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
      status VARCHAR(20) DEFAULT 'active', -- active, completed, failed
      progress JSONB DEFAULT '{}',
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP,
      streak_count INTEGER DEFAULT 0,
      UNIQUE(user_id, challenge_id, started_at::date)
    )`,
    
    // Posts table (B-Vyral)
    `CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255),
      content TEXT NOT NULL,
      media_urls JSONB DEFAULT '[]',
      tags JSONB DEFAULT '[]',
      category VARCHAR(50) NOT NULL, -- art, music, writing, coding, other
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      is_featured BOOLEAN DEFAULT false,
      moderation_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
      visibility VARCHAR(20) DEFAULT 'public', -- public, friends, private
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Comments table
    `CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      likes_count INTEGER DEFAULT 0,
      moderation_status VARCHAR(20) DEFAULT 'approved',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Likes table
    `CREATE TABLE IF NOT EXISTS likes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
      comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, post_id),
      UNIQUE(user_id, comment_id)
    )`,
    
    // Shop Items table (V-Shop)
    `CREATE TABLE IF NOT EXISTS shop_items (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(50) NOT NULL, -- avatar, badge, theme, power-up
      rarity VARCHAR(20) DEFAULT 'common', -- common, rare, epic, legendary
      price INTEGER NOT NULL,
      image_url TEXT,
      requirements JSONB DEFAULT '{}', -- level, badges, etc.
      effects JSONB DEFAULT '{}', -- what the item does
      limited_time BOOLEAN DEFAULT false,
      available_until TIMESTAMP,
      stock_limit INTEGER,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // User Inventory
    `CREATE TABLE IF NOT EXISTS user_inventory (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      item_id INTEGER REFERENCES shop_items(id) ON DELETE CASCADE,
      quantity INTEGER DEFAULT 1,
      equipped BOOLEAN DEFAULT false,
      purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, item_id)
    )`,
    
    // Budgeting (MoneyMoves)
    `CREATE TABLE IF NOT EXISTS budgets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      spent_amount DECIMAL(10,2) DEFAULT 0,
      category VARCHAR(50) NOT NULL,
      period VARCHAR(20) DEFAULT 'monthly', -- weekly, monthly, yearly
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      quest_completed BOOLEAN DEFAULT false,
      xp_reward INTEGER DEFAULT 20,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Budget Transactions
    `CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      budget_id INTEGER REFERENCES budgets(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      amount DECIMAL(10,2) NOT NULL,
      description VARCHAR(255),
      category VARCHAR(50),
      transaction_date DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Mentorship (VybeZone)
    `CREATE TABLE IF NOT EXISTS mentorship_connections (
      id SERIAL PRIMARY KEY,
      mentor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      mentee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(20) DEFAULT 'pending', -- pending, active, completed, cancelled
      focus_areas JSONB DEFAULT '[]',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(mentor_id, mentee_id)
    )`,
    
    // Chat Messages
    `CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      connection_id INTEGER REFERENCES mentorship_connections(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      message_type VARCHAR(20) DEFAULT 'text', -- text, image, file
      read_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // AI Conversations (Skrybe)
    `CREATE TABLE IF NOT EXISTS ai_conversations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255),
      messages JSONB DEFAULT '[]',
      context_type VARCHAR(50) DEFAULT 'general', -- general, creative, academic
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const tableSQL of tables) {
    await pool.query(tableSQL);
  }
  
  // Create indexes for better performance
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
    'CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC)',
    'CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id)',
    'CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id)',
    'CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_chat_messages_participants ON chat_messages(sender_id, receiver_id)',
  ];

  for (const indexSQL of indexes) {
    await pool.query(indexSQL);
  }
  
  console.log('✅ All database tables and indexes created successfully');
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  initialize
};