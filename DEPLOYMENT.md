# VYRAL Deployment Guide 🚀

## Quick Start

1. **Run the setup script:**
   ```bash
   ./setup.sh
   ```

2. **Set up PostgreSQL database:**
   ```sql
   CREATE DATABASE vyral_db;
   CREATE USER vyral_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE vyral_db TO vyral_user;
   ```

3. **Update environment variables:**
   - Edit `server/.env` with your database credentials
   - Edit `client/.env` if needed

4. **Initialize database:**
   ```bash
   npm run seed
   ```

5. **Start development:**
   ```bash
   npm run dev
   ```

## Environment Variables

### Server (.env)
```env
DATABASE_URL=postgresql://username:password@localhost:5432/vyral_db
JWT_SECRET=your-generated-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=your-openai-api-key
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
```

### Client (.env)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

## Production Deployment

### Using Docker

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

### Manual Deployment

1. **Build the client:**
   ```bash
   cd client
   npm run build
   ```

2. **Set production environment:**
   ```bash
   export NODE_ENV=production
   ```

3. **Start the server:**
   ```bash
   cd server
   npm start
   ```

### Heroku Deployment

1. **Install Heroku CLI and login**

2. **Create Heroku app:**
   ```bash
   heroku create vyral-app
   ```

3. **Add PostgreSQL addon:**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

4. **Set environment variables:**
   ```bash
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set GOOGLE_CLIENT_ID=your-google-client-id
   heroku config:set GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

6. **Run database seeding:**
   ```bash
   heroku run npm run seed
   ```

### Vercel + Railway

1. **Deploy frontend to Vercel:**
   - Connect GitHub repo to Vercel
   - Set build command: `cd client && npm run build`
   - Set output directory: `client/build`

2. **Deploy backend to Railway:**
   - Connect GitHub repo to Railway
   - Add PostgreSQL plugin
   - Set start command: `cd server && npm start`

## Database Migrations

For production updates, you may need to run migrations:

```bash
cd server
npm run migrate
```

## Monitoring & Logging

- Server logs are output to console
- Use PM2 for production process management:
  ```bash
  npm install -g pm2
  pm2 start server/index.js --name vyral-server
  ```

## SSL/HTTPS

For production, ensure you have SSL certificates:
- Use Let's Encrypt for free certificates
- Configure reverse proxy with Nginx
- Update CLIENT_URL to use https://

## Performance Optimization

1. **Enable gzip compression**
2. **Use CDN for static assets**
3. **Implement Redis for session storage**
4. **Add database indexes for better performance**

## Security Checklist

- [ ] Strong JWT secret (64+ characters)
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Database credentials secured
- [ ] HTTPS enabled in production
- [ ] Input validation on all endpoints

## Demo Account

After seeding, you can use these demo accounts:

- **Email:** alex@vyral.com | **Password:** password123
- **Email:** jordan@vyral.com | **Password:** password123
- **Email:** sam@vyral.com | **Password:** password123
- **Email:** riley@vyral.com | **Password:** password123

## Troubleshooting

### Common Issues

1. **Database connection fails:**
   - Check PostgreSQL is running
   - Verify DATABASE_URL format
   - Ensure database exists

2. **JWT errors:**
   - Check JWT_SECRET is set
   - Verify token format

3. **CORS issues:**
   - Check CLIENT_URL matches frontend URL
   - Verify CORS configuration

4. **Build fails:**
   - Check Node.js version (16+)
   - Clear node_modules and reinstall
   - Check for missing dependencies

### Getting Help

- Check the console logs for detailed error messages
- Ensure all environment variables are properly set
- Verify database connection and schema

## Features Status

✅ **Completed:**
- Authentication system (JWT + Google OAuth)
- User management and profiles
- Goal tracking (LyfeBoard)
- Challenge system (VybeStrike)
- Real-time notifications
- Gaming-inspired UI with animations

🚧 **In Development:**
- VybeTree (milestone visualization)
- VybeZone (peer mentorship)
- V-Shop (virtual rewards)
- MoneyMoves (budgeting gamification)
- B-Vyral (creative content feed)
- Skrybe (AI companion)

The core functionality is ready to use, with additional features being developed!