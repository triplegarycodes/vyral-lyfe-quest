const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const db = require('./database');

// JWT Strategy
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [payload.id]);
    const user = result.rows[0];
    
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let result = await db.query('SELECT * FROM users WHERE google_id = $1', [profile.id]);
    let user = result.rows[0];
    
    if (user) {
      return done(null, user);
    }
    
    // Check if user exists with this email
    result = await db.query('SELECT * FROM users WHERE email = $1', [profile.emails[0].value]);
    user = result.rows[0];
    
    if (user) {
      // Link Google account to existing user
      await db.query(
        'UPDATE users SET google_id = $1, avatar_url = $2 WHERE id = $3',
        [profile.id, profile.photos[0].value, user.id]
      );
      user.google_id = profile.id;
      user.avatar_url = profile.photos[0].value;
      return done(null, user);
    }
    
    // Create new user
    const username = profile.emails[0].value.split('@')[0] + '_' + Math.random().toString(36).substring(7);
    const newUserResult = await db.query(`
      INSERT INTO users (email, username, google_id, display_name, avatar_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      profile.emails[0].value,
      username,
      profile.id,
      profile.displayName,
      profile.photos[0].value
    ]);
    
    return done(null, newUserResult.rows[0]);
  } catch (error) {
    return done(error, null);
  }
}));

module.exports = passport;