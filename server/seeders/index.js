require('dotenv').config();
const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data (in reverse order due to foreign keys)
    await db.query('TRUNCATE TABLE ai_conversations RESTART IDENTITY CASCADE');
    await db.query('TRUNCATE TABLE chat_messages RESTART IDENTITY CASCADE');
    await db.query('TRUNCATE TABLE mentorship_connections RESTART IDENTITY CASCADE');
    await db.query('TRUNCATE TABLE transactions RESTART IDENTITY CASCADE');
    await db.query('TRUNCATE TABLE budgets RESTART IDENTITY CASCADE');
    await db.query('TRUNCATE TABLE user_inventory RESTART IDENTITY CASCADE');
    await db.query('TRUNCATE TABLE shop_items RESTART IDENTITY CASCADE');
    await db.query('TRUNCATE TABLE likes RESTART IDENTITY CASCADE');
    await db.query('TRUNCATE TABLE comments RESTART IDENTITY CASCADE');
    await db.query('TRUNCATE TABLE posts RESTART IDENTITY CASCADE');
    await db.query('TRUNCATE TABLE user_challenges RESTART IDENTITY CASCADE');
    await db.query('TRUNCATE TABLE challenges RESTART IDENTITY CASCADE');
    await db.query('TRUNCATE TABLE goals RESTART IDENTITY CASCADE');
    await db.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
    
    console.log('🗑️ Cleared existing data');
    
    // Seed Users
    const hashedPassword = await bcrypt.hash('password123', 12);
    const users = [
      {
        email: 'alex@vyral.com',
        username: 'alexcreator',
        password_hash: hashedPassword,
        display_name: 'Alex the Creator',
        bio: 'Digital artist and music producer. Always exploring new creative frontiers! 🎨🎵',
        xp: 1250,
        level: 13,
        coins: 450,
        streak_count: 15,
        badges: JSON.stringify([
          { id: 'first_post', name: 'First Post', description: 'Shared your first creation!', iconUrl: '/badges/first_post.png', awardedAt: '2024-01-15T10:30:00Z' },
          { id: 'streak_7', name: 'Week Warrior', description: '7-day challenge streak!', iconUrl: '/badges/streak_7.png', awardedAt: '2024-01-20T09:15:00Z' }
        ]),
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
      },
      {
        email: 'jordan@vyral.com',
        username: 'jordancoder',
        password_hash: hashedPassword,
        display_name: 'Jordan Codes',
        bio: 'Full-stack developer and tech enthusiast. Building the future one line at a time! 💻',
        xp: 890,
        level: 9,
        coins: 320,
        streak_count: 8,
        badges: JSON.stringify([
          { id: 'first_challenge', name: 'First Steps', description: 'Completed your first challenge!', iconUrl: '/badges/first_challenge.png', awardedAt: '2024-01-10T14:20:00Z' }
        ]),
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan'
      },
      {
        email: 'sam@vyral.com',
        username: 'samwriter',
        password_hash: hashedPassword,
        display_name: 'Sam Storyteller',
        bio: 'Aspiring novelist and poet. Words are my paintbrush, stories are my canvas. 📚✍️',
        xp: 567,
        level: 6,
        coins: 180,
        streak_count: 3,
        badges: JSON.stringify([]),
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam'
      },
      {
        email: 'riley@vyral.com',
        username: 'rileymusic',
        password_hash: hashedPassword,
        display_name: 'Riley Beats',
        bio: 'Music producer and DJ. Creating soundscapes that move souls! 🎧🎹',
        xp: 2100,
        level: 21,
        coins: 680,
        streak_count: 25,
        badges: JSON.stringify([
          { id: 'music_master', name: 'Music Master', description: 'Shared 10 music creations!', iconUrl: '/badges/music_master.png', awardedAt: '2024-01-25T16:45:00Z' },
          { id: 'streak_30', name: 'Monthly Legend', description: '30-day challenge streak!', iconUrl: '/badges/streak_30.png', awardedAt: '2024-01-28T08:00:00Z' }
        ]),
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Riley'
      }
    ];
    
    const userResults = [];
    for (const user of users) {
      const result = await db.query(`
        INSERT INTO users (email, username, password_hash, display_name, bio, xp, level, coins, streak_count, badges, avatar_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [user.email, user.username, user.password_hash, user.display_name, user.bio, user.xp, user.level, user.coins, user.streak_count, user.badges, user.avatar_url]);
      userResults.push(result.rows[0]);
    }
    
    console.log('👥 Seeded users');
    
    // Seed Challenges
    const challenges = [
      {
        title: 'Morning Meditation',
        description: 'Start your day with 10 minutes of mindfulness meditation',
        category: 'mindfulness',
        difficulty: 'easy',
        xp_reward: 20,
        coin_reward: 5,
        is_daily: true,
        requirements: JSON.stringify({ minutes: 10 })
      },
      {
        title: 'Creative Sketch',
        description: 'Draw or sketch something that inspires you today',
        category: 'creativity',
        difficulty: 'easy',
        xp_reward: 25,
        coin_reward: 8,
        is_daily: true,
        requirements: JSON.stringify({ completed: true })
      },
      {
        title: 'Code Challenge',
        description: 'Solve a programming problem or learn a new concept',
        category: 'academic',
        difficulty: 'medium',
        xp_reward: 40,
        coin_reward: 15,
        is_daily: true,
        requirements: JSON.stringify({ problems_solved: 1 })
      },
      {
        title: 'Fitness Power Hour',
        description: 'Complete a 30-minute workout or physical activity',
        category: 'fitness',
        difficulty: 'medium',
        xp_reward: 35,
        coin_reward: 12,
        is_daily: true,
        requirements: JSON.stringify({ minutes: 30 })
      },
      {
        title: 'Social Connection',
        description: 'Reach out to a friend or make a new connection',
        category: 'social',
        difficulty: 'easy',
        xp_reward: 30,
        coin_reward: 10,
        is_daily: true,
        requirements: JSON.stringify({ connections_made: 1 })
      },
      {
        title: 'Weekly Art Marathon',
        description: 'Create and share 5 different artworks this week',
        category: 'creativity',
        difficulty: 'hard',
        xp_reward: 100,
        coin_reward: 50,
        duration_days: 7,
        is_daily: false,
        requirements: JSON.stringify({ artworks_created: 5 }),
        badge_unlock: 'art_marathon'
      },
      {
        title: 'Legendary Coder',
        description: 'Complete 10 advanced coding challenges',
        category: 'academic',
        difficulty: 'legendary',
        xp_reward: 200,
        coin_reward: 100,
        duration_days: 14,
        is_daily: false,
        requirements: JSON.stringify({ advanced_problems: 10 }),
        badge_unlock: 'legendary_coder'
      }
    ];
    
    for (const challenge of challenges) {
      await db.query(`
        INSERT INTO challenges (title, description, category, difficulty, xp_reward, coin_reward, duration_days, is_daily, requirements, badge_unlock)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [challenge.title, challenge.description, challenge.category, challenge.difficulty, challenge.xp_reward, challenge.coin_reward, challenge.duration_days, challenge.is_daily, challenge.requirements, challenge.badge_unlock]);
    }
    
    console.log('🎯 Seeded challenges');
    
    // Seed Goals
    const goals = [
      {
        user_id: userResults[0].id,
        title: 'Master Digital Art',
        description: 'Complete advanced digital art course and create portfolio',
        category: 'personal',
        priority: 'high',
        progress: 65,
        target_date: '2024-06-01',
        xp_reward: 100,
        color: '#8b5cf6',
        milestones: JSON.stringify([
          { id: '1', title: 'Complete course modules 1-5', completed: true, completedAt: '2024-01-20T10:00:00Z' },
          { id: '2', title: 'Create 3 portfolio pieces', completed: true, completedAt: '2024-01-25T15:30:00Z' },
          { id: '3', title: 'Get feedback from professionals', completed: false }
        ])
      },
      {
        user_id: userResults[1].id,
        title: 'Build Full-Stack App',
        description: 'Create and deploy a complete web application',
        category: 'academic',
        priority: 'high',
        progress: 40,
        target_date: '2024-05-15',
        xp_reward: 150,
        color: '#06b6d4',
        milestones: JSON.stringify([
          { id: '1', title: 'Design app architecture', completed: true, completedAt: '2024-01-15T09:00:00Z' },
          { id: '2', title: 'Build backend API', completed: false },
          { id: '3', title: 'Create frontend interface', completed: false }
        ])
      },
      {
        user_id: userResults[2].id,
        title: 'Write First Novel',
        description: 'Complete first draft of young adult fantasy novel',
        category: 'personal',
        priority: 'medium',
        progress: 25,
        target_date: '2024-12-31',
        xp_reward: 200,
        color: '#f59e0b',
        milestones: JSON.stringify([
          { id: '1', title: 'Outline complete story', completed: true, completedAt: '2024-01-10T20:00:00Z' },
          { id: '2', title: 'Write first 10 chapters', completed: false },
          { id: '3', title: 'Complete first draft', completed: false }
        ])
      }
    ];
    
    for (const goal of goals) {
      await db.query(`
        INSERT INTO goals (user_id, title, description, category, priority, progress, target_date, xp_reward, color, milestones)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [goal.user_id, goal.title, goal.description, goal.category, goal.priority, goal.progress, goal.target_date, goal.xp_reward, goal.color, goal.milestones]);
    }
    
    console.log('🎯 Seeded goals');
    
    // Seed Posts
    const posts = [
      {
        user_id: userResults[0].id,
        title: 'Digital Art Process: Cyberpunk Character',
        content: 'Just finished this cyberpunk character design! The process involved sketching in Procreate, then moving to Photoshop for the detailed rendering. I love how the neon colors turned out against the dark background. What do you think? 🎨✨\n\n#digitalart #cyberpunk #characterdesign',
        category: 'art',
        tags: JSON.stringify(['digitalart', 'cyberpunk', 'characterdesign', 'neon']),
        media_urls: JSON.stringify(['https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800']),
        likes_count: 24,
        comments_count: 8,
        moderation_status: 'approved',
        is_featured: true
      },
      {
        user_id: userResults[1].id,
        title: 'My React Learning Journey',
        content: 'Been diving deep into React hooks lately and wow, they\'ve changed everything! useEffect and useState are game-changers. Just built a todo app with custom hooks and I\'m amazed at how clean the code is. Anyone else loving the new React features? 🚀\n\nNext up: exploring React Query for state management!',
        category: 'coding',
        tags: JSON.stringify(['react', 'javascript', 'hooks', 'webdev']),
        likes_count: 18,
        comments_count: 5,
        moderation_status: 'approved'
      },
      {
        user_id: userResults[2].id,
        title: 'Short Story: The Last Library',
        content: 'Here\'s a short story I wrote today:\n\n"In a world where books were forgotten, Maya discovered the last library hidden beneath the city. As she opened the first book, words began to glow, and she realized she wasn\'t just reading stories—she was bringing them back to life."\n\nWhat happens next? Drop your ideas in the comments! 📚✨',
        category: 'writing',
        tags: JSON.stringify(['shortstory', 'fantasy', 'writing', 'creative']),
        likes_count: 15,
        comments_count: 12,
        moderation_status: 'approved'
      },
      {
        user_id: userResults[3].id,
        title: 'New Track: Neon Dreams',
        content: 'Just dropped my latest track "Neon Dreams" - a synthwave journey through a digital landscape! 🎵 Mixed with vintage synths and modern beats. This one\'s for all the night owls and dreamers out there.\n\nLet me know what you think! Your feedback means everything to me. 🎧',
        category: 'music',
        tags: JSON.stringify(['synthwave', 'electronic', 'newtrack', 'neon']),
        media_urls: JSON.stringify(['https://www.soundcloud.com/example-track']),
        likes_count: 31,
        comments_count: 9,
        moderation_status: 'approved',
        is_featured: true
      }
    ];
    
    const postResults = [];
    for (const post of posts) {
      const result = await db.query(`
        INSERT INTO posts (user_id, title, content, category, tags, media_urls, likes_count, comments_count, moderation_status, is_featured)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [post.user_id, post.title, post.content, post.category, post.tags, post.media_urls, post.likes_count, post.comments_count, post.moderation_status, post.is_featured]);
      postResults.push(result.rows[0]);
    }
    
    console.log('📝 Seeded posts');
    
    // Seed Comments
    const comments = [
      {
        user_id: userResults[1].id,
        post_id: postResults[0].id,
        content: 'This is incredible! The lighting effects are so well done. What brushes did you use for the neon glow?'
      },
      {
        user_id: userResults[2].id,
        post_id: postResults[0].id,
        content: 'Amazing work! The character has so much personality. I can almost hear their story.'
      },
      {
        user_id: userResults[3].id,
        post_id: postResults[1].id,
        content: 'React hooks are a game changer! Have you tried useReducer for more complex state management?'
      },
      {
        user_id: userResults[0].id,
        post_id: postResults[2].id,
        content: 'Love this concept! Maybe Maya discovers that each book contains a trapped soul waiting to be freed?'
      },
      {
        user_id: userResults[1].id,
        post_id: postResults[3].id,
        content: 'This track is fire! 🔥 The synth layers are perfect. Definitely going on my coding playlist!'
      }
    ];
    
    for (const comment of comments) {
      await db.query(`
        INSERT INTO comments (user_id, post_id, content)
        VALUES ($1, $2, $3)
      `, [comment.user_id, comment.post_id, comment.content]);
    }
    
    console.log('💬 Seeded comments');
    
    // Seed Shop Items
    const shopItems = [
      {
        name: 'Neon Avatar Frame',
        description: 'Electrifying neon frame that pulses with energy around your avatar',
        category: 'avatar',
        rarity: 'rare',
        price: 150,
        image_url: '/shop/neon-frame.png',
        effects: JSON.stringify({ glowColor: '#00ffff', animation: 'pulse' })
      },
      {
        name: 'Cyberpunk Theme',
        description: 'Dark theme with neon accents and futuristic UI elements',
        category: 'theme',
        rarity: 'epic',
        price: 300,
        image_url: '/shop/cyberpunk-theme.png',
        requirements: JSON.stringify({ level: 10 }),
        effects: JSON.stringify({ theme: 'cyberpunk', colors: ['#ff00ff', '#00ffff', '#ffff00'] })
      },
      {
        name: 'XP Boost Potion',
        description: 'Double XP for the next 24 hours! Perfect for leveling up fast',
        category: 'power-up',
        rarity: 'common',
        price: 50,
        image_url: '/shop/xp-boost.png',
        effects: JSON.stringify({ xpMultiplier: 2, duration: 86400 })
      },
      {
        name: 'Legendary Creator Badge',
        description: 'Exclusive badge for the most creative souls in VYRAL',
        category: 'badge',
        rarity: 'legendary',
        price: 1000,
        image_url: '/shop/creator-badge.png',
        requirements: JSON.stringify({ level: 25, badges: ['art_master', 'music_master'] }),
        effects: JSON.stringify({ status: 'legendary_creator' })
      },
      {
        name: 'Glitch Effect Avatar',
        description: 'Make your avatar glitch with cool digital distortion effects',
        category: 'avatar',
        rarity: 'epic',
        price: 250,
        image_url: '/shop/glitch-avatar.png',
        requirements: JSON.stringify({ level: 15 }),
        effects: JSON.stringify({ animation: 'glitch', intensity: 'medium' })
      }
    ];
    
    for (const item of shopItems) {
      await db.query(`
        INSERT INTO shop_items (name, description, category, rarity, price, image_url, requirements, effects)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [item.name, item.description, item.category, item.rarity, item.price, item.image_url, item.requirements, item.effects]);
    }
    
    console.log('🛒 Seeded shop items');
    
    // Seed some user challenges (completed ones)
    const userChallenges = [
      {
        user_id: userResults[0].id,
        challenge_id: 1, // Morning Meditation
        status: 'completed',
        progress: JSON.stringify({ minutes: 15, completed: true }),
        completed_at: new Date(),
        streak_count: 15
      },
      {
        user_id: userResults[0].id,
        challenge_id: 2, // Creative Sketch
        status: 'completed',
        progress: JSON.stringify({ completed: true, artwork_type: 'digital_portrait' }),
        completed_at: new Date(),
        streak_count: 12
      },
      {
        user_id: userResults[1].id,
        challenge_id: 3, // Code Challenge
        status: 'completed',
        progress: JSON.stringify({ problems_solved: 2, difficulty: 'medium' }),
        completed_at: new Date(),
        streak_count: 8
      }
    ];
    
    for (const userChallenge of userChallenges) {
      await db.query(`
        INSERT INTO user_challenges (user_id, challenge_id, status, progress, completed_at, streak_count)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [userChallenge.user_id, userChallenge.challenge_id, userChallenge.status, userChallenge.progress, userChallenge.completed_at, userChallenge.streak_count]);
    }
    
    console.log('🏆 Seeded user challenges');
    
    // Seed mentorship connections
    await db.query(`
      INSERT INTO mentorship_connections (mentor_id, mentee_id, status, focus_areas)
      VALUES ($1, $2, 'active', $3)
    `, [userResults[3].id, userResults[2].id, JSON.stringify(['music_production', 'creative_process'])]);
    
    console.log('🤝 Seeded mentorship connections');
    
    console.log('✅ Database seeding completed successfully!');
    console.log('\n🎮 VYRAL is ready to go! Here are your test accounts:');
    console.log('📧 Email: alex@vyral.com | Password: password123');
    console.log('📧 Email: jordan@vyral.com | Password: password123');
    console.log('📧 Email: sam@vyral.com | Password: password123');
    console.log('📧 Email: riley@vyral.com | Password: password123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Initialize database and seed
async function init() {
  try {
    await db.initialize();
    await seedDatabase();
  } catch (error) {
    console.error('Initialization failed:', error);
    process.exit(1);
  }
}

init();